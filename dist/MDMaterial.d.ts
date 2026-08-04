import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialConstrainedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import type Material from "@mat3ra/made/dist/js/Material";
import MaterialConstrained from "@mat3ra/made/dist/js/MaterialConstrained";
/** Plain or constrained material config (constraints optional on `basis`). */
export type MaterialConfigWithOptionalConstraints = Partial<MaterialSchema> | Partial<MaterialConstrainedSchema>;
export declare class MDMaterial extends MaterialConstrained {
    constructor(config?: MaterialConfigWithOptionalConstraints);
    /**
     * Build from a parser / standata / notebook config.
     * Constraints live on `basis.constraints` (MaterialConstrained).
     */
    static fromConfig(config?: MaterialConfigWithOptionalConstraints): MDMaterial;
    static fromMadeMaterial(madeMaterial: Material | MaterialConstrained, metadata?: Partial<MaterialSchema>): MDMaterial;
    get isUpdated(): boolean;
    set isUpdated(bool: boolean);
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialConstrainedSchema & AnyObject;
}
