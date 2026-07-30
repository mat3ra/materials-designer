/**
 * The Python environment for the REPL, mirroring the `made` profile of the production JupyterLite
 * kernel and spike-verified under Pyodide 0.24.0.
 *
 * Deliberately NOT `mat3ra-made[tools]`: that extra resolves pymatgen/ase/scipy from PyPI, which do
 * not build under Pyodide. Instead: Pyodide-native builds, pinned pure-Python deps, and prebuilt
 * pure-Python wheels for the rest.
 *
 * The lists live in repl-packages.json because scripts/provision-repl-wheels.mjs (ESM, runs before any
 * build) and tests-pyodide/supercell.pyodide.cjs (CommonJS) need them too, and JSON is the one format
 * all three can read.
 */
import replPackages from "./repl-packages.json";
/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export const REPL_INPUT_VARIABLE_NAMES = ["materials_in", "material"];
/** Must match cove.js's pinned Pyodide version. */
export const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/";
export const REPL_LOAD_PACKAGES = replPackages.loadPackages;
export const REPL_PYPI_PINNED_PACKAGES = replPackages.pypiPinnedPackages;
export const REPL_WHEEL_FILENAMES = replPackages.wheelFilenames;
export const REPL_MAT3RA_PACKAGES = replPackages.mat3raPackages;
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export const REPL_COMPLETION_PACKAGES = replPackages.completionPackages;
/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here. */
export const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";
export const REPL_WHEEL_FS_DIR = "/tmp/repl_wheels";
