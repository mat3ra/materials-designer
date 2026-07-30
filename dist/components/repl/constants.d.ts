/** Bound by {@link MaterialsReplSession.injectMaterials}; excluded from auto-sync on re-injection. */
export declare const REPL_INPUT_VARIABLE_NAMES: readonly ["materials_in", "material"];
/** Must match cove.js's pinned Pyodide version. */
export declare const PYODIDE_INDEX_URL = "https://cdn.jsdelivr.net/pyodide/v0.24.0/full/";
export declare const REPL_LOAD_PACKAGES: string[];
export declare const REPL_PYPI_PINNED_PACKAGES: string[];
export declare const REPL_WHEEL_FILENAMES: string[];
export declare const REPL_MAT3RA_PACKAGES: string[];
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export declare const REPL_COMPLETION_PACKAGES: string[];
/** Same-origin (no CORS). The host must serve {@link REPL_WHEEL_FILENAMES} here. */
export declare const REPL_DEFAULT_WHEEL_BASE_URL = "/repl-wheels";
export declare const REPL_WHEEL_FS_DIR = "/tmp/repl_wheels";
