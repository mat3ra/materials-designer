/**
 * The Python environment for the REPL, mirroring the `made` profile of the production JupyterLite
 * kernel and spike-verified under Pyodide 0.24.0.
 *
 * Deliberately NOT `mat3ra-made[tools]`: that extra resolves pymatgen/ase/scipy from PyPI, which do
 * not build under Pyodide. Instead: Pyodide-native builds, pinned pure-Python deps, and prebuilt
 * pure-Python wheels for the rest.
 *
 * Everything version- or path-shaped lives in repl-packages.json rather than here, because
 * scripts/provision-repl-wheels.mjs (ESM, runs before any build) and the Pyodide integration test
 * need the same values, and JSON is the one format all of them can read without a build step.
 *
 * On `mat3raPackages`: `mat3ra-periodic-table` and `mat3ra-made` are intentionally left unpinned so
 * the REPL tracks the latest published `made`, which is the whole point of running the real library
 * rather than a snapshot of it. The trade-off is accepted knowingly: an upstream release can break
 * the REPL with no change in this repo, and `npm run test:pyodide` (which installs the real
 * environment) is what is expected to catch that. Pin them here if that ever becomes too noisy.
 */
import replPackages from "./repl-packages.json";

/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export const REPL_INPUT_VARIABLE_NAMES = ["materials_in", "material"] as const;

/**
 * Single source of truth for the Pyodide version. The `pyodide` npm devDependency (used by the
 * Node-side integration test) has to match; a unit test asserts that rather than trusting a comment.
 */
export const PYODIDE_VERSION = replPackages.pyodideVersion;

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const REPL_LOAD_PACKAGES = replPackages.loadPackages;
export const REPL_PYPI_PINNED_PACKAGES = replPackages.pypiPinnedPackages;
export const REPL_WHEEL_FILENAMES = replPackages.wheelFilenames;
export const REPL_MAT3RA_PACKAGES = replPackages.mat3raPackages;

/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export const REPL_COMPLETION_PACKAGES = replPackages.completionPackages;

/**
 * Directory name shared by the served URL path and the `public/` output directory that
 * scripts/provision-repl-wheels.mjs writes into — keep them spelled once. `.gitignore` has to repeat
 * the literal (it cannot read JSON) and says so.
 */
export const REPL_WHEELS_DIRECTORY_NAME = replPackages.wheelsDirectoryName;

/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here — see README. */
export const REPL_DEFAULT_WHEEL_BASE_URL = `/${REPL_WHEELS_DIRECTORY_NAME}`;
