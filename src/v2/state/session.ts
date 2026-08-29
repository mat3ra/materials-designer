/**
 * The session store: pure reducers over SessionState.
 *
 * Two rules give the design its spine:
 *  1. every model change is an Operation appended to a material's log, and
 *  2. every change pushes one entry onto a single undo stack, so Cmd+Z means
 *     the same thing whether the edit came from a form, the 3D canvas, or code.
 *
 * Nothing here touches React, the DOM, or storage, which is what makes the
 * whole spine unit-testable without a browser.
 */
import type Material from "@mat3ra/made/dist/js/Material";

import { digestOf, getDefinition } from "./registry";
import { resolve } from "./replay";
import type {
    Change,
    Engine,
    MaterialDoc,
    Operation,
    OperationSource,
    SessionState,
    SetDoc,
} from "./types";

let counter = 0;
/** Deterministic-enough ids; prefixed so they read well in a test failure. */
export function uid(prefix = "id"): string {
    counter += 1;
    return `${prefix}_${Date.now().toString(36)}_${counter.toString(36)}`;
}

/** For tests: make ids reproducible across runs. */
export function __resetUid(): void {
    counter = 0;
}

export interface RecordOptions {
    source?: OperationSource;
    engine?: Engine;
    label?: string;
    provenance?: Record<string, unknown>;
}

export function makeOperation(
    type: string,
    params: unknown,
    options: RecordOptions = {},
): Operation {
    const def = getDefinition(type);
    return {
        id: uid("op"),
        type,
        params: params as Record<string, unknown>,
        engine: options.engine ?? def.engine,
        source: options.source ?? "form",
        label: options.label ?? def.title,
        digest: def.digest?.(params as any),
        status: "ok",
        createdAt: Date.now(),
        provenance: options.provenance,
    };
}

export function createMaterialDoc(
    originType: string,
    params: unknown,
    options: RecordOptions & { parentId?: string; setId?: string } = {},
): MaterialDoc {
    const op = makeOperation(originType, params, { source: "import", ...options });
    const doc: MaterialDoc = {
        id: uid("mat"),
        parentId: options.parentId,
        setId: options.setId,
        log: [op],
    };
    op.result = digestOf(resolve(doc).material);
    return doc;
}

export function createInitialState(docs?: MaterialDoc[]): SessionState {
    const materials = docs?.length ? docs : [createMaterialDoc("create-default", {})];
    return {
        materials,
        sets: [],
        activeId: materials[0].id,
        selection: { materialId: materials[0].id, siteIds: [] },
        past: [],
        future: [],
        revision: 0,
    };
}

export function getDoc(state: SessionState, id: string): MaterialDoc | undefined {
    return state.materials.find((m) => m.id === id);
}

export function getActive(state: SessionState): MaterialDoc {
    return getDoc(state, state.activeId) ?? state.materials[0];
}

export function getActiveMaterial(state: SessionState): Material {
    return resolve(getActive(state)).material;
}

function bump(state: SessionState, patch: Partial<SessionState>): SessionState {
    return { ...state, ...patch, revision: state.revision + 1 };
}

/** Record a change on the undo stack. Any new change invalidates redo. */
function pushChange(state: SessionState, change: Change, patch: Partial<SessionState>) {
    return bump(state, { ...patch, past: [...state.past, change], future: [] });
}

// ---------------------------------------------------------------- operations

/**
 * Apply an operation to a material and record it.
 * This is the single write path for model changes; panels, the canvas bridge,
 * the basis editor and (later) the assistant all funnel through here.
 */
export function applyOperation(
    state: SessionState,
    type: string,
    params: unknown,
    options: RecordOptions & { materialId?: string } = {},
): SessionState {
    const targetId = options.materialId ?? state.activeId;
    const doc = getDoc(state, targetId);
    if (!doc) return state;

    const op = makeOperation(type, params, options);
    const nextDoc: MaterialDoc = { ...doc, log: [...doc.log, op] };

    // Deliberately unguarded: if the operation cannot replay, the throw
    // propagates and the session keeps its previous state rather than
    // recording a step that does not reproduce.
    op.result = digestOf(resolve(nextDoc).material);

    const materials = state.materials.map((m) => (m.id === targetId ? nextDoc : m));
    return pushChange(state, { kind: "op", materialId: targetId, op }, { materials });
}

/**
 * Coalesce a rapid sequence of same-type manual edits into one step, so a drag
 * across the canvas is one Timeline chip and one Cmd+Z, not forty.
 */
export const COALESCE_WINDOW_MS = 1200;

