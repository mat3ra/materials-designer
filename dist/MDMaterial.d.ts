import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
import type { MaterialJSON } from "@mat3ra/made/dist/js/types";
export declare class MDMaterial extends Material {
    constructor(config: Partial<MaterialSchema>);
    static fromMadeMaterial(madeMaterial: Material, metadata?: {}): MDMaterial;
    get isUpdated(): boolean;
    set isUpdated(bool: boolean);
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialJSON;
}
