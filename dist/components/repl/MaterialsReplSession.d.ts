import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import type { MDMaterial } from "../../MDMaterial";
import { type MaterialsSyncPayload } from "./materialsDataBridge";
/** Persistent Materials Designer namespace connected through the generic in-page data bridge. */
export declare class MaterialsReplSession extends PyodideSession {
    private bridge?;
    private getMaterials;
    private getActiveIndex;
    private syncMaterials;
    constructor();
    connect(getMaterials: () => MDMaterial[], getActiveIndex: () => number, syncMaterials: (payload: MaterialsSyncPayload) => void): void;
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    protected beforeExecute(): Promise<void>;
    protected afterExecute(): Promise<void>;
    dispose(): void;
}
export declare const replSession: MaterialsReplSession;
