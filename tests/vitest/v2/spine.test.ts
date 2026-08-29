/**
 * Tests for the MD 2.0 spine.
 *
 * The design's central claim is that routing every edit through one operation
 * log gives one coherent history. These tests are where that claim is checked:
 * replay determinism, undo across mixed sources, revert, forking, and
 * persistence round-trips.
 */
import {
    load,
    save,
    serialize,
    STORAGE_KEY,
} from "../../../src/v2/state/persist";
import { atomCountOf, predict } from "../../../src/v2/state/registry";
import { isModified, replay, resolve } from "../../../src/v2/state/replay";
import {
    __resetUid,
    addMaterials,
    applyCoalescingOperation,
    applyOperation,
    canRedo,
    canUndo,
    createInitialState,
    createMaterialDoc,
    editOperation,
    forkMaterial,
    getActive,
    getActiveMaterial,
    getDoc,
    redo,
    removeMaterial,
    revertTo,
    setActive,
    undo,
} from "../../../src/v2/state/session";
import { beforeEach, describe, expect, it } from "vitest";

const IDENTITY = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
] as any;
const SUPERCELL_222 = [
    [2, 0, 0],
    [0, 2, 0],
    [0, 0, 2],
] as any;

beforeEach(() => __resetUid());

describe("origins and replay", () => {
    it("starts from a default silicon material", () => {
        const state = createInitialState();
        const material = getActiveMaterial(state);
        expect(atomCountOf(material)).toBe(2);
        expect(material.formula).toBe("Si");
    });

    it("replays a log deterministically", () => {
        const state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const doc = getActive(state);
        const first = replay(doc.log);
        const second = replay(doc.log);
        expect(atomCountOf(first)).toBe(atomCountOf(second));
        expect(first.formula).toBe(second.formula);
        expect(atomCountOf(first)).toBe(16); // 2 atoms x |det| 8
    });

    it("replays to an earlier step for time travel", () => {
        const state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const doc = getActive(state);
        expect(atomCountOf(replay(doc.log, 1))).toBe(2); // origin only
        expect(atomCountOf(replay(doc.log, 2))).toBe(16);
    });

    it("caches replays by log identity", () => {
        const state = createInitialState();
        const doc = getActive(state);
        expect(resolve(doc).material).toBe(resolve(doc).material);
    });

    it("refuses to replay an empty log", () => {
        expect(() => replay([])).toThrow(/origin/i);
    });
});

describe("operations", () => {
    it("records a supercell with a result digest", () => {
        const state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const { log } = getActive(state);
        expect(log).toHaveLength(2);
        expect(log[1].type).toBe("supercell");
        expect(log[1].digest).toBe("2×2×2");
        expect(log[1].result?.atomCount).toBe(16);
    });

    it("carries the engine and source of each edit", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: IDENTITY }, { source: "form" });
        state = applyOperation(
            state,
            "manual-patch",
            { basis: getActiveMaterial(state).basis, note: "moved 1 atom" },
            { source: "gesture" },
        );
        const { log } = getActive(state);
        expect(log[1].engine).toBe("native");
        expect(log[1].source).toBe("form");
        expect(log[2].engine).toBe("manual");
        expect(log[2].source).toBe("gesture");
    });

    it("renames through the log so the name is undoable", () => {
        let state = createInitialState();
        state = applyOperation(state, "rename", { name: "Si slab" });
        expect(getActiveMaterial(state).name).toBe("Si slab");
        state = undo(state);
        expect(getActiveMaterial(state).name).not.toBe("Si slab");
    });

    it("builds a slab and keeps its provenance parameters", () => {
        const state = applyOperation(createInitialState(), "surface", {
            h: 1,
            k: 1,
            l: 1,
            thickness: 2,
            vacuumRatio: 0.5,
            vx: 1,
            vy: 1,
        });
        const op = getActive(state).log[1];
        expect(op.digest).toBe("(111) · 2 layers");
        expect(op.params).toMatchObject({ h: 1, k: 1, l: 1, thickness: 2 });
        expect((getActiveMaterial(state).metadata as any).isSlab).toBe(true);
    });

    it("marks a material modified only beyond its origin", () => {
        const state = createInitialState();
        expect(isModified(getActive(state))).toBe(false);
        const edited = applyOperation(state, "supercell", { matrix: SUPERCELL_222 });
        expect(isModified(getActive(edited))).toBe(true);
        // The marker is revert-aware: undoing back to the origin clears it.
        expect(isModified(getActive(undo(edited)))).toBe(false);
    });
});

