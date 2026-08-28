import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";

/** The scope tag every REPL-produced material carries; `materialsSyncScope` keys its merge on it. */
export const REPL_SYNC_SCOPE = "python-repl";

/** One entity in a sync payload from the REPL page. */
export interface MaterialEntity {
    type: "material";
    name: string;
    config: MaterialSchema;
}

/**
 * What the embedded REPL sends after every run: the complete set of public Material bindings for
 * its scope. The shape is pyodide-repl's contract (see that repo's README) — mirrored here rather
 * than imported so MD's build does not depend on the REPL package.
 */
export interface MaterialsSyncPayload {
    syncScope: string;
    entities: MaterialEntity[];
}
