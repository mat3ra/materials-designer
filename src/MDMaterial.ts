import type { MaterialEnhancedHashedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import Material, {
    type MaterialConfig,
    defaultMaterialConfig,
} from "@mat3ra/made/dist/js/Material";

export class MDMaterial extends Material {
    /** Ephemeral producer-owned region marker. It is intentionally absent from {@link toJSON}. */
    syncScope?: string;

    constructor(config: MaterialConfig = defaultMaterialConfig) {
        super(config);
    }

    clone(extraContext?: object): this {
        const material = super.clone(extraContext);
        material.syncScope = this.syncScope;
        return material;
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
        this.syncScope = undefined;
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
