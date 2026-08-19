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
export declare const REPL_DEFAULT_PROFILE = "made";
/**
 * TEMPORARY PIN — delete once mat3ra-notebooks-utils ships the REPL bridge in a release.
 *
 * The preamble needs `send_data` and `sync_materials`, plus a `pyodide.io` whose `js` and IPython
 * imports are optional rather than top-level. No published wheel (AX's Pyodide lock or PyPI) has any
 * of it; it exists only on api-examples `feature/SOF-7961`, whose build-wheel workflow publishes a
 * wheel to that repo's GitHub Pages. Pinning that exact build is what makes a clean checkout
 * reproducible — otherwise provisioning installs a wheel that cannot bootstrap the namespace.
 *
 * An empty string means "not pinned": provisioning then uses whatever AX's lock names, which is the
 * behaviour to return to. Override the pin with REPL_NOTEBOOKS_UTILS_WHEEL_URL.
 */
export declare const REPL_NOTEBOOKS_UTILS_WHEEL_URL = "https://mat3ra.github.io/api-examples/mat3ra_notebooks_utils-0.1.dev1+g721ae8714-py3-none-any.whl";
export interface PyodideLock {
    packages?: Record<string, {
        file_name?: string;
    }>;
}
/** The bootstrap wheel AX ships in its Pyodide lock under the `mat3ra` package. */
export declare function getNotebooksUtilsWheelFilename(lockContent: string): string;