export function applyCoalescingOperation(
    state: SessionState,
    type: string,
    params: unknown,
    options: RecordOptions & { materialId?: string } = {},
): SessionState {
    const targetId = options.materialId ?? state.activeId;
    const doc = getDoc(state, targetId);
    const last = doc?.log[doc.log.length - 1];
    const lastChange = state.past[state.past.length - 1];
    const canCoalesce =
        !!doc &&
        !!last &&
        last.type === type &&
        Date.now() - last.createdAt < COALESCE_WINDOW_MS &&
        lastChange?.kind === "op" &&
        lastChange.op.id === last.id &&
        doc.log.length > 1; // never swallow the origin

    if (!canCoalesce) return applyOperation(state, type, params, options);

    const def = getDefinition(type);
    const merged: Operation = {
        ...last!,
        params: params as Record<string, unknown>,
        digest: def.digest?.(params as any),
    };
    const nextDoc: MaterialDoc = {
        ...doc!,
        log: [...doc!.log.slice(0, -1), merged],
    };
    merged.result = digestOf(resolve(nextDoc).material);

    const materials = state.materials.map((m) => (m.id === targetId ? nextDoc : m));
    // Replace the pending undo entry rather than stacking a second one.
    const past = [
        ...state.past.slice(0, -1),
        { kind: "op", materialId: targetId, op: merged } as Change,
    ];
    return bump(state, { materials, past, future: [] });
}

/**
 * Apply a set-producing operation: a marker step on the source material and one
 * child material per emitted config, recorded as a single undoable change.
 *
 * The children are real materials with their own logs (origin =
 * `create-from-config`), which is what makes a combinatorial batch navigable as
 * lineage instead of a hundred unrelated rows.
 */
export function applySetOperation(
    state: SessionState,
    type: string,
    params: Record<string, unknown>,
    childConfigs: { config: unknown; label: string }[],
    options: RecordOptions & { materialId?: string; setLabel?: string } = {},
): SessionState {
    const sourceId = options.materialId ?? state.activeId;
    const source = getDoc(state, sourceId);
    if (!source || !childConfigs.length) return state;

    const set: SetDoc = {
        id: uid("set"),
        label: options.setLabel ?? getDefinition(type).title,
        sourceId,
        createdAt: Date.now(),
    };
    const op = makeOperation(type, { ...params, count: childConfigs.length }, options);
    op.result = source.log[source.log.length - 1]?.result;

    const docs = childConfigs.map((child) =>
        createMaterialDoc(
            "create-from-config",
            { config: child.config, source: child.label },
            { parentId: sourceId, setId: set.id },
        ),
    );

    const materials = state.materials
        .map((m) => (m.id === sourceId ? { ...m, log: [...m.log, op] } : m))
        .concat(docs);

    return pushChange(
        state,
        { kind: "set-produced", materialId: sourceId, op, docs, set },
        { materials, sets: [...state.sets, set], activeId: docs[0].id },
    );
}

// ----------------------------------------------------------------- materials

export function addMaterials(state: SessionState, docs: MaterialDoc[], set?: SetDoc): SessionState {
    if (!docs.length) return state;
    const materials = [...state.materials, ...docs];
    const sets = set ? [...state.sets, set] : state.sets;
    return pushChange(
        state,
        { kind: "materials-added", materialIds: docs.map((d) => d.id), docs, set },
        { materials, sets, activeId: docs[0].id },
    );
}

export function removeMaterial(state: SessionState, id: string): SessionState {
    const index = state.materials.findIndex((m) => m.id === id);
    if (index < 0) return state;
    if (state.materials.length === 1) return state; // never leave an empty session
    const doc = state.materials[index];
    const materials = state.materials.filter((m) => m.id !== id);
    const activeId = state.activeId === id ? materials[Math.max(0, index - 1)].id : state.activeId;
    return pushChange(state, { kind: "material-removed", doc, index }, { materials, activeId });
}

/** Fork: a sibling material sharing ancestry — how branching works (decision D3). */
export function forkMaterial(state: SessionState, id: string, upToStep?: number): SessionState {
    const doc = getDoc(state, id);
    if (!doc) return state;
    const log = doc.log.slice(0, upToStep ?? doc.log.length);
    const copy: MaterialDoc = {
        id: uid("mat"),
        parentId: doc.parentId ?? doc.id,
        log: log.map((op) => ({ ...op, id: uid("op") })),
    };
    const materials = [...state.materials, copy];
    return pushChange(
        state,
        { kind: "materials-added", materialIds: [copy.id], docs: [copy] },
        { materials, activeId: copy.id },
    );
}

export function setActive(state: SessionState, id: string): SessionState {
    // Navigation is not a model change: it never enters the undo stack.
    if (!getDoc(state, id)) return state;
    return bump(state, { activeId: id, selection: { materialId: id, siteIds: [] } });
}

export function setSelection(
    state: SessionState,
    siteIds: number[],
    anchor?: number,
): SessionState {
    return bump(state, { selection: { materialId: state.activeId, siteIds, anchor } });
}

// -------------------------------------------------------------- undo / redo

export function canUndo(state: SessionState): boolean {
    return state.past.length > 0;
}

