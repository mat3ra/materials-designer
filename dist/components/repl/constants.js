/**
 * The REPL's Python environment, mirroring the production JupyterLite `made` profile.
 *
 * NOT `mat3ra-made[tools]`: that pulls pymatgen/ase/scipy from PyPI, which don't build under Pyodide.
 * Hence Pyodide-native builds + pinned pure-Python deps + prebuilt wheels.
 *
 * Values live in repl-packages.json because provision-repl-wheels.mjs and the integration test need
 * them too, and JSON is the only format all three read without a build step.
 *
 * `mat3ra-made` / `mat3ra-periodic-table` are unpinned on purpose — the REPL tracks the latest
 * published `made`. Accepted trade-off: an upstream release can break it with no change here, and
 * `npm run test:pyodide` is what catches that.
 */
import replPackages from "./repl-packages.json";
/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export const REPL_INPUT_VARIABLE_NAMES = ["materials_in", "material"];
/** Must match the `pyodide` devDependency — a unit test asserts it rather than trusting a comment. */
export const PYODIDE_VERSION = replPackages.pyodideVersion;
export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;
export const REPL_LOAD_PACKAGES = replPackages.loadPackages;
export const REPL_PYPI_PINNED_PACKAGES = replPackages.pypiPinnedPackages;
export const REPL_WHEEL_FILENAMES = replPackages.wheelFilenames;
export const REPL_MAT3RA_PACKAGES = replPackages.mat3raPackages;
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export const REPL_COMPLETION_PACKAGES = replPackages.completionPackages;
/** Shared by the served URL path and provision-repl-wheels.mjs's output dir. `.gitignore` repeats it. */
export const REPL_WHEELS_DIRECTORY_NAME = replPackages.wheelsDirectoryName;
/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here — see README. */
export const REPL_DEFAULT_WHEEL_BASE_URL = `/${REPL_WHEELS_DIRECTORY_NAME}`;
