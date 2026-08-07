/** Must match the `pyodide` devDependency — a unit test asserts it rather than trusting a comment. */
export const PYODIDE_VERSION = "0.24.1";

export const PYODIDE_INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

/** Jedi — the same completion engine IPython/Jupyter use; completes against the live namespace. */
export const REPL_COMPLETION_PACKAGES = ["jedi==0.19.2"];

/** Shared by the served URL path and provision-repl-wheels.mjs's output dir. `.gitignore` repeats it. */
export const REPL_WHEELS_DIRECTORY_NAME = "repl-wheels";

/** Same-origin (no CORS). The host must serve the AX profile wheels here — see README. */
export const REPL_DEFAULT_WHEEL_BASE_URL = `/${REPL_WHEELS_DIRECTORY_NAME}`;

/** Generated from AX during prestart/prebuild; neither file is an MD-owned package manifest. */
export const REPL_REQUIREMENTS_URL = "/repl-config.yml";
export const REPL_PYODIDE_LOCK_URL = "/repl-pyodide-lock.json";
export const REPL_DEFAULT_PROFILE = "made"; // change to "repl" when ready

export interface PyodideLock {
    packages?: Record<string, { file_name?: string }>;
}

/** The bootstrap wheel AX ships in its Pyodide lock under the `mat3ra` package. */
export function getNotebooksUtilsWheelFilename(lockContent: string): string {
    const filename = (JSON.parse(lockContent) as PyodideLock).packages?.mat3ra?.file_name;
    if (!filename) throw new Error("AX Pyodide lock does not contain the notebooks-utils wheel.");
    return filename;
}
