// eslint-disable-next-line import/no-extraneous-dependencies
import { describe, expect, it } from "vitest";

import type { ReplSyncOperation } from "../components/repl/MaterialsReplSession";
import { MDMaterial } from "../MDMaterial";
import { type MDState, materialsApplyReplSync } from "./Material";
// Real config produced by `create_supercell(materials_in[0], scaling_factor=[2,2,1])` in the
// Phase-0 Pyodide spike (2x2x1 of the 2-atom Si primitive → 8 atoms). Regenerate via `test:pyodide`.
import supercellConfig from "./supercell.config.json";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CONFIG = supercellConfig as any;

const baseState = (): MDState => ({
    index: 0,
    isLoading: false,
    materials: [new MDMaterial({ name: "Initial" })],
});

const op = (variableName: string, clientId: string, config = CONFIG): ReplSyncOperation => ({
    variableName,
    clientId,
    config,
});

describe("materialsApplyReplSync — the 'supercell' REPL action", () => {
    it("adds a new material for a new variable, named after it, and makes it active", () => {
        const next = materialsApplyReplSync(baseState(), {
            operations: [op("supercell", "cid-sc")],
        });

        expect(next.materials).toHaveLength(2);
        const added = next.materials[1];
        expect(added.name).toBe("supercell");
        expect(added.replClientId).toBe("cid-sc");
        expect(added.isUpdated).toBe(true);
        expect(next.index).toBe(1); // viewer follows the new material
        // it really is the supercell: 8 atoms, and build metadata round-tripped through the config
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const json = added.toJSON() as any;
        expect(json.basis.elements).toHaveLength(8);
        expect(json.metadata.build).toBeDefined();
    });

    it("updates in place (no duplicate) when the same variable re-runs", () => {
        const afterAdd = materialsApplyReplSync(baseState(), {
            operations: [op("supercell", "cid-sc")],
        });
        const afterUpdate = materialsApplyReplSync(afterAdd, {
            operations: [op("supercell", "cid-sc")],
        });

        expect(afterUpdate.materials).toHaveLength(2); // still exactly one supercell
        expect(afterUpdate.materials[1].replClientId).toBe("cid-sc");
        expect(afterUpdate.index).toBe(1);
    });

    it("updates at slot 0 (guards the `action.index || state.index` bug)", () => {
        const atZero = new MDMaterial({ name: "supercell" });
        atZero.replClientId = "cid-sc";
        const state: MDState = {
            index: 1,
            isLoading: false,
            materials: [atZero, new MDMaterial({ name: "other" })],
        };

        const next = materialsApplyReplSync(state, { operations: [op("supercell", "cid-sc")] });

        expect(next.materials).toHaveLength(2);
        expect(next.materials[0].replClientId).toBe("cid-sc"); // updated slot 0, not misdirected
        expect(next.index).toBe(0);
    });

    it("resolves by clientId, not array position (robust to reindexing)", () => {
        const target = new MDMaterial({ name: "supercell" });
        target.replClientId = "cid-sc";
        const state: MDState = {
            index: 0,
            isLoading: false,
            materials: [new MDMaterial(), new MDMaterial(), target], // target at index 2
        };

        const next = materialsApplyReplSync(state, { operations: [op("supercell", "cid-sc")] });

        expect(next.materials).toHaveLength(3); // updated, not appended
        expect(next.materials[2].replClientId).toBe("cid-sc");
        expect(next.index).toBe(2);
    });

    it("appends when the clientId no longer exists (material was removed from the list)", () => {
        const next = materialsApplyReplSync(baseState(), {
            operations: [op("supercell", "cid-removed")],
        });
        expect(next.materials).toHaveLength(2);
        expect(next.materials[1].replClientId).toBe("cid-removed");
    });

    it("empty batch is a no-op", () => {
        const state = baseState();
        expect(materialsApplyReplSync(state, { operations: [] })).toBe(state);
    });

    it("multi-op batch activates the last operation's slot", () => {
        const next = materialsApplyReplSync(baseState(), {
            operations: [op("a", "cid-a"), op("b", "cid-b")],
        });
        expect(next.materials).toHaveLength(3);
        expect(next.index).toBe(2);
        expect(next.materials[2].name).toBe("b");
    });

    // clone() rebuilds from config, so MDMaterial overrides it to carry replClientId across. Without
    // that override a reassigned REPL variable stops matching its material and appends a duplicate
    // instead of updating in place — which is exactly what the update tests above depend on.
    it("clone() carries replClientId, so update-in-place keeps matching", () => {
        const material = new MDMaterial({ name: "supercell" });
        material.replClientId = "cid-sc";
        expect(material.clone().replClientId).toBe("cid-sc");
    });
});
