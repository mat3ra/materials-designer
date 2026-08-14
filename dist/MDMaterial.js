import Material, { defaultMaterialConfig, } from "@mat3ra/made/dist/js/Material";
export class MDMaterial extends Material {
    constructor(config = defaultMaterialConfig) {
        super(config);
    }
    clone(extraContext) {
        const material = super.clone(extraContext);
        material.syncScope = this.syncScope;
        return material;
    }
    static fromMadeMaterial(madeMaterial, metadata = {}) {
        return new MDMaterial({
            ...madeMaterial.toJSONEnhanced(),
            ...metadata,
        });
    }
    get isUpdated() {
        // @ts-expect-error MD-only runtime prop, not on MaterialEnhancedSchema
        return this.prop("isUpdated", false);
    }
    set isUpdated(bool) {
        // @ts-expect-error MD-only runtime prop, not on MaterialEnhancedSchema
        this.setProp("isUpdated", bool);
    }
    cleanOnCopy() {
        // @ts-expect-error MD-only runtime prop, not on MaterialSchema
        ["_id"].forEach((p) => this.unsetProp(p));
        this.syncScope = undefined;
    }
    get boundaryConditions() {
        var _a;
        // @ts-ignore
        return ((_a = this.metadata) === null || _a === void 0 ? void 0 : _a.boundaryConditions) || {};
    }
    toJSON() {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
