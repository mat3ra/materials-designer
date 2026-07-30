import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
/**
 * One operation the reducer should apply: the ESSE config produced by a changed Python
 * variable, tagged with the stable client id the session assigned to that variable name.
 * `variableName` is carried for display; add-vs-update is decided by `clientId`.
 */
export interface ReplSyncOperation {
    variableName: string;
    clientId: string;
    config: MaterialSchema;
}
/**
 * Introspected metadata for one pre-imported helper function, used to drive editor autocomplete.
 * Produced by {@link PY_HELPER_META}; `module` is the Python dotted path (used to derive a category).
 */
export interface ReplHelperMeta {
    name: string;
    signature: string;
    doc: string;
    module: string;
}
/**
 * The Materials Designer flavour of cove's {@link PyodideSession}: everything Material-specific and
 * nothing else. The generic half — loading Pyodide, installing the environment, running code in a
 * persistent namespace, Jupyter-shaped errors, Jedi completions — lives in cove and is shared.
 *
 * What this adds:
 *  - pre-imports `mat3ra.made.tools.helpers` and introspects it for autocomplete ({@link helpers})
 *  - binds the designer's materials into the namespace ({@link injectMaterials})
 *  - diffs the namespace after each run and reports Materials the user created or reassigned
 *    ({@link collectChangedMaterials}), keyed by a stable per-variable client id
 *
 * A module-level singleton ({@link replSession}) is exported so the persistent Python namespace and
 * the variable->clientId map survive the panel being toggled closed and open again.
 */
export declare class MaterialsReplSession extends PyodideSession {
    /** variableName -> stable client id. Authoritative for add (new name) vs update (known name). */
    private variableNameToClientId;
    /** Introspected helper-function metadata for editor autocomplete; populated on bootstrap. */
    private helperMeta;
    constructor();
    /** The pre-imported helper functions available in the namespace (for editor autocomplete). */
    get helpers(): ReplHelperMeta[];
    /**
     * Pre-import the made helper API and introspect it, and hand the collector the list of injected
     * input names so a "reload inputs" rebind is never mistaken for a user-created Material.
     */
    protected bootstrapNamespace(log: (message: string) => void): Promise<void>;
    /** Snapshot Material identities before each run so {@link collectChangedMaterials} can diff. */
    protected beforeExecute(): void;
    /**
     * Bind the current designer materials into the namespace as `materials_in` (list) and
     * `material` (first/active), reconstructed from their ESSE configs.
     */
    injectMaterials(configs: MaterialSchema[], activeIndex?: number): void;
    /**
     * Diff the namespace and return one {@link ReplSyncOperation} per newly-created or reassigned
     * Material, resolving/assigning the stable client id per variable name.
     */
    collectChangedMaterials(): ReplSyncOperation[];
}
/** Module-level singleton — survives panel toggles alongside the persistent `window.pyodide`. */
export declare const replSession: MaterialsReplSession;
