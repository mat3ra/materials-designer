import { describe, expect, it } from "vitest";

import { toMaterialDoc } from "../../../src/embed/docs";
import { toMDState } from "../../../src/domain/mdState";
import { applyOperation, createInitialState, forkMaterial } from "../../../src/core/session";
import { resolve } from "../../../src/core/replay";
import { MDMaterial } from "../../../src/MDMaterial";

const CONFIG = {
    name: "Platform Silicon",
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

describe("toMaterialDoc — a host material becomes an origin", () => {
    it("arrives with a one-step history rather than no history", () => {
        const doc = toMaterialDoc(new MDMaterial(CONFIG as never));
        expect(doc.log).toHaveLength(1);
        expect(doc.log[0].type).toBe("create-from-config");
        expect(resolve(doc).material.name).toBe("Platform Silicon");
    });

    it("carries the platform's id so a save updates that record", () => {
        const withId = { ...CONFIG, _id: "platform-abc" };
        expect(toMaterialDoc(new MDMaterial(withId as never)).externalId).toBe("platform-abc");
    });

    it("leaves externalId unset for a material the platform has never seen", () => {
        expect(toMaterialDoc(new MDMaterial(CONFIG as never)).externalId).toBeUndefined();
    });
});

describe("toMDState — the shape the platform reads back", () => {
    it("reports the active material's position", () => {
        let state = createInitialState();
        state = forkMaterial(state, state.materials[0].id, undefined, { select: false });
        expect(toMDState(state).index).toBe(0);
        expect(toMDState(state).materials).toHaveLength(2);
    });

    it("lists the indices of materials that differ from how they arrived", () => {
        let state = createInitialState();
        expect(toMDState(state).updatedIndices).toEqual([]);
        state = applyOperation(state, "supercell", {
            matrix: [[2, 0, 0], [0, 1, 0], [0, 0, 1]],
        });
        expect(toMDState(state).updatedIndices).toEqual([0]);
    });

    it("hands back materials that serialise, since the host will call toJSON on them", () => {
        const state = createInitialState();
        const [material] = toMDState(state).materials;
        expect(() => material.toJSON()).not.toThrow();
    });

    it("survives a material that cannot be serialised instead of taking the app down", () => {
        // A view that exists so other things can read the session must never be the reason the
        // session stops rendering.
        const state = createInitialState();
        const broken = { ...state.materials[0], log: [{ ...state.materials[0].log[0] }] };
        Object.defineProperty(broken, "id", { value: "broken", enumerable: true });
        expect(() => toMDState({ ...state, materials: [...state.materials, broken] })).not.toThrow();
    });
});

describe("toMDState — positions stay aligned with what is published", () => {
    it("indexes into the published list, not the session's", () => {
        // A material that cannot be serialised is left out. If positions were still counted
        // against the full list, materials[index] would point at the wrong material — and the
        // platform's save dialog writes whatever it is handed.
        const state = createInitialState();
        // An operation type the registry does not know: the document cannot be rebuilt at all.
        const doomed: (typeof state.materials)[number] = {
            ...state.materials[0],
            id: "doomed",
            log: [{ ...state.materials[0].log[0], id: "op-doomed", type: "no-such-operation" }],
        };
        const view = toMDState({
            ...state,
            materials: [doomed, ...state.materials],
            activeId: state.materials[0].id,
        });

        expect(view.materials).toHaveLength(1);
        expect(view.index).toBe(0);
        expect(view.materials[view.index]).toBeDefined();
        expect(view.updatedIndices.every((i) => i < view.materials.length)).toBe(true);
    });

    it("reports isLoading as given", () => {
        expect(toMDState(createInitialState(), true).isLoading).toBe(true);
    });
});
