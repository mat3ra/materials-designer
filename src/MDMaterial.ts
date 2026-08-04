import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialConstrainedSchema, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import type Material from "@mat3ra/made/dist/js/Material";
import MaterialConstrained, {
    defaultMaterialConstrainedConfig,
} from "@mat3ra/made/dist/js/MaterialConstrained";

/** Plain or constrained material config (constraints optional on `basis`). */
export type MaterialConfigWithOptionalConstraints =
    | Partial<MaterialSchema>
    | Partial<MaterialConstrainedSchema>;

function toMaterialConstrainedConfig(
    config: MaterialConfigWithOptionalConstraints = {},
): MaterialConstrainedSchema {
    const { basis } = config;
    const constraints =
        basis && "constraints" in basis && basis.constraints !== undefined ? basis.constraints : [];

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
    constructor(config: MaterialConfigWithOptionalConstraints = {}) {
        super(toMaterialConstrainedConfig(config));
    }

    /**
     * Build from a parser / standata / notebook config.
     * Constraints live on `basis.constraints` (MaterialConstrained).
     */
    static fromConfig(config: MaterialConfigWithOptionalConstraints = {}) {
        return new MDMaterial(config);
    }

    static fromMadeMaterial(
        madeMaterial: Material | MaterialConstrained,
        metadata: Partial<MaterialSchema> = {},
    ) {
        return new MDMaterial({
            ...MaterialConstrained.fromMaterial(madeMaterial).toJSON(),
            ...metadata,
        });
    }

    get isUpdated() {
        // @ts-expect-error MD-only runtime prop, not on MaterialConstrainedSchema
        return this.prop("isUpdated", false) as boolean;
    }

    set isUpdated(bool: boolean) {
        // @ts-expect-error MD-only runtime prop, not on MaterialConstrainedSchema
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

    toJSON(): MaterialConstrainedSchema & AnyObject {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }
}
