import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { AtomicConstraintsSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";

type BasisWithConstraints = MaterialSchema["basis"] & {
    constraints?: AtomicConstraintsSchema;
};

type MaterialConfig = ConstructorParameters<typeof Material>[0];

function liftConstraintsFromConfig(config: Partial<MaterialSchema>): {
    config: MaterialConfig;
    constraints: AtomicConstraintsSchema;
} {
    const merged = { ...defaultMaterialConfig, ...config };
    const basisConfig = merged.basis as BasisWithConstraints | undefined;
    const constraints = basisConfig?.constraints ?? [];
    const basis = basisConfig ? { ...basisConfig, constraints: undefined } : basisConfig;

    return {
        config: { ...merged, basis } as MaterialConfig,
        constraints,
    };
}

export class MDMaterial extends Material {
    constructor(config: Partial<MaterialSchema> = {}) {
        const { config: materialConfig, constraints } = liftConstraintsFromConfig(config);
        super(materialConfig, constraints);
    }

    static fromMadeMaterial(madeMaterial: Material, metadata: Partial<MaterialSchema> = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata });
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
        };
    }
}
