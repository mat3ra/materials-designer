/** Names bound by {@link PyodideReplSession.injectMaterials}; excluded from auto-sync so re-injection does not re-add them. */
export declare const REPL_INPUT_VARIABLE_NAMES: readonly ["materials_in", "material"];
/**
 * Pyodide CDN base (must match cove.js's pinned Pyodide version). We load Pyodide ourselves and pass
 * this as `indexURL` explicitly: cove.js's PyodideLoader calls `loadPyodide()` with no indexURL, and
 * this app's Vite `define: { __dirname }` makes Pyodide's `calculateIndexURL()` return an absolute
 * filesystem path — so without an explicit indexURL it fetches `pyodide.asm.js` from the wrong URL.
 */
export declare const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/";
/** Pyodide-native (stdlib/compiled) packages loaded via `pyodide.loadPackage(...)`. */
export declare const REPL_LOAD_PACKAGES: string[];
/** Pure-Python PyPI deps installed with `micropip.install(deps=True)`, pinned to the made profile. */
export declare const REPL_PYPI_PINNED_PACKAGES: string[];
/**
 * Prebuilt pure-Python wheels installed by URL. Filenames are resolved against the wheel base URL.
 * These MUST be installed with `deps=False` — otherwise micropip tries to resolve compiled
 * transitive deps (ruamel-yaml-clib) or conflicts with the monty pin.
 */
export declare const REPL_WHEEL_FILENAMES: string[];
/** mat3ra packages installed with `micropip.install(deps=True)` after the wheels are present. */
export declare const REPL_MAT3RA_PACKAGES: string[];
/**
 * Editor completion engine: Jedi — the same static-analysis library IPython/Jupyter use for tab
 * completion. Pure-Python (pulls `parso`), installed with `deps=True`. `jedi.Interpreter(src, [ns])`
 * completes against the live namespace, so it knows the user's variables, attributes and imports —
 * not just a static function list.
 */
export declare const REPL_COMPLETION_PACKAGES: string[];
/**
 * Where the prebuilt wheels are served. Same-origin is recommended (no CORS). The host app must
 * serve the {@link REPL_WHEEL_FILENAMES} files under this path (e.g. copy them into `public/`).
 * Overridable via {@link PyodideReplSession.configure}.
 */
export declare const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";
/**
 * Where wheel bytes are written in Pyodide's virtual filesystem before installing via `emfs:`. We
 * fetch wheels ourselves (`cache: "no-store"`) rather than handing micropip the HTTP URL directly,
 * to avoid the static server's ETag causing a conditional-request 304 (empty body) on a repeat page
 * load, which micropip would otherwise try to unzip.
 */
export declare const REPL_WHEEL_FS_DIR = "/tmp/repl_wheels";
