import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";
export class MDMaterial extends Material {
    constructor(config) {
        super({ ...defaultMaterialConfig, ...config });
    }
    static fromMadeMaterial(madeMaterial, metadata = {}) {
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
    }
    get boundaryConditions() {
        // @ts-ignore
        return this.metadata.boundaryConditions || {};
    }
    toJSON() {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