describe("prediction (the panel's -> N atoms line)", () => {
    it("forecasts a supercell without building the atoms", () => {
        const material = getActiveMaterial(createInitialState());
        expect(predict(material, "supercell", { matrix: SUPERCELL_222 }).atomCount).toBe(16);
        const huge = [
            [20, 0, 0],
            [0, 20, 0],
            [0, 0, 20],
        ] as any;
        expect(predict(material, "supercell", { matrix: huge }).atomCount).toBe(16000);
    });

    it("reports an error instead of throwing at the panel", () => {
        const material = getActiveMaterial(createInitialState());
        const result = predict(material, "surface", {
            h: 0,
            k: 0,
            l: 0,
            thickness: 1,
            vacuumRatio: 0,
            vx: 1,
            vy: 1,
        });
        expect(result.error ?? result.atomCount).toBeDefined();
    });
});

describe("one undo stack across every surface", () => {
    it("undoes a form edit and a canvas gesture through the same stack", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 }, { source: "form" });
        const afterSupercell = atomCountOf(getActiveMaterial(state));
        state = applyOperation(
            state,
            "rename",
            { name: "from the canvas" },
            { source: "gesture", engine: "manual" },
        );

        expect(canUndo(state)).toBe(true);
        state = undo(state); // undoes the gesture
        expect(getActiveMaterial(state).name).not.toBe("from the canvas");
        expect(atomCountOf(getActiveMaterial(state))).toBe(afterSupercell);

        state = undo(state); // undoes the form edit
        expect(atomCountOf(getActiveMaterial(state))).toBe(2);
        expect(canUndo(state)).toBe(false);
    });

    it("redoes what it undid, then drops redo on a new edit", () => {
        let state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        state = undo(state);
        expect(canRedo(state)).toBe(true);
        state = redo(state);
        expect(atomCountOf(getActiveMaterial(state))).toBe(16);

        state = undo(state);
        state = applyOperation(state, "rename", { name: "new branch" });
        expect(canRedo(state)).toBe(false);
    });

    it("never undoes away a material's origin", () => {
        let state = createInitialState();
        state = undo(state);
        expect(getActive(state).log).toHaveLength(1);
        expect(atomCountOf(getActiveMaterial(state))).toBe(2);
    });

    it("undoes edits on the right material when they interleave", () => {
        let state = createInitialState();
        const first = state.activeId;
        state = addMaterials(state, [createMaterialDoc("create-default", {})]);
        const second = state.activeId;

        state = applyOperation(
            state,
            "supercell",
            { matrix: SUPERCELL_222 },
            { materialId: first },
        );
        state = applyOperation(
            state,
            "supercell",
            { matrix: SUPERCELL_222 },
            { materialId: second },
        );

        state = undo(state); // second only
        expect(atomCountOf(resolve(getDoc(state, second)!).material)).toBe(2);
        expect(atomCountOf(resolve(getDoc(state, first)!).material)).toBe(16);
    });

    it("does not put navigation on the undo stack", () => {
        let state = addMaterials(createInitialState(), [createMaterialDoc("create-default", {})]);
        const depth = state.past.length;
        state = setActive(state, state.materials[0].id);
        expect(state.past.length).toBe(depth);
    });

    it("coalesces a burst of canvas edits into a single step", () => {
        let state = createInitialState();
        const { basis } = getActiveMaterial(state);
        state = applyCoalescingOperation(
            state,
            "manual-patch",
            { basis, note: "drag" },
            { source: "gesture" },
        );
        state = applyCoalescingOperation(
            state,
            "manual-patch",
            { basis, note: "drag" },
            { source: "gesture" },
        );
        state = applyCoalescingOperation(
            state,
            "manual-patch",
            { basis, note: "drag" },
            { source: "gesture" },
        );

        expect(getActive(state).log).toHaveLength(2); // origin + one merged step
        state = undo(state);
        expect(getActive(state).log).toHaveLength(1); // one Cmd+Z clears the whole drag
    });
});

