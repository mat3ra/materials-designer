/**
 * Single source of truth for the Python REPL environment.
 *
 * The package set mirrors the `made` profile of the production JupyterLite kernel
 * (api-examples / jupyterlite `config.yml`) and is spike-verified under Pyodide 0.24.0.
 * It is intentionally NOT `mat3ra-made[tools]`: that extra resolves pymatgen/ase/scipy
 * from PyPI, which do not build under Pyodide. Instead we load Pyodide-native built-ins,
 * install pinned pure-Python deps from PyPI, and install the non-buildable deps from
 * prebuilt pure-Python wheels served over HTTP.
 *
 * The package lists themselves live in repl-packages.json, not here: scripts/provision-repl-wheels.mjs
 * and tests-pyodide/supercell.pyodide.cjs need the same lists but can't import a .ts module (one runs
 * before any build step, the other is plain CommonJS) — JSON is the one format all three can read.
 */
import replPackages from "./repl-packages.json";

/** Names bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync so re-injection does not re-add them. */
export const REPL_INPUT_VARIABLE_NAMES = ["materials_in", "material"] as const;

/**
 * Pyodide CDN base (must match cove.js's pinned Pyodide version). We load Pyodide ourselves and pass
 * this as `indexURL` explicitly: cove.js's PyodideLoader calls `loadPyodide()` with no indexURL, and
 * this app's Vite `define: { __dirname }` makes Pyodide's `calculateIndexURL()` return an absolute
 * filesystem path — so without an explicit indexURL it fetches `pyodide.asm.js` from the wrong URL.
 */
export const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/";

/** Pyodide-native (stdlib/compiled) packages loaded via `pyodide.loadPackage(...)`. */
export const REPL_LOAD_PACKAGES = replPackages.loadPackages;

/** Pure-Python PyPI deps installed with `micropip.install(deps=True)`, pinned to the made profile. */
export const REPL_PYPI_PINNED_PACKAGES = replPackages.pypiPinnedPackages;

/**
 * Prebuilt pure-Python wheels installed by URL. Filenames are resolved against the wheel base URL.
 * These MUST be installed with `deps=False` — otherwise micropip tries to resolve compiled
 * transitive deps (ruamel-yaml-clib) or conflicts with the monty pin.
 */
export const REPL_WHEEL_FILENAMES = replPackages.wheelFilenames;

/** mat3ra packages installed with `micropip.install(deps=True)` after the wheels are present. */
export const REPL_MAT3RA_PACKAGES = replPackages.mat3raPackages;

/**
 * Editor completion engine: Jedi — the same static-analysis library IPython/Jupyter use for tab
 * completion. Pure-Python (pulls `parso`), installed with `deps=True`. `jedi.Interpreter(src, [ns])`
 * completes against the live namespace, so it knows the user's variables, attributes and imports —
 * not just a static function list.
 */
export const REPL_COMPLETION_PACKAGES = replPackages.completionPackages;

/**
 * Where the prebuilt wheels are served. Same-origin is recommended (no CORS). The host app must
 * serve the {@link REPL_WHEEL_FILENAMES} files under this path (e.g. copy them into `public/`).
 * Overridable via {@link PyodideSession.configure}.
 */
export const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";

/**
 * Where wheel bytes are written in Pyodide's virtual filesystem before installing via `emfs:`. We
 * fetch wheels ourselves (`cache: "no-store"`) rather than handing micropip the HTTP URL directly,
 * to avoid the static server's ETag causing a conditional-request 304 (empty body) on a repeat page
 * load, which micropip would otherwise try to unzip.
 */
export const REPL_WHEEL_FS_DIR = "/tmp/repl_wheels";
