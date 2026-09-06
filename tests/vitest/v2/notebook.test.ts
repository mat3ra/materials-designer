import Material from "@mat3ra/made/dist/js/Material";
import { describe, expect, it } from "vitest";

import { fromFramePayload, toFramePayload } from "../../../src/domain/console/payload";
import { resolve } from "../../../src/core/replay";
import { createMaterialDoc } from "../../../src/core/session";

const SILICON = {
    name: "Silicon FCC",
    lattice: {
        type: "FCC",
        a: 3.867,
        b: 3.867,
        c: 3.867,
        alpha: 60,
        beta: 60,
        gamma: 60,
        units: { length: "angstrom", angle: "degree" },
    },
    basis: {
        elements: [
            { id: 0, value: "Si" },
            { id: 1, value: "Si" },
        ],
        coordinates: [
            { id: 0, value: [0, 0, 0] },
            { id: 1, value: [0.25, 0.25, 0.25] },
        ],
        units: "crystal",
    },
};

describe("the notebook bridge payload", () => {
    it("sends a bare array, which is what the JupyterLite bridge binds to materials_in", () => {
        expect(toFramePayload([SILICON])).toEqual([SILICON]);
    });

    it("reads the materials key the frame sends back", () => {
        const { configs, errors } = fromFramePayload({ materials: [SILICON] });
        expect(errors).toEqual([]);
        expect(configs).toHaveLength(1);
        expect(configs[0].name).toBe("Silicon FCC");
    });

    it("reports a payload that is not a material list rather than throwing", () => {
        expect(fromFramePayload(undefined).errors).toHaveLength(1);
        // null, not an empty list: a malformed message says nothing about the last run, so the
        // staging list it produced must survive it.
        expect(fromFramePayload({ materials: "oops" }).configs).toBeNull();
    });

    it("distinguishes 'produced nothing' from 'that was not a material list'", () => {
        expect(fromFramePayload({ materials: [] })).toEqual({ configs: [], errors: [] });
    });

    it("names the structure it could not read, and keeps the ones it could", () => {
        const { configs, errors } = fromFramePayload({
            materials: [SILICON, { name: "Broken", lattice: {} }],
        });
        expect(configs).toHaveLength(1);
        expect(errors).toHaveLength(1);
        expect(errors[0]).toContain("Broken");
    });

    it("strips the external block, which made.js accepts but refuses to serialise", () => {
        const withExternal = { ...SILICON, external: { id: "mp-149", source: "materialsproject" } };
        const { configs } = fromFramePayload({ materials: [withExternal] });
        expect(configs[0].external).toBeUndefined();
        // The point of stripping it: everything downstream asks for JSON eventually.
        expect(() => new Material(configs[0] as never).toJSON()).not.toThrow();
    });
});

describe("adopting a notebook result", () => {
    it("records the notebook as the engine, so the chip reads as notebook work", () => {
        const doc = createMaterialDoc(
            "notebook-result",
            { config: SILICON, inputs: ["Nickel FCC"] },
            { source: "code", provenance: { entryPath: "made/Introduction.ipynb" } },
        );
        const [origin] = doc.log;
        expect(origin.engine).toBe("notebook");
        expect(origin.source).toBe("code");
        expect(origin.digest).toContain("Nickel FCC");
        expect(origin.provenance?.entryPath).toBe("made/Introduction.ipynb");
    });

    it("replays to the structure the notebook produced", () => {
        const doc = createMaterialDoc("notebook-result", { config: SILICON, inputs: [] });
        expect(resolve(doc).material.name).toBe("Silicon FCC");
        expect(resolve(doc).digest.atomCount).toBe(2);
    });

    it("keeps the input it came from as its parent, so lineage survives", () => {
        const parent = createMaterialDoc("create-from-config", { config: SILICON });
        const child = createMaterialDoc(
            "notebook-result",
            { config: SILICON, inputs: ["Silicon FCC"] },
            { parentId: parent.id },
        );
        expect(child.parentId).toBe(parent.id);
    });
});