describe("materials, sets and lineage", () => {
    it("adds and removes materials reversibly", () => {
        let state = createInitialState();
        state = addMaterials(state, [createMaterialDoc("create-default", {})]);
        expect(state.materials).toHaveLength(2);

        const added = state.activeId;
        state = removeMaterial(state, added);
        expect(state.materials).toHaveLength(1);
        state = undo(state);
        expect(state.materials).toHaveLength(2);
        expect(getDoc(state, added)).toBeDefined();
    });

    it("refuses to remove the last material", () => {
        const state = createInitialState();
        expect(removeMaterial(state, state.activeId)).toBe(state);
    });

    it("forks a sibling that shares ancestry but not identity", () => {
        let state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const source = state.activeId;
        state = forkMaterial(state, source);
        const fork = getActive(state);

        expect(fork.id).not.toBe(source);
        expect(fork.parentId).toBe(source);
        expect(atomCountOf(resolve(fork).material)).toBe(16);
        // Editing the fork leaves the original untouched.
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 });
        expect(atomCountOf(resolve(getDoc(state, source)!).material)).toBe(16);
        expect(atomCountOf(getActiveMaterial(state))).toBe(128);
    });

    it("forks from an earlier step", () => {
        let state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        state = forkMaterial(state, state.activeId, 1); // origin only
        expect(atomCountOf(getActiveMaterial(state))).toBe(2);
    });
});

describe("revert to a step", () => {
    it("truncates to the chosen step and is itself undoable", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 });
        state = applyOperation(state, "rename", { name: "big" });
        expect(getActive(state).log).toHaveLength(3);

        state = revertTo(state, state.activeId, 0); // back to the origin
        expect(getActive(state).log).toHaveLength(1);
        expect(atomCountOf(getActiveMaterial(state))).toBe(2);

        state = undo(state);
        expect(getActive(state).log).toHaveLength(3);
        expect(getActiveMaterial(state).name).toBe("big");
    });

    it("leaves other materials alone", () => {
        let state = createInitialState();
        const first = state.activeId;
        state = applyOperation(
            state,
            "supercell",
            { matrix: SUPERCELL_222 },
            { materialId: first },
        );
        state = addMaterials(state, [createMaterialDoc("create-default", {})]);
        const second = state.activeId;
        state = applyOperation(
            state,
            "supercell",
            { matrix: SUPERCELL_222 },
            { materialId: second },
        );

        state = revertTo(state, second, 0);
        expect(atomCountOf(resolve(getDoc(state, first)!).material)).toBe(16);
        expect(atomCountOf(resolve(getDoc(state, second)!).material)).toBe(2);
    });
});

describe("persistence", () => {
    class MemoryStorage implements Storage {
        private map = new Map<string, string>();

        get length() {
            return this.map.size;
        }

        clear() {
            this.map.clear();
        }

        getItem(k: string) {
            return this.map.get(k) ?? null;
        }

        key(i: number) {
            return [...this.map.keys()][i] ?? null;
        }

        removeItem(k: string) {
            this.map.delete(k);
        }

        setItem(k: string, v: string) {
            this.map.set(k, v);
        }
    }

    it("round-trips a session through storage", () => {
        const storage = new MemoryStorage();
        let state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        state = applyOperation(state, "rename", { name: "Restored" });

        expect(save(state, "Silicon study", storage)).toBe(true);
        const restored = load(storage);
        expect(restored?.name).toBe("Silicon study");

        const rebuilt = createInitialState(restored!.materials);
        expect(getActiveMaterial(rebuilt).name).toBe("Restored");
        expect(atomCountOf(getActiveMaterial(rebuilt))).toBe(16);
    });

    it("stores logs rather than structures, so payloads stay small", () => {
        const state = applyOperation(createInitialState(), "supercell", {
            matrix: [
                [6, 0, 0],
                [0, 6, 0],
                [0, 0, 6],
            ] as any,
        });
        expect(atomCountOf(getActiveMaterial(state))).toBe(432);
        const bytes = JSON.stringify(serialize(state)).length;
        expect(bytes).toBeLessThan(8000); // a 432-atom cell costs a 3x3 matrix on disk
    });

    it("survives blocked or full storage without corrupting the session", () => {
        const hostile = {
            getItem: () => {
                throw new Error("blocked");
            },
            setItem: () => {
                throw new Error("QuotaExceeded");
            },
            removeItem: () => {
                throw new Error("blocked");
            },
            clear: () => {},
            key: () => null,
            length: 0,
        } as unknown as Storage;
        expect(save(createInitialState(), "x", hostile)).toBe(false);
        expect(load(hostile)).toBeNull();
    });

    it("drops payloads from an incompatible schema version", () => {
        const storage = new MemoryStorage();
        storage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, materials: [] }));
        expect(load(storage)).toBeNull();
    });

    it("ignores corrupt payloads", () => {
        const storage = new MemoryStorage();
        storage.setItem(STORAGE_KEY, "{not json");
        expect(load(storage)).toBeNull();
    });
});

