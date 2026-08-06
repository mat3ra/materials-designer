import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Material } from "@mat3ra/made/dist/js/material";
export declare class MDMaterial extends Material {
    /** Ephemeral producer-owned region marker. It is intentionally absent from {@link toJSON}. */
    syncScope?: string;
    constructor(config?: Partial<MaterialSchema>);
    clone(extraContext?: object): this;
    static fromMadeMaterial(madeMaterial: Material, metadata?: {}): MDMaterial;
    get isUpdated(): boolean;
    set isUpdated(bool: boolean);
    cleanOnCopy(): void;
    get boundaryConditions(): object;
    toJSON(): MaterialSchema & AnyObject;
}
