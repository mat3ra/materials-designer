import type { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { defaultMaterialConfig, Material } from "@mat3ra/made/dist/js/material";

export class MDMaterial extends Material {
    /**
     * Stable, app-level id used by the Python REPL to map a Python variable name to the material it
     * produced. Kept as a plain instance field so it is NOT part of the ESSE config and never
     * serializes via toJSON() (see the test that locks this in) — it must not leak into exports.
     */
    replClientId?: string;

    constructor(config: Partial<MaterialSchema> = {}) {
        super({ ...defaultMaterialConfig, ...config });
    }

    static fromMadeMaterial(madeMaterial: Material, metadata = {}) {
        return new MDMaterial({ ...madeMaterial.toJSON(), ...metadata });
    }

    // clone() rebuilds from config and would otherwise drop the non-config replClientId, so carry it.
    clone(extraContext?: object): this {
        const cloned = super.clone(extraContext) as this;
        cloned.replClientId = this.replClientId;
        return cloned;
    }

    get isUpdated() {
        return this.prop("isUpdated", false);
    }

    set isUpdated(bool) {
        this.setProp("isUpdated", bool);
    }

    cleanOnCopy() {
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
