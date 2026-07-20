import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
export declare class MDMaterial extends Material {
    /**
     * Stable, app-level id used by the Python REPL to map a Python variable name to the material it
     * produced. Kept as a plain instance field so it is NOT part of the ESSE config and never
     * serializes via toJSON() (see the test that locks this in) — it must not leak into exports.
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
