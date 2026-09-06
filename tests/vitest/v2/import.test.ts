import { describe, expect, it } from "vitest";

import { formatTimestamp, removeButtonId, stageFile } from "../../../src/domain/ImportReview";
import { resolve } from "../../../src/core/replay";
import { createMaterialDoc } from "../../../src/core/session";

const GRAPHENE_JSON = JSON.stringify({
    name: "Graphene",
    lattice: {
        type: "HEX",
        a: 2.467,
        b: 2.467,
        c: 20,
        alpha: 90,
        beta: 90,
        gamma: 120,
        units: { length: "angstrom", angle: "degree" },
    },
    basis: {
        elements: [
            { id: 0, value: "C" },
            { id: 1, value: "C" },
        ],
        coordinates: [
            { id: 0, value: [0, 0, 0] },
            { id: 1, value: [0.333333, 0.666667, 0] },
        ],
        units: "crystal",
    },
});

describe("staging a file for review", () => {
    it("detects the format rather than trusting the extension", () => {
        const staged = stageFile("anything.txt", GRAPHENE_JSON, new Date(), 0);
        expect(staged.format).toBe("json");
    });

    it("lists a file it cannot place, with the reason where the format goes", () => {
        const staged = stageFile("notes.txt", "this is not a structure", new Date(), 0);
        // Listed, not dropped: seeing that a file arrived and was not understood is the point of
        // reviewing before importing.
        expect(staged.fileName).toBe("notes.txt");
        expect(staged.format).not.toBe("json");
        expect(staged.format.length).toBeGreaterThan(0);
    });

    it("keeps v1's timestamp format, so the column reads the same after the cutover", () => {
        expect(formatTimestamp(new Date(2026, 8, 6, 5, 4, 3))).toBe("05:04:03 09/06/2026");
    });

    it("escapes a file name into something a CSS id selector can address", () => {
        // The frozen widget builds `button#<name>-remove-button`; dots and spaces break that.
        expect(removeButtonId("graphene.poscar")).toBe("graphene-poscar-remove-button");
        expect(removeButtonId("my structure.json")).toBe("my-structure-json-remove-button");
    });
});

describe("importing a reviewed file", () => {
    it("takes the structure's own name, not the file's", () => {
        // v1's contract, which the platform's fixtures pin: importing graphene.json gives you
        // Graphene. Where it came from belongs to the operation, not to the material.
        const doc = createMaterialDoc("import-file", {
            name: "graphene.json",
            content: GRAPHENE_JSON,
        });
        expect(resolve(doc).material.name).toBe("Graphene");
        expect(doc.log[0].digest).toContain("graphene.json");
    });

    it("falls back to the file name when the structure carries none", () => {
        const nameless = JSON.parse(GRAPHENE_JSON);
        delete nameless.name;
        const doc = createMaterialDoc("import-file", {
            name: "unnamed.json",
            content: JSON.stringify(nameless),
        });
        expect(resolve(doc).material.name).toBe("unnamed.json");
    });
});
