import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
export declare class MDMaterial extends Material {
    constructor(config?: Partial<MaterialSchema>);
    static fromMadeMaterial(madeMaterial: Material, metadata?: Partial<MaterialSchema>): MDMaterial;
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialSchema & AnyObject;
}
