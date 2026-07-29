import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { AtomicConstraintsSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
type BasisWithConstraints = MaterialSchema["basis"] & {
    constraints?: AtomicConstraintsSchema;
};
/** ESSE material config plus optional constraints (top-level or legacy `basis.constraints`). */
export type MaterialConfigWithOptionalConstraints = Partial<MaterialSchema> & {
    constraints?: AtomicConstraintsSchema;
    basis?: BasisWithConstraints;
};
export declare class MDMaterial extends Material {
    constructor(config?: Partial<MaterialSchema>, constraints?: AtomicConstraintsSchema);
    /**
     * Build from a config that may carry constraints at the top level (parsers)
     * or on `basis` (legacy / ConstrainedBasis.toJSON).
     */
    static fromConfig(config?: MaterialConfigWithOptionalConstraints): MDMaterial;
    static fromMadeMaterial(madeMaterial: Material, metadata?: Partial<MaterialSchema>): MDMaterial;
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialSchema & AnyObject;
}
export {};
