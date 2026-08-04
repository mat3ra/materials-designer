import MaterialConstrained, { defaultMaterialConstrainedConfig, } from "@mat3ra/made/dist/js/MaterialConstrained";
function toMaterialConstrainedConfig(config = {}) {
    const { basis } = config;
    const constraints = basis && "constraints" in basis && basis.constraints !== undefined ? basis.constraints : [];
    return {
        ...defaultMaterialConstrainedConfig,
        ...config,
        basis: {
            ...defaultMaterialConstrainedConfig.basis,
            ...basis,
            constraints,
        },
    };
}
export class MDMaterial extends MaterialConstrained {
    constructor(config = {}) {
        super(toMaterialConstrainedConfig(config));
    }
    static fromMadeMaterial(madeMaterial, metadata = {}) {
        return new MDMaterial({
            ...MaterialConstrained.fromMaterial(madeMaterial).toJSON(),
            ...metadata,
        });
    }
    get isUpdated() {
        // @ts-expect-error MD-only runtime prop, not on MaterialConstrainedSchema
        return this.prop("isUpdated", false);
    }
    set isUpdated(bool) {
        // @ts-expect-error MD-only runtime prop, not on MaterialConstrainedSchema
        this.setProp("isUpdated", bool);
    }
    cleanOnCopy() {
        // @ts-expect-error MD-only runtime prop, not on MaterialSchema
        ["_id"].forEach((p) => this.unsetProp(p));
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
