import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";
function liftConstraintsFromConfig(config) {
    var _a;
    const merged = { ...defaultMaterialConfig, ...config };
    const basisConfig = merged.basis;
    const constraints = (_a = basisConfig === null || basisConfig === void 0 ? void 0 : basisConfig.constraints) !== null && _a !== void 0 ? _a : [];
    const basis = basisConfig ? { ...basisConfig, constraints: undefined } : basisConfig;
    return {
        config: { ...merged, basis },
        constraints,
    };
}
export class MDMaterial extends Material {
    constructor(config = {}) {
        const { config: materialConfig, constraints } = liftConstraintsFromConfig(config);
        super(materialConfig, constraints);
    }
    static fromMadeMaterial(madeMaterial, metadata = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata });
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
