import DataBridge from "@mat3ra/cove/dist/other/iframe-messaging/DataBridge";
import InPageTransport from "@mat3ra/cove/dist/other/iframe-messaging/InPageTransport";
import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { Action } from "@mat3ra/esse/dist/js/types";

import type { MDMaterial } from "../../MDMaterial";
import {
    PYODIDE_INDEX_URL,
    REPL_COMPLETION_PACKAGES,
    REPL_DEFAULT_WHEEL_BASE_URL,
    REPL_LOAD_PACKAGES,
    REPL_MAT3RA_PACKAGES,
    REPL_PYPI_PINNED_PACKAGES,
    REPL_WHEEL_FILENAMES,
} from "./constants";
import {
    type MaterialsSyncPayload,
    createMaterialsDataBridgeHandlers,
} from "./materialsDataBridge";

const MATERIAL_PREAMBLE = `
from mat3ra.notebooks_utils.preamble.material import *
from mat3ra.notebooks_utils.core.entity.material.io import get_materials as _get_materials, sync_materials as _sync_materials
`;

/** Persistent Materials Designer namespace connected through the generic in-page data bridge. */
export class MaterialsReplSession extends PyodideSession {
    private bridge?: DataBridge;

    private getMaterials: () => MDMaterial[] = () => [];

    private getActiveIndex = () => 0;

    private syncMaterials: (payload: MaterialsSyncPayload) => void = () => undefined;

    constructor() {
        super({
            indexUrl: PYODIDE_INDEX_URL,
            loadPackages: REPL_LOAD_PACKAGES,
            pypiPinnedPackages: REPL_PYPI_PINNED_PACKAGES,
            wheelFilenames: REPL_WHEEL_FILENAMES,
            postWheelPackages: [...REPL_MAT3RA_PACKAGES, ...REPL_COMPLETION_PACKAGES],
            wheelBaseUrl: REPL_DEFAULT_WHEEL_BASE_URL,
        });
    }

    connect(
        getMaterials: () => MDMaterial[],
        getActiveIndex: () => number,
        syncMaterials: (payload: MaterialsSyncPayload) => void,
    ): void {
        this.getMaterials = getMaterials;
        this.getActiveIndex = getActiveIndex;
        this.syncMaterials = syncMaterials;
        if (this.bridge) return;

        const transport = new InPageTransport((action, payload) => {
            this.py.globals.set("data_from_host_action", action);
            this.py.globals.set("data_from_host", this.py.toPy(payload));
        });
        this.bridge = new DataBridge(transport);
        createMaterialsDataBridgeHandlers({
            getMaterials: () => this.getMaterials(),
            syncMaterials: (payload) => this.syncMaterials(payload),
        }).forEach(({ action, handlers }) => this.bridge?.addHandlers(action, handlers));
    }

    protected async bootstrapNamespace(log: (message: string) => void): Promise<void> {
        log("Preparing material namespace…");
        this.py.runPython(MATERIAL_PREAMBLE);
        log("Environment ready. Type to autocomplete.");
    }

    protected async beforeExecute(): Promise<void> {
        if (!this.bridge) throw new Error("MaterialsReplSession is not connected to a host.");
        await this.bridge.receive(Action.getData);
        this.py.globals.set("_repl_active_index", this.getActiveIndex());
        this.py.runPython(`
materials_in = _get_materials(globals())
material = materials_in[_repl_active_index] if 0 <= _repl_active_index < len(materials_in) else None
`);
    }

    protected async afterExecute(): Promise<void> {
        this.py.runPython("_sync_materials(globals())");
    }

    dispose(): void {
        this.bridge?.destroy();
        this.bridge = undefined;
        super.dispose();
    }
}

export const replSession = new MaterialsReplSession();
