import DataBridge from "@mat3ra/cove/dist/other/iframe-messaging/DataBridge";
import InPageTransport from "@mat3ra/cove/dist/other/iframe-messaging/InPageTransport";
import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { Action } from "@mat3ra/esse/dist/js/types";
import { PYODIDE_INDEX_URL, REPL_COMPLETION_PACKAGES, REPL_DEFAULT_WHEEL_BASE_URL, } from "./constants";
import { createMaterialsDataBridgeHandlers, } from "./materialsDataBridge";
import { getNotebooksUtilsWheelFilename } from "./requirements";
const MATERIAL_PREAMBLE = `
from mat3ra.made.tools.helpers import *
from mat3ra.notebooks_utils.core.entity.material.io import get_materials as _get_materials, sync_materials as _sync_materials
`;
/** Persistent Materials Designer namespace connected through the generic in-page data bridge. */
export class MaterialsReplSession extends PyodideSession {
    constructor() {
        super({
            indexUrl: PYODIDE_INDEX_URL,
            loadPackages: ["pyyaml"],
            postWheelPackages: REPL_COMPLETION_PACKAGES,
            wheelBaseUrl: REPL_DEFAULT_WHEEL_BASE_URL,
            wheelFsDir: "/drive/packages",
        });
        this.getMaterials = () => [];
        this.getActiveIndex = () => 0;
        this.syncMaterials = () => undefined;
        this.requirementsContent = "";
        this.requirementsProfile = "";
        this.pyodideLockPackages = new Set();
        this.stagedWheelFilenames = new Set();
    }
    configureRequirements(content, profile, pyodideLockContent) {
        if (this.isInitialized)
            return;
        this.requirementsContent = content;
        this.requirementsProfile = profile;
        const pyodideLock = JSON.parse(pyodideLockContent);
        this.pyodideLockPackages = new Set(Object.entries(pyodideLock.packages || {})
            .filter(([, entry]) => { var _a; return !((_a = entry.file_name) === null || _a === void 0 ? void 0 : _a.endsWith("none-any.whl")); })
            .map(([name]) => name));
        this.spec.wheelFilenames = [getNotebooksUtilsWheelFilename(pyodideLockContent)];
    }
    connect(getMaterials, getActiveIndex, syncMaterials) {
        this.getMaterials = getMaterials;
        this.getActiveIndex = getActiveIndex;
        this.syncMaterials = syncMaterials;
        if (this.bridge)
            return;
        const transport = new InPageTransport((action, payload) => {
            this.py.globals.set("data_from_host_action", action);
            this.py.globals.set("data_from_host", this.py.toPy(payload));
        });
        this.bridge = new DataBridge(transport);
        createMaterialsDataBridgeHandlers({
            getMaterials: () => this.getMaterials(),
            syncMaterials: (payload) => this.syncMaterials(payload),
        }).forEach(({ action, handlers }) => { var _a; return (_a = this.bridge) === null || _a === void 0 ? void 0 : _a.addHandlers(action, handlers); });
    }
    async bootstrapNamespace(log) {
        if (!this.requirementsContent || !this.requirementsProfile) {
            throw new Error("MaterialsReplSession: requirements were not configured before load.");
        }
        await this.installRequirements(this.requirementsContent, this.requirementsProfile, log);
        log("Preparing material namespace…");
        this.py.runPython(MATERIAL_PREAMBLE);
        log("Environment ready. Type to autocomplete.");
    }
    async applyRequirements(content, profile, log) {
        if (!this.isInitialized)
            throw new Error("Python environment is not ready.");
        await this.installRequirements(content, profile, log);
        this.requirementsContent = content;
        this.requirementsProfile = profile;
    }
    async installRequirements(content, profile, log) {
        this.py.FS.mkdirTree("/drive");
        this.py.FS.mkdirTree("/drive/packages");
        this.py.FS.writeFile("/drive/config.yml", content, { encoding: "utf8" });
        log(`Installing AX requirements profile '${profile}'…`);
        this.py.globals.set("_repl_requirements_profile", profile);
        const requirementsJson = await this.py.runPythonAsync(`
import json
from mat3ra.notebooks_utils.pyodide.packages.install import get_package_list_from_config
json.dumps(await get_package_list_from_config("/drive/config.yml", _repl_requirements_profile))
`);
        const requirements = JSON.parse(requirementsJson);
        const pyodidePackages = requirements
            .map((requirement) => { var _a; return (_a = requirement.replace(/^nodeps:/, "").match(/^[A-Za-z0-9_.-]+/)) === null || _a === void 0 ? void 0 : _a[0]; })
            .filter((name) => Boolean(name))
            .filter((name) => this.pyodideLockPackages.has(name.replace(/_/g, "-")));
        if (pyodidePackages.length) {
            log(`Loading ${pyodidePackages.length} package(s) from AX's Pyodide lock…`);
            await this.py.loadPackage(pyodidePackages);
        }
        const wheelPrefix = "emfs:/drive/packages/";
        const wheelFilenames = requirements
            .filter((requirement) => requirement.startsWith(wheelPrefix))
            .map((requirement) => requirement.slice(wheelPrefix.length));
        const newWheelFilenames = wheelFilenames.filter((filename) => !this.stagedWheelFilenames.has(filename));
        await this.stageWheels(newWheelFilenames, log);
        newWheelFilenames.forEach((filename) => this.stagedWheelFilenames.add(filename));
        await this.py.runPythonAsync(`
from mat3ra.notebooks_utils.pyodide.packages.install import install_packages_pyodide
await install_packages_pyodide(_repl_requirements_profile)
`);
    }
    async beforeExecute() {
        if (!this.bridge)
            throw new Error("MaterialsReplSession is not connected to a host.");
        await this.bridge.receive(Action.getData);
        this.py.globals.set("_repl_active_index", this.getActiveIndex());
        this.py.runPython(`
materials_in = _get_materials(globals())
material = materials_in[_repl_active_index] if 0 <= _repl_active_index < len(materials_in) else None
`);
    }
    async afterExecute() {
        this.py.runPython("_sync_materials(globals())");
    }
    dispose() {
        var _a;
        (_a = this.bridge) === null || _a === void 0 ? void 0 : _a.destroy();
        this.bridge = undefined;
        super.dispose();
    }
}
export const replSession = new MaterialsReplSession();
