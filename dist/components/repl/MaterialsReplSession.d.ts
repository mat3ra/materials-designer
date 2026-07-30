import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
/** `variableName` is for display only — add-vs-update is decided by `clientId`. */
export interface ReplSyncOperation {
    variableName: string;
    clientId: string;
    config: MaterialSchema;
}
/** `module` is the Python dotted path. */
export interface ReplHelperMeta {
    name: string;
    signature: string;
    doc: string;
    module: string;
}
/**
 * Used via the {@link replSession} singleton: the persistent Python namespace and the
 * variable->clientId map have to survive the panel being toggled closed and open again.
 */
export declare class MaterialsReplSession extends PyodideSession {
    /** A known variable name means update; an unknown one means append. */
    private variableNameToClientId;
    private helperMeta;
    constructor();
    get helpers(): ReplHelperMeta[];
    /**
     * `_reserved_input_names` is what stops a re-injection of the designer's materials from looking
     * like the user created them.
     */
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    /** Snapshot identities so {@link collectChangedMaterials} can tell what the run changed. */
    protected beforeExecute(): void;
    /** Binds `materials_in` (list) and `material` (the active one). */
    injectMaterials(configs: MaterialSchema[], activeIndex?: number): void;
    /** One operation per Material the run created or reassigned. */
    collectChangedMaterials(): ReplSyncOperation[];
}
/** Singleton, matching the lifetime of the persistent `window.pyodide`. */
export declare const replSession: MaterialsReplSession;
