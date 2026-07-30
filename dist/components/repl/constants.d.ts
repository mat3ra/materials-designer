/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export declare const REPL_INPUT_VARIABLE_NAMES: readonly ["materials_in", "material"];
/** Must match the `pyodide` devDependency — a unit test asserts it rather than trusting a comment. */
export declare const PYODIDE_VERSION: string;
export declare const PYODIDE_INDEX_URL: string;
export declare const REPL_LOAD_PACKAGES: string[];
export declare const REPL_PYPI_PINNED_PACKAGES: string[];
export declare const REPL_WHEEL_FILENAMES: string[];
export declare const REPL_MAT3RA_PACKAGES: string[];
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export declare const REPL_COMPLETION_PACKAGES: string[];
/** Shared by the served URL path and provision-repl-wheels.mjs's output dir. `.gitignore` repeats it. */
export declare const REPL_WHEELS_DIRECTORY_NAME: string;
/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here — see README. */
export declare const REPL_DEFAULT_WHEEL_BASE_URL: string;
