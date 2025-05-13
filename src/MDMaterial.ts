import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";
import type { MaterialJSON } from "@mat3ra/made/dist/js/types";

export class MDMaterial extends Material {
    constructor(config: Partial<MaterialSchema> = {}) {
        super({ ...defaultMaterialConfig, ...config });
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
    }

    get boundaryConditions(): object {
        // @ts-ignore
        return this.metadata.boundaryConditions || {};
    }

    toJSON(): MaterialJSON {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
