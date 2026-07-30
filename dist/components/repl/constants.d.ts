/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export declare const REPL_INPUT_VARIABLE_NAMES: readonly ["materials_in", "material"];
/**
 * Single source of truth for the Pyodide version. The `pyodide` npm devDependency (used by the
 * Node-side integration test) has to match; a unit test asserts that rather than trusting a comment.
 */
export declare const PYODIDE_VERSION: string;
export declare const PYODIDE_INDEX_URL: string;
export declare const REPL_LOAD_PACKAGES: string[];
export declare const REPL_PYPI_PINNED_PACKAGES: string[];
export declare const REPL_WHEEL_FILENAMES: string[];
export declare const REPL_MAT3RA_PACKAGES: string[];
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export declare const REPL_COMPLETION_PACKAGES: string[];
/**
 * Directory name shared by the served URL path and the `public/` output directory that
 * scripts/provision-repl-wheels.mjs writes into — keep them spelled once. `.gitignore` has to repeat
 * the literal (it cannot read JSON) and says so.
 */
export declare const REPL_WHEELS_DIRECTORY_NAME: string;
/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here — see README. */
export declare const REPL_DEFAULT_WHEEL_BASE_URL: string;
