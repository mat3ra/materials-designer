interface PyodideLock {
    packages?: Record<string, { file_name?: string }>;
}

export function getNotebooksUtilsWheelFilename(lockContent: string): string {
    const lock = JSON.parse(lockContent) as PyodideLock;
    const filename = lock.packages?.mat3ra?.file_name;
    if (!filename) throw new Error("AX Pyodide lock does not contain the notebooks-utils wheel.");
    return filename;
}
