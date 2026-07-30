import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
export declare class MDMaterial extends Material {
    /**
     * Stable, app-level id used by the Python REPL to map a Python variable name to the material it
     * produced. Kept as a plain instance field so it is NOT part of the ESSE config and never
     * serializes via toJSON() (see the test that locks this in) — it must not leak into exports.
     *
     * Why it lives on the material rather than in the REPL session: the session owns the
     * name->clientId map, but the reducer still has to find WHICH list entry a given clientId refers
     * to, and list position is not stable (removals and clones reindex). The identity therefore has to
     * travel with the material itself. Marking the slot is the only thing this field does — no REPL
     * behaviour reads it, so nothing else needs to know it exists.
     */
    replClientId?: string;
    constructor(config?: Partial<MaterialSchema>);
    static fromMadeMaterial(madeMaterial: Material, metadata?: {}): MDMaterial;
    clone(extraContext?: object): this;
    get isUpdated(): boolean;
    set isUpdated(bool: boolean);
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialSchema & AnyObject;
}
