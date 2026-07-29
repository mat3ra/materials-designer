import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { AtomicConstraintsSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";

type BasisWithConstraints = MaterialSchema["basis"] & {
    constraints?: AtomicConstraintsSchema;
};

/** ESSE material config plus optional constraints (top-level or legacy `basis.constraints`). */
export type MaterialConfigWithOptionalConstraints = Partial<MaterialSchema> & {
    constraints?: AtomicConstraintsSchema;
    basis?: BasisWithConstraints;
};

/**
 * Split optional constraints off a config for Material's second constructor arg.
 * Prefer top-level `constraints`; fall back to legacy `basis.constraints`.
 */
function splitConstraintsFromConfig(config: MaterialConfigWithOptionalConstraints): {
    config: Partial<MaterialSchema>;
    constraints: AtomicConstraintsSchema;
} {
    const { constraints: topLevelConstraints, ...rest } = config;
    const basisConfig = rest.basis;
    const constraintsFromBasis = basisConfig?.constraints;
    let basis = basisConfig;
    if (basisConfig && "constraints" in basisConfig) {
        basis = { ...basisConfig };
        delete (basis as BasisWithConstraints).constraints;
    }

    return {
        config: { ...rest, ...(basis !== undefined ? { basis } : {}) },
        constraints: topLevelConstraints ?? constraintsFromBasis ?? [],
    };
}

export class MDMaterial extends Material {
    constructor(config: Partial<MaterialSchema> = {}, constraints: AtomicConstraintsSchema = []) {
        super({ ...defaultMaterialConfig, ...config }, constraints);
    }

    /**
     * Build from a config that may carry constraints at the top level (parsers)
     * or on `basis` (legacy / ConstrainedBasis.toJSON).
     */
    static fromConfig(config: MaterialConfigWithOptionalConstraints = {}) {
        const { config: materialConfig, constraints } = splitConstraintsFromConfig(config);
        return new MDMaterial(materialConfig, constraints);
    }

    static fromMadeMaterial(madeMaterial: Material, metadata: Partial<MaterialSchema> = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata }, madeMaterial.constraints);
    }

    cleanOnCopy() {
        // @ts-expect-error MD-only runtime prop, not on MaterialSchema
        ["_id"].forEach((p) => this.unsetProp(p));
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
            ...(this.constraints.length ? { constraints: this.constraints } : {}),
        };
    }
}
