/**
 * The wire format between MD and a code surface (JupyterLite today, the Pyodide REPL next).
 *
 * The protocol is asymmetric and undocumented anywhere else, so it is written down here rather
 * than inlined at the two call sites: the host sends a bare array of material configs, and the
 * frame sends back an object under a `materials` key. Both directions are adapted here, so a
 * change in either is a change in one file.
 */
import { toImportableConfig } from "../../core/io";

export type MaterialConfig = Record<string, unknown>;

/** Host → frame. A bare array; JupyterLite's data bridge binds it to `materials_in`. */
export function toFramePayload(configs: MaterialConfig[]): MaterialConfig[] {
    return configs;
}

export interface ReceivedMaterials {
    /**
     * The structures that could be read, or `null` when the payload was not a material list at
     * all. The distinction matters: an empty list is the frame saying "I produced nothing", which
     * should clear what is staged, while a malformed message says nothing about the last run and
     * must leave it alone.
     */
    configs: MaterialConfig[] | null;
    errors: string[];
}

/**
 * Frame → host.
 *
 * Every config is round-tripped through made.js here rather than at submit time: a notebook can
 * emit anything, and a structure that cannot be constructed must be reported as one named failure
 * instead of taking the staging list — or, once `window.MDState` republishes, the whole app — down
 * with it.
 */
export function fromFramePayload(payload: unknown): ReceivedMaterials {
    const sent = (payload as { materials?: unknown } | null)?.materials;
    if (!Array.isArray(sent)) {
        return {
            configs: null,
            errors: ["The notebook sent something that was not a material list"],
        };
    }

    const configs: MaterialConfig[] = [];
    const errors: string[] = [];
    sent.forEach((entry, index) => {
        const config = (entry ?? {}) as MaterialConfig;
        const name = (config.name as string) || `material ${index + 1}`;
        try {
            // Serialisability, not `validate()`: that checks against the base schema and rejects
            // the `external` block a structure taken from a database carries. Serialising is what
            // everything downstream actually does — the 3D view clones the material on every prop
            // change — so it is the definition of "usable" the rest of the app lives by.
            configs.push(toImportableConfig(config));
        } catch (error) {
            errors.push(`Could not read ${name}: ${(error as Error).message}`);
        }
    });
    return { configs, errors };
}
