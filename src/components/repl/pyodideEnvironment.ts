/**
 * The Python environment for the Materials REPL: Pyodide plus the packages that make
 * `mat3ra.made.tools` importable in the browser.
 *
 * The install order below is load-bearing and mirrors the environment the production JupyterLite
 * kernel builds from AX's `config.yml` (`made` profile).
 *
 * TODO(repl-v4): replace these hardcoded lists with that manifest, read at build time, so this
 * environment and JupyterLite's cannot drift — see agents/plan/repl-minimal-architecture.md §5.
 */

/** Pinned rather than floating: an interpreter upgrade can break the prebuilt wheels below. */
export const PYODIDE_VERSION = "0.24.1";

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const PYODIDE_SCRIPT_URL = `${PYODIDE_INDEX_URL}pyodide.js`;

/** Where the host app serves the wheels; see the hosting note in README section 3.7. */
export const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";

/** Pyodide's own builds, fetched from its CDN alongside the interpreter. */
const PYODIDE_BUILT_IN_PACKAGES = [
    "micropip",
    "numpy",
    "scipy",
    "typing-extensions",
    "lzma",
    "sqlite3",
    "ssl",
];

/** Pure-python pins from PyPI, installed with their dependencies. */
const PYPI_PINNED_PACKAGES = [
    "annotated_types>=0.6.0",
    "networkx==3.2.1",
    "monty==2023.11.3",
    "tabulate==0.9.0",
    "sympy==1.12",
    "uncertainties==3.1.6",
    "ase==3.25.0",
];

/**
 * Prebuilt pure-python wheels for packages whose PyPI releases do not build under Pyodide.
 * Served by the host app (same origin — browsers block cross-origin wheel fetches without CORS);
 * `scripts/provision-repl-wheels.mjs` downloads them from the JupyterLite deploy, which already
 * hosts them for the production kernel.
 */
export const REPL_WHEEL_FILENAMES = [
    "pydantic_core-2.18.2-py3-none-any.whl",
    "pydantic-2.7.1-py3-none-any.whl",
    "spglib-2.0.2-py3-none-any.whl",
    "ruamel.yaml-0.17.32-py3-none-any.whl",
    "pymatgen-2024.4.13-py3-none-any.whl",
];

/** Installed after the wheels so their pinned dependencies are already satisfied. */
const PACKAGES_AFTER_WHEELS = [
    "pymatgen-analysis-defects<=2024.4.23",
    "mat3ra-periodic-table",
    "mat3ra-made",
];

interface Micropip {
    install: { callKwargs: (spec: string, kwargs: { deps: boolean }) => Promise<void> };
}

/** The narrow Pyodide surface this feature uses; Pyodide's script-tag build publishes no types. */
export interface Pyodide {
    loadPackage(names: string[]): Promise<void>;
    pyimport(name: string): Micropip;
    runPythonAsync(code: string): Promise<unknown>;
    globals: { set(name: string, value: unknown): void };
    setStdout(options: { batched: (text: string) => void }): void;
    setStderr(options: { batched: (text: string) => void }): void;
    FS: { mkdirTree(path: string): void; writeFile(path: string, data: Uint8Array): void };
}

let pyodideLoadPromise: Promise<Pyodide> | null = null;

/**
 * Load Pyodide once per page from the CDN, with `indexURL` passed EXPLICITLY.
 *
 * Not cove's `PyodideLoader`: it calls `loadPyodide()` bare, and this app's bundled node polyfills
 * make Pyodide's own asset detection resolve to a filesystem path — it then fetches
 * `pyodide.asm.wasm` from `/Users/…` and hangs (caught by the e2e). Passing `indexURL` is the
 * proven cure.
 *
 * TODO(repl-v3): teach cove's PyodideLoader to accept an indexURL, then delete this function.
 */
export function loadPyodideRuntime(): Promise<Pyodide> {
    if (pyodideLoadPromise) return pyodideLoadPromise;
    pyodideLoadPromise = new Promise<Pyodide>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = PYODIDE_SCRIPT_URL;
        script.onload = () => {
            const { loadPyodide } = window as unknown as {
                loadPyodide: (options: { indexURL: string }) => Promise<Pyodide>;
            };
            loadPyodide({ indexURL: PYODIDE_INDEX_URL }).then(resolve, reject);
        };
        script.onerror = () => reject(new Error(`Failed to load ${PYODIDE_SCRIPT_URL}`));
        document.body.appendChild(script);
    });
    return pyodideLoadPromise;
}

const WHEEL_FS_DIRECTORY = "/tmp/repl_wheels";

/**
 * Fetch a wheel ourselves and install it from Pyodide's virtual FS — NOT by handing micropip the
 * URL. Static servers answer a repeat page load's conditional request with a 304 and an EMPTY body,
 * which micropip tries to unzip ("BadZipFile"). Fetching with `force-cache` lets the browser
 * resolve its cached copy to a complete body first. Wheel filenames carry versions, so caching them
 * is safe and makes repeat environment loads substantially cheaper.
 */
async function fetchWheelToFS(
    pyodide: Pyodide,
    wheelBaseUrl: string,
    filename: string,
): Promise<string> {
    const response = await fetch(`${wheelBaseUrl}/${filename}`, { cache: "force-cache" });
    if (!response.ok) {
        throw new Error(`Failed to fetch wheel ${filename}: HTTP ${response.status}`);
    }
    const fsPath = `${WHEEL_FS_DIRECTORY}/${filename}`;
    pyodide.FS.writeFile(fsPath, new Uint8Array(await response.arrayBuffer()));
    return fsPath;
}

/**
 * Build the materials environment inside an already-loaded Pyodide. Sequential on purpose: order
 * matters, and logging before each install is what makes the ~30 s first load legible to the user.
 *
 * TODO(repl-v3): this install engine is domain-free and graduates to cove's Python session; only
 * the package lists above stay behind (until repl-v4 moves those to the AX manifest).
 */
export async function buildMaterialsReplEnvironment(
    pyodide: Pyodide,
    wheelBaseUrl: string,
    log: (message: string) => void,
): Promise<void> {
    log("Loading base packages (NumPy, SciPy)…");
    await pyodide.loadPackage(PYODIDE_BUILT_IN_PACKAGES);
    const micropip = pyodide.pyimport("micropip");

    // Sequential reduce chains rather than loops: order matters, and per-item logging before each
    // install is what keeps the wait legible.
    const installInOrder = (specs: string[], deps: boolean, label: string): Promise<void> =>
        specs.reduce(
            (previous, spec, index) =>
                previous.then(() => {
                    log(`${label} (${index + 1}/${specs.length}): ${spec}`);
                    return micropip.install.callKwargs(spec, { deps });
                }),
            Promise.resolve(),
        );

    await installInOrder(PYPI_PINNED_PACKAGES, true, "Installing dependency");

    pyodide.FS.mkdirTree(WHEEL_FS_DIRECTORY);
    await REPL_WHEEL_FILENAMES.reduce(
        (previous, filename, index) =>
            previous.then(async () => {
                log(`Installing wheel (${index + 1}/${REPL_WHEEL_FILENAMES.length}): ${filename}`);
                const fsPath = await fetchWheelToFS(pyodide, wheelBaseUrl, filename);
                // deps=False is essential: these wheels exist precisely because their transitive
                // dependencies either do not build under Pyodide or conflict with the pinned set.
                await micropip.install.callKwargs(`emfs:${fsPath}`, { deps: false });
            }),
        Promise.resolve(),
    );

    await installInOrder(PACKAGES_AFTER_WHEELS, true, "Installing package");
}
