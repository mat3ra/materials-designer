/**
 * Single source of truth for the Python REPL environment.
 *
 * The package set mirrors the `made` profile of the production JupyterLite kernel
 * (api-examples / jupyterlite `config.yml`) and is spike-verified under Pyodide 0.24.0.
 * It is intentionally NOT `mat3ra-made[tools]`: that extra resolves pymatgen/ase/scipy
 * from PyPI, which do not build under Pyodide. Instead we load Pyodide-native built-ins,
 * install pinned pure-Python deps from PyPI, and install the non-buildable deps from
 * prebuilt pure-Python wheels served over HTTP.
 */

/** Names bound by {@link PyodideReplSession.injectMaterials}; excluded from auto-sync so re-injection does not re-add them. */
export const REPL_INPUT_VARIABLE_NAMES = ["materials_in", "material"] as const;

/**
 * Pyodide CDN base (must match cove.js's pinned Pyodide version). We load Pyodide ourselves and pass
 * this as `indexURL` explicitly: cove.js's PyodideLoader calls `loadPyodide()` with no indexURL, and
 * this app's Vite `define: { __dirname }` makes Pyodide's `calculateIndexURL()` return an absolute
 * filesystem path — so without an explicit indexURL it fetches `pyodide.asm.js` from the wrong URL.
 */
export const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/";

/** Pyodide-native (stdlib/compiled) packages loaded via `pyodide.loadPackage(...)`. */
export const REPL_LOAD_PACKAGES = ["numpy", "scipy", "typing-extensions", "lzma", "sqlite3", "ssl"];

/** Pure-Python PyPI deps installed with `micropip.install(deps=True)`, pinned to the made profile. */
export const REPL_PYPI_PINNED_PACKAGES = [
    "annotated_types>=0.6.0",
    "networkx==3.2.1",
    "monty==2023.11.3",
    "tabulate==0.9.0",
    "sympy==1.12",
    "uncertainties==3.1.6",
    "ase==3.25.0",
];

/**
 * Prebuilt pure-Python wheels installed by URL. Filenames are resolved against the wheel base URL.
 * These MUST be installed with `deps=False` — otherwise micropip tries to resolve compiled
 * transitive deps (ruamel-yaml-clib) or conflicts with the monty pin.
 */
export const REPL_WHEEL_FILENAMES = [
    "pydantic_core-2.18.2-py3-none-any.whl",
    "pydantic-2.7.1-py3-none-any.whl",
    "spglib-2.0.2-py3-none-any.whl",
    "ruamel.yaml-0.17.32-py3-none-any.whl",
    "pymatgen-2024.4.13-py3-none-any.whl",
];

/** mat3ra packages installed with `micropip.install(deps=True)` after the wheels are present. */
export const REPL_MAT3RA_PACKAGES = [
    "pymatgen-analysis-defects<=2024.4.23",
    "mat3ra-periodic-table",
    "mat3ra-made",
];

/**
 * Editor completion engine: Jedi — the same static-analysis library IPython/Jupyter use for tab
 * completion. Pure-Python (pulls `parso`), installed with `deps=True`. `jedi.Interpreter(src, [ns])`
 * completes against the live namespace, so it knows the user's variables, attributes and imports —
 * not just a static function list.
 */
export const REPL_COMPLETION_PACKAGES = ["jedi==0.19.2"];

/**
 * Where the prebuilt wheels are served. Same-origin is recommended (no CORS). The host app must
 * serve the {@link REPL_WHEEL_FILENAMES} files under this path (e.g. copy them into `public/`).
 * Overridable via {@link PyodideReplSession.configure}.
 */
export const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";

/**
 * Where wheel bytes are written in Pyodide's virtual filesystem before installing via `emfs:`. We
 * fetch wheels ourselves (`cache: "no-store"`) rather than handing micropip the HTTP URL directly,
 * to avoid the static server's ETag causing a conditional-request 304 (empty body) on a repeat page
 * load, which micropip would otherwise try to unzip.
 */
export const REPL_WHEEL_FS_DIR = "/tmp/repl_wheels";
