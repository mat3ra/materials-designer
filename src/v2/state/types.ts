/**
 * MD 2.0 — the operation model.
 *
 * The document is not a structure, it is a derivation: a material is the
 * replay of an ordered log of operations. Every edit — a form field, a
 * transform, a drag in the 3D canvas, an accepted AI proposal — becomes one
 * Operation appended to that log. One log means one history, which is what
 * dissolves v1's two competing undo stacks.
 */
import type Material from "@mat3ra/made/dist/js/Material";

/** Which machinery produced an operation. Shown as a badge on the chip. */
export type Engine = "native" | "notebook" | "repl" | "manual" | "ai";

/** Which surface the user acted through. Kept separate from `engine`:
 *  a supercell typed into a panel and one compiled by the assistant share an
 *  engine but not a source. */
export type OperationSource = "form" | "gesture" | "code" | "assistant" | "import";

export type OperationStatus = "ok" | "stale" | "error";

/** A compact summary of what a material looked like after an operation ran.
 *  Cheap to store, enough to render a chip without replaying. */
export interface ResultDigest {
    formula: string;
    atomCount: number;
    latticeType?: string;
    a?: number;
    b?: number;
    c?: number;
}

export interface Operation<P = Record<string, unknown>> {
    id: string;
    type: string;
    params: P;
    engine: Engine;
    source: OperationSource;
    /** Human label, computed at record time so chips never need the registry. */
    label: string;
    /** One-line parameter summary for the chip ("3x3x1", "site 41 -> P"). */
    digest?: string;
    result?: ResultDigest;
    status: OperationStatus;
    createdAt: number;
    /** Reproducibility context: an AI prompt, a notebook ref, library versions. */
    provenance?: Record<string, unknown>;
}

/**
 * A material document. The structure itself is derived (replay of `log`), never
 * stored — so lineage, undo, and "how was this made" are all one mechanism.
 */
export interface MaterialDoc {
    id: string;
    /** Lineage: the material this one was derived or forked from. */
    parentId?: string;
    /** Set membership, for combinatorial/interpolated batches shown as one row. */
    setId?: string;
    log: Operation[];
    /** Set when the host platform has persisted this material (v1's saved badge). */
    externalId?: string;
}

export interface SetDoc {
    id: string;
    label: string;
    /** The material the set-producing operation ran on. */
    sourceId: string;
    createdAt: number;
}

export interface SelectionModel {
    materialId?: string;
    siteIds: number[];
    anchor?: number;
}

/**
 * Undo is a stack of session-level changes, not state snapshots. Each entry
 * carries exactly what is needed to reverse and re-apply it, so undoing an
 * operation cannot resurrect unrelated state (v1 replayed whole-session
 * snapshots, which is why a stale callback could be restored with them).
 */
export type Change =
    | { kind: "op"; materialId: string; op: Operation }
    | { kind: "materials-added"; materialIds: string[]; docs: MaterialDoc[]; set?: SetDoc }
    | { kind: "material-removed"; doc: MaterialDoc; index: number }
    | { kind: "log-truncated"; materialId: string; removed: Operation[] };

export interface SessionState {
    materials: MaterialDoc[];
    sets: SetDoc[];
    activeId: string;
    selection: SelectionModel;
    past: Change[];
    future: Change[];
    /** Bumped on every mutation; lets memoized views invalidate cheaply. */
    revision: number;
}

/** A replayed material plus the digest of its current state. */
export interface ResolvedMaterial {
    doc: MaterialDoc;
    material: Material;
    digest: ResultDigest;
}
