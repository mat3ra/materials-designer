import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";

import { randomAlphanumeric } from "../../utils/str";
import {
    PYODIDE_INDEX_URL,
    REPL_COMPLETION_PACKAGES,
    REPL_DEFAULT_WHEEL_BASE_URL,
    REPL_INPUT_VARIABLE_NAMES,
    REPL_LOAD_PACKAGES,
    REPL_MAT3RA_PACKAGES,
    REPL_PYPI_PINNED_PACKAGES,
    REPL_WHEEL_FILENAMES,
    REPL_WHEEL_FS_DIR,
} from "./constants";
import PY_COLLECT from "./python/generated/collect";
import PY_DEFINE_COMPLETER from "./python/generated/completer";
import PY_HELPER_META from "./python/generated/helper_meta";
import PY_DEFINE_RUNNER from "./python/generated/runner";
import PY_SNAPSHOT from "./python/generated/snapshot";

// Pyodide has no published types; mirror PythonTransformation.tsx and use `any`.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pyodide = any;

let scriptLoadPromise: Promise<void> | null = null;

function injectScriptOnce(src: string): Promise<void> {
    if (scriptLoadPromise) return scriptLoadPromise;
    scriptLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script ${src}`));
        document.body.appendChild(script);
    });
    return scriptLoadPromise;
}

/**
 * Load Pyodide in the browser from the CDN with an EXPLICIT `indexURL`. We do this instead of using
 * cove.js's PyodideLoader because that calls `loadPyodide()` with no indexURL, and this app's Vite
 * `define: { __dirname }` makes Pyodide resolve its own files to an absolute filesystem path.
 * Reuses a cached `window.pyodide` if already present. Browser-only (references window/document).
 */
async function loadPyodideFromCdn(): Promise<Pyodide> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalWindow = window as any;
    if (globalWindow.pyodide) return globalWindow.pyodide;
    if (typeof globalWindow.loadPyodide !== "function") {
        await injectScriptOnce(`${PYODIDE_INDEX_URL}pyodide.js`);
    }
    globalWindow.pyodide = await globalWindow.loadPyodide({ indexURL: PYODIDE_INDEX_URL });
    return globalWindow.pyodide;
}

/**
 * One operation the reducer should apply: the ESSE config produced by a changed Python
 * variable, tagged with the stable client id the session assigned to that variable name.
 * `variableName` is carried for display; add-vs-update is decided by `clientId`.
 */
export interface ReplSyncOperation {
    variableName: string;
    clientId: string;
    config: MaterialSchema;
}

/**
 * Introspected metadata for one pre-imported helper function, used to drive editor autocomplete.
 * Produced by {@link PY_HELPER_META}; `module` is the Python dotted path (used to derive a category).
 */
export interface ReplHelperMeta {
    name: string;
    signature: string;
    doc: string;
    module: string;
}

/**
 * A Python error in the nbformat/Jupyter shape (`ename`/`evalue`/`traceback`), so the UI can render
 * it the way notebooks/IDEs do: a bold `ename: evalue` headline + the cleaned traceback. Produced by
 * {@link PY_DEFINE_RUNNER}, which strips its own runner frame so the traceback starts at user code.
 */
export interface ReplError {
    ename: string;
    evalue: string;
    traceback: string;
}

/** Result of one {@link PyodideReplSession.execute}. `error` is null on success. */
export interface ReplExecutionResult {
    ok: boolean;
    output: string;
    error: ReplError | null;
}

/** One editor completion candidate from Jedi. `type` is Jedi's kind (function/instance/module/…). */
export interface ReplCompletion {
    name: string;
    type: string;
}

/** On-demand signature + docstring for a highlighted completion (from Jedi). */
export interface ReplDescription {
    signature: string;
    docstring: string;
}

// Private alias so user code that rebinds `Material` cannot break our isinstance checks;
// the leading underscore also excludes it from the collected globals.
const PY_IMPORT_MATERIAL = "from mat3ra.made.material import Material as _ReplMaterial";

// Pull the full curated helper API (create_supercell, create_slab, create_interface_*, the defect
// helpers, …) into the namespace so users never have to write import lines. `helpers.__all__`
// bounds the `*`, so only the ~45 public names land — not private internals.
const PY_IMPORT_HELPERS = "from mat3ra.made.tools.helpers import *";

// Introspect the helper API once so the editor can offer categorized autocomplete that always
// matches the actually-installed package (no hand-maintained list to drift). One record per
// callable in __all__; underscore-prefixed locals keep this out of the collected globals.
// (source: ./python/helper_meta.py)

// Records object identity of every in-scope Material BEFORE user code runs, so we can tell
// afterwards which bindings this execution actually created or replaced (not merely which exist).
// (source: ./python/snapshot.py)

// Emits only Materials whose binding is new or changed, excluding the injected inputs
// (which "Reload inputs" rebinds) and private names. Wire keys are snake_case (produced by Python).
// (source: ./python/collect.py)

// Defines the runner used by execute(). Runs user code in the persistent globals (so bindings persist
// and top-level `await` works, via eval_code_async) and, on failure, records a Jupyter-shaped error
// in `_repl_last_error` with THIS runner's frame stripped (tb_next) — so the traceback starts at the
// user's own code instead of the Pyodide internals.
// (source: ./python/runner.py)

// Defines the Jedi-backed completion helpers used by complete()/describe(). Jedi's Interpreter
// completes against the live REPL globals — so it offers the user's variables, their attributes,
// imported modules and keywords, not just the pre-imported helper functions. Signature/docstring are
// resolved on demand (describe) to keep per-keystroke completion fast. Underscore-prefixed names keep
// these out of the Material collection.
// (source: ./python/completer.py)

/**
 * Owns the in-process Pyodide interaction for the Material REPL. Deliberately free of React and
 * cove.js imports so it can be unit-/integration-tested in Node with a Pyodide instance injected
 * via {@link initialize}. A module-level singleton ({@link replSession}) is exported so the
 * persistent Python namespace and the variable->clientId map survive the panel being toggled.
 */
export class PyodideReplSession {
    private pyodide: Pyodide = null;

    private initialized = false;

    private running = false;

    private outputBuffer = "";

    private wheelBaseUrl = REPL_DEFAULT_WHEEL_BASE_URL;

    /** variableName -> stable client id. Authoritative for add (new name) vs update (known name). */
    private variableNameToClientId = new Map<string, string>();

    /** Introspected helper-function metadata for editor autocomplete; populated by {@link initialize}. */
    private helperMeta: ReplHelperMeta[] = [];

    get isInitialized(): boolean {
        return this.initialized;
    }

    /** The pre-imported helper functions available in the namespace (for editor autocomplete). */
    get helpers(): ReplHelperMeta[] {
        return this.helperMeta;
    }

    get isRunning(): boolean {
        return this.running;
    }

    /** Override where prebuilt wheels are fetched from (default {@link REPL_DEFAULT_WHEEL_BASE_URL}). */
    configure({ wheelBaseUrl }: { wheelBaseUrl?: string }): void {
        if (wheelBaseUrl) this.wheelBaseUrl = wheelBaseUrl.replace(/\/$/, "");
    }

    /** Browser entry point: load Pyodide from the CDN (explicit indexURL) then bootstrap. Idempotent. */
    async load(onProgress?: (message: string) => void): Promise<void> {
        if (this.initialized) return;
        onProgress?.("Loading Pyodide runtime from CDN…");
        const pyodide = await loadPyodideFromCdn();
        await this.initialize(pyodide, onProgress);
    }

    /**
     * Bootstrap the made-profile environment on an already-loaded Pyodide instance (from the React
     * PyodideLoader in the app, or a Node-loaded instance in tests). Idempotent. `onProgress` is
     * called before each step so the UI can stream a live log during the ~30s first-time load
     * (otherwise the panel looks frozen at "Preparing…").
     */
    async initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void> {
        if (this.initialized) return;
        this.pyodide = pyodide;
        const log = (message: string) => onProgress?.(message);

        // stdout/stderr -> buffer, per https://pyodide.org/en/stable/usage/streams.html
        const appendOutput = (text: string) => {
            this.outputBuffer += `${text}\n`;
        };
        pyodide.setStdout({ batched: appendOutput });
        pyodide.setStderr({ batched: appendOutput });

        log("Loading base packages (numpy, scipy, …)…");
        await pyodide.loadPackage(["micropip", ...REPL_LOAD_PACKAGES]);
        const micropip = pyodide.pyimport("micropip");

        // Install sequentially (order matters): pinned pure deps, then the wheels (deps=False is
        // essential — see constants.ts), then the mat3ra packages. Log each package before it
        // installs so the user sees steady progress instead of a frozen spinner.
        const installInOrder = (specs: string[], deps: boolean, label: string): Promise<void> =>
            specs.reduce((previous, spec, index) => {
                const name = spec.split("/").pop() || spec;
                return previous.then(() => {
                    log(`${label} (${index + 1}/${specs.length}): ${name}`);
                    return micropip.install.callKwargs(spec, { deps });
                });
            }, Promise.resolve());

        await installInOrder(REPL_PYPI_PINNED_PACKAGES, true, "Installing dependency");

        // Wheels are fetched with `cache: "no-store"` and written into Pyodide's virtual FS ourselves,
        // then installed via `emfs:` — NOT by handing micropip the HTTP URL directly. A same-origin
        // static file server (Vite's included) serves these with an ETag; on a repeat page load the
        // browser sends a conditional request and gets back a 304 with an EMPTY body, which micropip
        // then tries to unzip -> `BadZipFile: File is not a zip file`. Fetching ourselves sidesteps
        // that entirely (and appending a cache-busting query param instead is unsafe: micropip parses
        // the package name/version out of the URL's `.whl` filename, which a query string would break).
        pyodide.FS.mkdirTree(REPL_WHEEL_FS_DIR);
        const installWheel = async (filename: string, index: number): Promise<void> => {
            log(`Installing wheel (${index + 1}/${REPL_WHEEL_FILENAMES.length}): ${filename}`);
            const response = await fetch(`${this.wheelBaseUrl}/${filename}`, { cache: "no-store" });
            if (!response.ok) {
                throw new Error(`Failed to fetch wheel ${filename}: HTTP ${response.status}`);
            }
            const bytes = new Uint8Array(await response.arrayBuffer());
            const fsPath = `${REPL_WHEEL_FS_DIR}/${filename}`;
            pyodide.FS.writeFile(fsPath, bytes);
            await micropip.install.callKwargs(`emfs:${fsPath}`, { deps: false });
        };
        await REPL_WHEEL_FILENAMES.reduce(
            (previous, filename, index) => previous.then(() => installWheel(filename, index)),
            Promise.resolve(),
        );

        await installInOrder(REPL_MAT3RA_PACKAGES, true, "Installing package");
        await installInOrder(REPL_COMPLETION_PACKAGES, true, "Installing completion engine");

        log("Importing mat3ra.made.tools helpers…");
        pyodide.runPython(PY_IMPORT_MATERIAL);
        pyodide.runPython(PY_IMPORT_HELPERS);
        pyodide.runPython(PY_HELPER_META);
        this.helperMeta = JSON.parse(pyodide.runPython("_repl_helper_meta_json"));
        pyodide.globals.set("_reserved_input_names", pyodide.toPy([...REPL_INPUT_VARIABLE_NAMES]));
        pyodide.runPython(PY_DEFINE_RUNNER);
        pyodide.runPython(PY_DEFINE_COMPLETER);
        this.initialized = true;
        log(
            `Environment ready — ${this.helperMeta.length} helpers pre-imported. Type to autocomplete.`,
        );
    }

    /**
     * Bind the current designer materials into the namespace as `materials_in` (list) and
     * `material` (first/active), reconstructed from their ESSE configs.
     */
    injectMaterials(configs: MaterialSchema[], activeIndex = 0): void {
        this.assertReady();
        this.pyodide.globals.set("_repl_injected_json", JSON.stringify(configs));
        this.pyodide.globals.set("_repl_active_index", activeIndex);
        this.pyodide.runPython(`
import json as _json
_repl_in = [_ReplMaterial.create_from_config_or_class_instance(_c) for _c in _json.loads(_repl_injected_json)]
materials_in = _repl_in
material = _repl_in[_repl_active_index] if (_repl_in and 0 <= _repl_active_index < len(_repl_in)) else (_repl_in[0] if _repl_in else None)
`);
    }

    /**
     * Run user code in the persistent namespace. Returns captured stdout plus a Jupyter-shaped
     * {@link ReplError} (null on success) — the traceback is NOT dumped into stdout, so the UI can
     * render it distinctly. Rejects overlapping runs. Snapshots Material identities before the run so
     * {@link collectChangedMaterials} can diff.
     */
    async execute(code: string): Promise<ReplExecutionResult> {
        this.assertReady();
        if (this.running) throw new Error("A REPL execution is already in flight.");
        this.running = true;
        this.outputBuffer = "";
        try {
            this.pyodide.runPython(PY_SNAPSHOT);
            this.pyodide.globals.set("_repl_src", code);
            // The runner catches user errors internally, so this only rejects on infra failures.
            await this.pyodide.runPythonAsync("await _repl_execute(_repl_src)");
            return { ok: !this.lastError, output: this.outputBuffer, error: this.lastError };
        } finally {
            this.running = false;
        }
    }

    /** Read + clear the structured error the runner recorded for the last execution (null if none). */
    private get lastError(): ReplError | null {
        const raw = this.pyodide.globals.get("_repl_last_error");
        if (!raw) return null;
        const error = (
            raw.toJs ? raw.toJs({ dict_converter: Object.fromEntries }) : raw
        ) as ReplError;
        if (raw.destroy) raw.destroy();
        return error;
    }

    /**
     * Diff the namespace and return one {@link ReplSyncOperation} per newly-created or reassigned
     * Material, resolving/assigning the stable client id per variable name.
     */
    collectChangedMaterials(): ReplSyncOperation[] {
        this.assertReady();
        this.pyodide.runPython(PY_COLLECT);
        const changed: { variable_name: string; config: MaterialSchema }[] = JSON.parse(
            this.pyodide.runPython("_repl_export"),
        );
        return changed.map(({ variable_name: variableName, config }) => {
            let clientId = this.variableNameToClientId.get(variableName);
            if (!clientId) {
                clientId = randomAlphanumeric(12);
                this.variableNameToClientId.set(variableName, clientId);
            }
            return { variableName, clientId, config };
        });
    }

    /**
     * Jedi completions for `source` at 1-based `line` / 0-based `column`, resolved against the live
     * REPL namespace (variables, attributes, modules, keywords, helpers). Returns [] if not ready.
     */
    complete(source: string, line: number, column: number): ReplCompletion[] {
        if (!this.initialized) return [];
        this.pyodide.globals.set("_repl_c_src", source);
        return JSON.parse(
            this.pyodide.runPython(`_repl_complete(_repl_c_src, ${line}, ${column})`),
        );
    }

    /** On-demand signature + docstring for one completion `name` at the same position (for the info popup). */
    describe(source: string, line: number, column: number, name: string): ReplDescription | null {
        if (!this.initialized) return null;
        this.pyodide.globals.set("_repl_c_src", source);
        this.pyodide.globals.set("_repl_c_name", name);
        return JSON.parse(
            this.pyodide.runPython(`_repl_describe(_repl_c_src, ${line}, ${column}, _repl_c_name)`),
        );
    }

    private assertReady(): void {
        if (!this.initialized) throw new Error("PyodideReplSession is not initialized.");
    }
}

/** Module-level singleton — survives panel toggles alongside the persistent `window.pyodide`. */
export const replSession = new PyodideReplSession();
