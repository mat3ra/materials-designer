import Material from "@mat3ra/made/dist/js/Material";
import { describe, expect, it } from "vitest";

import { fromFramePayload, toFramePayload } from "../../../src/domain/console/payload";
import { resolve } from "../../../src/core/replay";
import { applyOperation, createInitialState, createMaterialDoc } from "../../../src/core/session";
import { logAsPython } from "../../../src/domain/console/ConsoleDock";

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
        expect(configs![0].name).toBe("Silicon FCC");
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

    it("keeps the external block, which records where a structure came from", () => {
        // The shape a standard-library entry actually carries; a partial one is rejected, which
        // is the schema doing its job rather than a problem with the block itself.
        const external = {
            id: "2dm-3993",
            source: "2dmatpedia",
            doi: "10.1038/s41597-019-0097-3",
            url: "http://www.2dmatpedia.org/2dmaterials/doc/2dm-3993",
            origin: true,
        };
        const { configs } = fromFramePayload({ materials: [{ ...SILICON, external }] });
        expect(configs?.[0].external).toEqual(external);
        // It was briefly stripped here on the theory that made.js could not serialise it. It can;
        // the crash that theory came from had another cause, and dropping the block cost the
        // platform provenance it asserts on.
        expect(() => new Material(configs![0] as never).toJSON()).not.toThrow();
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

    it("is a row of its own: which materials went in is provenance, not lineage", () => {
        // The app once handed the first input over as `parentId`, which drew the result as a fork
        // of it. A notebook with two inputs has no single parent and one with none has no parent
        // at all, so the derivation lives in the params — where replay sees it and the chip
        // prints it — and the row lands at the top level.
        const doc = createMaterialDoc(
            "notebook-result",
            { config: SILICON, inputs: ["Silicon FCC", "Nickel FCC"] },
            { source: "code", provenance: { entryPath: "made/Introduction.ipynb" } },
        );
        expect(doc.parentId).toBeUndefined();
        expect(doc.log[0].digest).toBe("from Silicon FCC, Nickel FCC");
    });
});

describe("adopting a REPL result", () => {
    it("says which surface ran the code, and replays like a notebook result", () => {
        const doc = createMaterialDoc(
            "repl-result",
            { config: SILICON, inputs: ["Silicon FCC"] },
            { source: "code" },
        );
        const [origin] = doc.log;
        expect(origin.engine).toBe("repl");
        // No entryPath: a prompt has no file, and a sentinel in its place would be a fake one.
        expect(origin.provenance?.entryPath).toBeUndefined();
        expect(origin.label).toBe("From REPL");
        expect(origin.digest).toBe("from Silicon FCC");
        expect(resolve(doc).digest.atomCount).toBe(2);
    });
});

describe("the timeline as a script", () => {
    it("names every step in order, with its parameters", () => {
        let doc = createMaterialDoc("create-from-config", { config: SILICON });
        let state = createInitialState([doc]);
        state = applyOperation(state, "supercell", {
            matrix: [
                [2, 0, 0],
                [0, 1, 0],
                [0, 0, 1],
            ],
        });
        doc = state.materials[0];

        const script = logAsPython(doc, "Silicon FCC");
        expect(script).toContain("# material: Silicon FCC");
        expect(script).toContain("# step 1: Created");
        expect(script).toContain("# step 2: Supercell");
        expect(script).toContain('apply("supercell"');
        expect(script).toContain("[[2,0,0],[0,1,0],[0,0,1]]");
    });

    it("elides the bulk fields, which are the structure rather than the recipe", () => {
        // A config or a basis inlined into every line would bury the operations in coordinates.
        const doc = createMaterialDoc("create-from-config", { config: SILICON });
        expect(logAsPython(doc, "Silicon FCC")).not.toContain("elements");
    });
});
