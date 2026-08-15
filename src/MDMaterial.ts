import type { MaterialEnhancedHashedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import Material, {
    type MaterialConfig,
    defaultMaterialConfig,
} from "@mat3ra/made/dist/js/Material";

export class MDMaterial extends Material {
    /**
     * Signature of this material when it entered the session, used to tell "edited" from "back to
     * how it arrived". Ephemeral and intentionally absent from {@link toJSON}: it describes the
     * session, not the material. Left `undefined` for materials created in-session, which have no
     * original state to return to.
     */
    originalSignature?: string;

    constructor(config: MaterialConfig = defaultMaterialConfig) {
        super(config);
    }

    clone(extraContext?: object): this {
        const material = super.clone(extraContext);
        material.originalSignature = this.originalSignature;
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
        // A copy is a new, unsaved material: it has no original to be compared against.
        this.originalSignature = undefined;
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
