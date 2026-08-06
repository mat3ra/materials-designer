import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import type { DataBridgeHandler } from "@mat3ra/cove/dist/other/iframe-messaging/DataBridge";
import { type MaterialSchema, Action } from "@mat3ra/esse/dist/js/types";

import { MDMaterial } from "../../MDMaterial";

export interface MaterialEntity {
    type: "material";
    name: string;
    config: MaterialSchema;
}

export interface MaterialsSyncPayload {
    syncScope: string;
    entities: MaterialEntity[];
}

interface MaterialsBridgeOptions {
    getMaterials: () => MDMaterial[];
    setMaterials?: (materials: MDMaterial[]) => void;
    syncMaterials?: (payload: MaterialsSyncPayload) => void;
}

export interface MaterialsBridgeHandlerConfig {
    action: Action;
    handlers: DataBridgeHandler[];
}

function validateMaterialConfigs(configs: MaterialSchema[]): MDMaterial[] {
    return configs.reduce((materials, config) => {
        try {
            const material = new MDMaterial(config);
            material.validate();
            materials.push(material);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            showErrorAlert(`Failed to create material ${config.name}: ${message}`);
        }
        return materials;
    }, [] as MDMaterial[]);
}

/** Shared material handlers for iframe notebooks and the in-page Python REPL. */
export function createMaterialsDataBridgeHandlers({
    getMaterials,
    setMaterials,
    syncMaterials,
}: MaterialsBridgeOptions): MaterialsBridgeHandlerConfig[] {
    const handleSetData: DataBridgeHandler = (payload) => {
        const data = payload as Partial<MaterialsSyncPayload> & { materials?: unknown };
        if (typeof data.syncScope === "string" && Array.isArray(data.entities)) {
            syncMaterials?.(data as MaterialsSyncPayload);
            return;
        }
        if (!Array.isArray(data.materials)) {
            showErrorAlert("Invalid material data received");
            return;
        }
        setMaterials?.(validateMaterialConfigs(data.materials as MaterialSchema[]));
    };

    return [
        { action: Action.setData, handlers: [handleSetData] },
        {
            action: Action.getData,
            handlers: [() => getMaterials().map((material) => material.toJSON())],
        },
    ];
}
