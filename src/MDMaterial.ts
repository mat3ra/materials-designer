import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";

export class MDMaterial extends Material {
    /** Ephemeral producer-owned region marker. It is intentionally absent from {@link toJSON}. */
    syncScope?: string;

    constructor(config: Partial<MaterialSchema> = {}) {
        super({ ...defaultMaterialConfig, ...config });
    }

    clone(extraContext?: object): this {
        const material = super.clone(extraContext);
        material.syncScope = this.syncScope;
        return material;
    }

    static fromMadeMaterial(madeMaterial: Material, metadata = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata });
    }

    get isUpdated() {
        return this.prop("isUpdated", false);
    }

    set isUpdated(bool) {
        this.setProp("isUpdated", bool);
    }

    cleanOnCopy() {
        ["_id"].forEach((p) => this.unsetProp(p));
        this.syncScope = undefined;
    }

    get boundaryConditions(): object {
        // @ts-ignore
        return this.metadata?.boundaryConditions || {};
    }

    toJSON(): MaterialSchema & AnyObject {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
