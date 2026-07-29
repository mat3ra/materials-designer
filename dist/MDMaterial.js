import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";
/**
 * Split optional constraints off a config for Material's second constructor arg.
 * Prefer top-level `constraints`; fall back to legacy `basis.constraints`.
 */
function splitConstraintsFromConfig(config) {
    var _a;
    const { constraints: topLevelConstraints, ...rest } = config;
    const basisConfig = rest.basis;
    const constraintsFromBasis = basisConfig === null || basisConfig === void 0 ? void 0 : basisConfig.constraints;
    let basis = basisConfig;
    if (basisConfig && "constraints" in basisConfig) {
        basis = { ...basisConfig };
        delete basis.constraints;
    }
    return {
        config: { ...rest, ...(basis !== undefined ? { basis } : {}) },
        constraints: (_a = topLevelConstraints !== null && topLevelConstraints !== void 0 ? topLevelConstraints : constraintsFromBasis) !== null && _a !== void 0 ? _a : [],
    };
}
export class MDMaterial extends Material {
    constructor(config = {}, constraints = []) {
        super({ ...defaultMaterialConfig, ...config }, constraints);
    }
    /**
     * Build from a config that may carry constraints at the top level (parsers)
     * or on `basis` (legacy / ConstrainedBasis.toJSON).
     */
    static fromConfig(config = {}) {
        const { config: materialConfig, constraints } = splitConstraintsFromConfig(config);
        return new MDMaterial(materialConfig, constraints);
    }
    static fromMadeMaterial(madeMaterial, metadata = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata }, madeMaterial.constraints);
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
            ...(this.constraints.length ? { constraints: this.constraints } : {}),
        };
    }
}
