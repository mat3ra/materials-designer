import type { MaterialEnhancedHashedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import Material, {
    type MaterialConfig,
    defaultMaterialConfig,
} from "@mat3ra/made/dist/js/Material";

export class MDMaterial extends Material {
    constructor(config: MaterialConfig = defaultMaterialConfig) {
        super(config);
    }

    static fromMadeMaterial(madeMaterial: Material, metadata: Partial<MaterialSchema> = {}) {
        return new MDMaterial({
            ...madeMaterial.toJSONEnhanced(),
            ...metadata,
        });
    }

    get isUpdated() {
        // @ts-expect-error MD-only runtime prop, not on MaterialEnhancedSchema
        return this.prop("isUpdated", false) as boolean;
    }

    set isUpdated(bool: boolean) {
        // @ts-expect-error MD-only runtime prop, not on MaterialEnhancedSchema
        this.setProp("isUpdated", bool);
    }

    cleanOnCopy() {
        // @ts-expect-error MD-only runtime prop, not on MaterialSchema
        ["_id"].forEach((p) => this.unsetProp(p));
    }

    get boundaryConditions(): object {
        // @ts-ignore
        return this.metadata?.boundaryConditions || {};
    }

    toJSON(): MaterialEnhancedHashedSchema {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
