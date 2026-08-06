import { describe, expect, it } from "vitest";

import type { MaterialsSyncPayload } from "../../src/components/repl/materialsDataBridge";
import { MDMaterial } from "../../src/MDMaterial";
import { type MDState, materialsSyncScope } from "../../src/reducers/Material";

const SCOPE = "python-repl";

const entity = (name: string, config: ReturnType<MDMaterial["toJSON"]>) => ({
    type: "material" as const,
    name,
    config,
});

const sync = (state: MDState, entities: MaterialsSyncPayload["entities"]) =>
    materialsSyncScope(state, { syncScope: SCOPE, entities });

function baseState(): MDState {
    return {
        index: 0,
        isLoading: false,
        materials: [
            new MDMaterial({ _id: "authored-id", name: "Authored", metadata: { keep: 1 } }),
        ],
    };
}

describe("materialsSyncScope", () => {
    it("replaces the complete derived region without duplicating a rerun", () => {
        const config = new MDMaterial({ name: "Python name" }).toJSON();
        const first = sync(baseState(), [entity("supercell", config)]);
        const second = sync(first, [entity("supercell", config)]);

        expect(second.materials.map(({ name }) => name)).toEqual(["Authored", "supercell"]);
        expect(second.materials[1].syncScope).toBe(SCOPE);
        expect(second.materials[1].toJSON()).not.toHaveProperty("syncScope");
    });

    it("removes deleted or renamed bindings and leaves other producers untouched", () => {
        const old = new MDMaterial({ name: "old" });
        old.syncScope = SCOPE;
        const foreign = new MDMaterial({ name: "foreign" });
        foreign.syncScope = "other-tool";
        const state = { ...baseState(), materials: [...baseState().materials, old, foreign] };

        const next = sync(state, []);

        expect(next.materials.map(({ name }) => name)).toEqual(["Authored", "foreign"]);
        expect(next.materials[1]).toBe(foreign);
    });

    it("upserts a round-tripped authored material by id and merges metadata", () => {
        const state = baseState();
        const config = new MDMaterial({
            _id: "authored-id",
            name: "from-python",
            metadata: { build: [{ step: "supercell" }] },
        }).toJSON();

        const next = sync(state, [entity("edited", config)]);

        expect(next.materials).toHaveLength(1);
        expect(next.materials[0].name).toBe("edited");
        expect(next.materials[0].metadata).toMatchObject({
            keep: 1,
            build: [{ step: "supercell" }],
        });
        expect(next.materials[0].syncScope).toBeUndefined();
        expect(next.index).toBe(0);
    });

    it("does not append a non-empty id that no longer matches a host row", () => {
        const missing = new MDMaterial({ _id: "removed-id", name: "removed" }).toJSON();

        const next = sync(baseState(), [entity("stale", missing)]);

        expect(next.materials.map(({ name }) => name)).toEqual(["Authored"]);
    });

    it("keeps a surviving selection and clamps when the selected derived row disappears", () => {
        const authored = new MDMaterial({ name: "authored" });
        const derived = new MDMaterial({ name: "derived" });
        derived.syncScope = SCOPE;
        const state: MDState = { index: 1, isLoading: false, materials: [authored, derived] };

        const next = sync(state, []);

        expect(next.materials).toEqual([authored]);
        expect(next.index).toBe(0);
    });

    it("preserves the ephemeral scope through internal clones", () => {
        const derived = new MDMaterial({ name: "derived" });
        derived.syncScope = SCOPE;

        expect(derived.clone().syncScope).toBe(SCOPE);
    });

    it("clears the ephemeral scope when the user creates an authored copy", () => {
        const derived = new MDMaterial({ name: "derived" });
        derived.syncScope = SCOPE;
        const copy = derived.clone();

        copy.cleanOnCopy();

        expect(copy.syncScope).toBeUndefined();
    });
});
