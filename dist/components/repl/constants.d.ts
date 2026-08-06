/** Must match the `pyodide` devDependency — a unit test asserts it rather than trusting a comment. */
export declare const PYODIDE_VERSION = "0.24.1";
export declare const PYODIDE_INDEX_URL: string;
/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export declare const REPL_COMPLETION_PACKAGES: string[];
/** Shared by the served URL path and provision-repl-wheels.mjs's output dir. `.gitignore` repeats it. */
export declare const REPL_WHEELS_DIRECTORY_NAME = "repl-wheels";
/** Same-origin (no CORS). The host must serve the AX profile wheels here — see README. */
export declare const REPL_DEFAULT_WHEEL_BASE_URL: string;
/** Generated from AX during prestart/prebuild; neither file is an MD-owned package manifest. */
export declare const REPL_REQUIREMENTS_URL = "/repl-config.yml";
export declare const REPL_PYODIDE_LOCK_URL = "/repl-pyodide-lock.json";
export declare const REPL_DEFAULT_PROFILE = "repl";
