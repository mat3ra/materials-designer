export function getNotebooksUtilsWheelFilename(lockContent) {
    var _a, _b;
    const lock = JSON.parse(lockContent);
    const filename = (_b = (_a = lock.packages) === null || _a === void 0 ? void 0 : _a.mat3ra) === null || _b === void 0 ? void 0 : _b.file_name;
    if (!filename)
        throw new Error("AX Pyodide lock does not contain the notebooks-utils wheel.");
    return filename;
}
