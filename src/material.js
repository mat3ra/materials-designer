import { Made } from "@mat3ra/made";

export class Material extends Made.Material {
    constructor(config) {
        super({ ...Made.defaultMaterialConfig, ...config });
    }

    static fromMadeMaterial(madeMaterial, metadata = {}) {
        return new Material({ ...madeMaterial.toJSON(), ...metadata });
    }

    get id() {
        return this.prop("_id", "");
    }

    set id(id) {
        this.setProp("_id", id);
    }

    get isUpdated() {
        return this.prop("isUpdated", false);
    }

    set isUpdated(bool) {
        this.setProp("isUpdated", bool);
    }

    get metadata() {
        return this.prop("metadata", {});
    }

    set metadata(object) {
        this.setProp("metadata", object);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            _id: this.id,
            metadata: this.metadata,
        };
    }

    cleanOnCopy() {
        ["_id"].forEach((p) => this.unsetProp(p));
    }

    get boundaryConditions() {
        return this.metadata.boundaryConditions || {};
    }
}
