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
/** Shared material handlers for iframe notebooks and the in-page Python REPL. */
export declare function createMaterialsDataBridgeHandlers({ getMaterials, setMaterials, syncMaterials, }: MaterialsBridgeOptions): MaterialsBridgeHandlerConfig[];
export {};
