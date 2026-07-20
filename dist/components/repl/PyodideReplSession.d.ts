import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
type Pyodide = any;
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
/**
 * Owns the in-process Pyodide interaction for the Material REPL. Deliberately free of React and
 * cove.js imports so it can be unit-/integration-tested in Node with a Pyodide instance injected
 * via {@link initialize}. A module-level singleton ({@link replSession}) is exported so the
 * persistent Python namespace and the variable->clientId map survive the panel being toggled.
 */
export declare class PyodideReplSession {
    private pyodide;
    private initialized;
    private running;
    private outputBuffer;
    private wheelBaseUrl;
    /** variableName -> stable client id. Authoritative for add (new name) vs update (known name). */
    private variableNameToClientId;
    /** Introspected helper-function metadata for editor autocomplete; populated by {@link initialize}. */
    private helperMeta;
    get isInitialized(): boolean;
    /** The pre-imported helper functions available in the namespace (for editor autocomplete). */
    get helpers(): ReplHelperMeta[];
    get isRunning(): boolean;
    /** Override where prebuilt wheels are fetched from (default {@link REPL_DEFAULT_WHEEL_BASE_URL}). */
    configure({ wheelBaseUrl }: {
        wheelBaseUrl?: string;
    }): void;
    /** Browser entry point: load Pyodide from the CDN (explicit indexURL) then bootstrap. Idempotent. */
    load(onProgress?: (message: string) => void): Promise<void>;
    /**
     * Bootstrap the made-profile environment on an already-loaded Pyodide instance (from the React
     * PyodideLoader in the app, or a Node-loaded instance in tests). Idempotent. `onProgress` is
     * called before each step so the UI can stream a live log during the ~30s first-time load
     * (otherwise the panel looks frozen at "Preparing…").
     */
    initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void>;
    /**
     * Bind the current designer materials into the namespace as `materials_in` (list) and
     * `material` (first/active), reconstructed from their ESSE configs.
     */
    injectMaterials(configs: MaterialSchema[], activeIndex?: number): void;
    /**
     * Run user code in the persistent namespace. Returns captured stdout plus a Jupyter-shaped
     * {@link ReplError} (null on success) — the traceback is NOT dumped into stdout, so the UI can
     * render it distinctly. Rejects overlapping runs. Snapshots Material identities before the run so
     * {@link collectChangedMaterials} can diff.
     */
    execute(code: string): Promise<ReplExecutionResult>;
    /** Read + clear the structured error the runner recorded for the last execution (null if none). */
    private get lastError();
    /**
     * Diff the namespace and return one {@link ReplSyncOperation} per newly-created or reassigned
     * Material, resolving/assigning the stable client id per variable name.
     */
    collectChangedMaterials(): ReplSyncOperation[];
    /**
     * Jedi completions for `source` at 1-based `line` / 0-based `column`, resolved against the live
     * REPL namespace (variables, attributes, modules, keywords, helpers). Returns [] if not ready.
     */
    complete(source: string, line: number, column: number): ReplCompletion[];
    /** On-demand signature + docstring for one completion `name` at the same position (for the info popup). */
    describe(source: string, line: number, column: number, name: string): ReplDescription | null;
    private assertReady;
}
/** Module-level singleton — survives panel toggles alongside the persistent `window.pyodide`. */
export declare const replSession: PyodideReplSession;
export {};