export function canRedo(state: SessionState): boolean {
    return state.future.length > 0;
}

function reverse(state: SessionState, change: Change): Partial<SessionState> {
    switch (change.kind) {
        case "op": {
            const doc = getDoc(state, change.materialId);
            if (!doc) return {};
            const log = doc.log.slice(0, -1);
            if (!log.length) return {}; // an origin is never undone away
            return {
                materials: state.materials.map((m) =>
                    m.id === change.materialId ? { ...m, log } : m,
                ),
                activeId: change.materialId,
            };
        }
        case "materials-added": {
            const ids = new Set(change.materialIds);
            const materials = state.materials.filter((m) => !ids.has(m.id));
            if (!materials.length) return {};
            return {
                materials,
                sets: change.set ? state.sets.filter((s) => s.id !== change.set!.id) : state.sets,
                activeId: ids.has(state.activeId)
                    ? materials[materials.length - 1].id
                    : state.activeId,
            };
        }
        case "material-removed": {
            const materials = [...state.materials];
            materials.splice(Math.min(change.index, materials.length), 0, change.doc);
            return { materials, activeId: change.doc.id };
        }
        case "log-truncated": {
            const doc = getDoc(state, change.materialId);
            if (!doc) return {};
            return {
                materials: state.materials.map((m) =>
                    m.id === change.materialId ? { ...m, log: [...m.log, ...change.removed] } : m,
                ),
                activeId: change.materialId,
            };
        }
        case "set-produced": {
            const ids = new Set(change.docs.map((d) => d.id));
            const materials = state.materials
                .filter((m) => !ids.has(m.id))
                .map((m) => (m.id === change.materialId ? { ...m, log: m.log.slice(0, -1) } : m));
            if (!materials.length) return {};
            return {
                materials,
                sets: state.sets.filter((s) => s.id !== change.set.id),
                activeId: change.materialId,
            };
        }
        default:
            return {};
    }
}

function forward(state: SessionState, change: Change): Partial<SessionState> {
    switch (change.kind) {
        case "op": {
            const doc = getDoc(state, change.materialId);
            if (!doc) return {};
            return {
                materials: state.materials.map((m) =>
                    m.id === change.materialId ? { ...m, log: [...m.log, change.op] } : m,
                ),
                activeId: change.materialId,
            };
        }
        case "materials-added":
            return {
                materials: [...state.materials, ...change.docs],
                sets: change.set ? [...state.sets, change.set] : state.sets,
                activeId: change.docs[0].id,
            };
        case "material-removed": {
            const materials = state.materials.filter((m) => m.id !== change.doc.id);
            if (!materials.length) return {};
            return {
                materials,
                activeId:
                    state.activeId === change.doc.id
                        ? materials[Math.max(0, change.index - 1)].id
                        : state.activeId,
            };
        }
        case "log-truncated": {
            const doc = getDoc(state, change.materialId);
            if (!doc) return {};
            const keep = doc.log.length - change.removed.length;
            if (keep < 1) return {};
            return {
                materials: state.materials.map((m) =>
                    m.id === change.materialId ? { ...m, log: m.log.slice(0, keep) } : m,
                ),
                activeId: change.materialId,
            };
        }
        case "set-produced":
            return {
                materials: state.materials
                    .map((m) =>
                        m.id === change.materialId ? { ...m, log: [...m.log, change.op] } : m,
                    )
                    .concat(change.docs),
                sets: [...state.sets, change.set],
                activeId: change.docs[0].id,
            };
        default:
            return {};
    }
}

export function undo(state: SessionState): SessionState {
    const change = state.past[state.past.length - 1];
    if (!change) return state;
    const patch = reverse(state, change);
    if (!Object.keys(patch).length) return state;
    return bump(state, {
        ...patch,
        past: state.past.slice(0, -1),
        future: [change, ...state.future],
    });
}

export function redo(state: SessionState): SessionState {
    const change = state.future[0];
    if (!change) return state;
    const patch = forward(state, change);
    if (!Object.keys(patch).length) return state;
    return bump(state, {
        ...patch,
        past: [...state.past, change],
        future: state.future.slice(1),
    });
}

/**
 * Revert a material to a chosen step (0 = its origin).
 *
 * Recorded as one reversible change rather than by replaying the session undo
 * stack: that stack is global, so walking it would silently revert whatever
 * another material did in between.
 */
export function revertTo(state: SessionState, materialId: string, step: number): SessionState {
    const doc = getDoc(state, materialId);
    if (!doc) return state;
    const keep = Math.max(1, step + 1); // the origin always survives
    if (doc.log.length <= keep) return state;
    const removed = doc.log.slice(keep);
    const materials = state.materials.map((m) =>
        m.id === materialId ? { ...m, log: m.log.slice(0, keep) } : m,
    );
    return pushChange(
        state,
        { kind: "log-truncated", materialId, removed },
        { materials, activeId: materialId },
    );
}
