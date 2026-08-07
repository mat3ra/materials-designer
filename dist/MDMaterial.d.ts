import type { MaterialEnhancedHashedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import Material, { type MaterialConfig } from "@mat3ra/made/dist/js/Material";
export declare class MDMaterial extends Material {
    constructor(config?: MaterialConfig);
    static fromMadeMaterial(madeMaterial: Material, metadata?: Partial<MaterialSchema>): MDMaterial;
    get isUpdated(): boolean;
    set isUpdated(bool: boolean);
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialEnhancedHashedSchema;
}