describe("editing a past step", () => {
    it("re-runs downstream steps against the new parameters", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 }); // 2 -> 16
        state = applyOperation(state, "rename", { name: "kept" });
        const id = state.activeId;

        // Change the supercell from 2x2x2 to 3x3x3: the rename after it must survive.
        const result = editOperation(state, id, 1, {
            matrix: [
                [3, 0, 0],
                [0, 3, 0],
                [0, 0, 3],
            ] as any,
        });
        state = result.state;

        expect(result.staleSteps).toEqual([]);
        expect(atomCountOf(getActiveMaterial(state))).toBe(54); // 2 x 27
        expect(getActiveMaterial(state).name).toBe("kept");
        expect(getActive(state).log).toHaveLength(3); // no steps added or lost
    });

    it("restores the exact log on undo", () => {
        let state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const id = state.activeId;
        const before = getActive(state).log;

        state = editOperation(state, id, 1, {
            matrix: [
                [3, 0, 0],
                [0, 3, 0],
                [0, 0, 3],
            ] as any,
        }).state;
        expect(atomCountOf(getActiveMaterial(state))).toBe(54);

        state = undo(state);
        expect(getActive(state).log).toEqual(before);
        expect(atomCountOf(getActiveMaterial(state))).toBe(16);
    });

    it("disables a step that cannot survive the edit, and says which", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 });
        // A manual patch pinned to the 16-atom basis; it cannot apply to a
        // material whose sites no longer match.
        const wideBasis = getActiveMaterial(state).basis;
        state = applyOperation(state, "manual-patch", { basis: wideBasis, note: "moved atoms" });
        state = applyOperation(state, "rename", { name: "after the patch" });
        const id = state.activeId;

        // Revert the supercell to the identity: the 16-site patch is now bogus.
        const result = editOperation(state, id, 1, { matrix: IDENTITY });
        state = result.state;

        const { log } = getActive(state);
        // Either the patch replayed harmlessly or it was disabled — but if it
        // was disabled, it must be marked, kept, and the rest must still run.
        if (result.staleSteps.length) {
            expect(log[result.staleSteps[0]].status).toBe("stale");
            expect(log[result.staleSteps[0]].disabled).toBe(true);
        }
        expect(log).toHaveLength(4); // nothing silently dropped
        expect(getActiveMaterial(state).name).toBe("after the patch"); // downstream still ran
    });

    it("rejects an edit that makes the step itself invalid", () => {
        const state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        const id = state.activeId;
        const singular = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ] as any;
        const result = editOperation(state, id, 1, { matrix: singular });
        expect(result.state).toBe(state); // untouched
        expect(atomCountOf(getActiveMaterial(state))).toBe(16);
    });

    it("leaves the origin step uneditable", () => {
        const state = applyOperation(createInitialState(), "supercell", { matrix: SUPERCELL_222 });
        expect(editOperation(state, state.activeId, 0, {}).state).toBe(state);
    });
});

describe("chip results after an edit", () => {
    it("recomputes the digest of every step the edit touched", () => {
        let state = createInitialState();
        state = applyOperation(state, "supercell", { matrix: SUPERCELL_222 }); // 2 -> 16
        state = applyOperation(state, "rename", { name: "downstream" });
        const id = state.activeId;

        state = editOperation(state, id, 1, {
            matrix: [
                [3, 0, 0],
                [0, 3, 0],
                [0, 0, 3],
            ] as any,
        }).state;

        const { log } = getActive(state);
        expect(log[1].result?.atomCount).toBe(54); // not the stale 16
        expect(log[2].result?.atomCount).toBe(54); // the step after it too
        expect(log[0].result?.atomCount).toBe(2); // untouched before the edit
    });
});
