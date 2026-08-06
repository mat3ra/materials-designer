import DataBridge from "@mat3ra/cove/dist/other/iframe-messaging/DataBridge";
import InPageTransport from "@mat3ra/cove/dist/other/iframe-messaging/InPageTransport";
import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { Action } from "@mat3ra/esse/dist/js/types";
import { PYODIDE_INDEX_URL, REPL_COMPLETION_PACKAGES, REPL_DEFAULT_WHEEL_BASE_URL, REPL_LOAD_PACKAGES, REPL_MAT3RA_PACKAGES, REPL_PYPI_PINNED_PACKAGES, REPL_WHEEL_FILENAMES, } from "./constants";
import { createMaterialsDataBridgeHandlers, } from "./materialsDataBridge";
const MATERIAL_PREAMBLE = `
from mat3ra.notebooks_utils.preamble.material import *
from mat3ra.notebooks_utils.core.entity.material.io import get_materials as _get_materials, sync_materials as _sync_materials
`;
/** Persistent Materials Designer namespace connected through the generic in-page data bridge. */
export class MaterialsReplSession extends PyodideSession {
    constructor() {
        super({
            indexUrl: PYODIDE_INDEX_URL,
            loadPackages: REPL_LOAD_PACKAGES,
            pypiPinnedPackages: REPL_PYPI_PINNED_PACKAGES,
            wheelFilenames: REPL_WHEEL_FILENAMES,
            postWheelPackages: [...REPL_MAT3RA_PACKAGES, ...REPL_COMPLETION_PACKAGES],
            wheelBaseUrl: REPL_DEFAULT_WHEEL_BASE_URL,
        });
        this.getMaterials = () => [];
        this.getActiveIndex = () => 0;
        this.syncMaterials = () => undefined;
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
        log("Preparing material namespace…");
        this.py.runPython(MATERIAL_PREAMBLE);
        log("Environment ready. Type to autocomplete.");
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
