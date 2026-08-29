/**
 * Replay: a material is the result of running its operation log in order.
 *
 * Logs are immutable (every mutation produces a new array), so the array
 * identity is a sound cache key — replaying only happens when a log actually
 * changed, and switching materials in the Navigator is free.
 */
import Material from "@mat3ra/made/dist/js/Material";

import { digestOf, getDefinition } from "./registry";
import type { MaterialDoc, Operation, ResolvedMaterial, ResultDigest } from "./types";

const cache = new WeakMap<Operation[], { material: Material; digest: ResultDigest }>();

export class ReplayError extends Error {
    constructor(message: string, readonly step: number, readonly op: Operation) {
        super(message);
        this.name = "ReplayError";
    }
}

/**
 * Run a log to a given step (default: all of it).
 * `upTo` is what the Timeline scrubber uses to show a past state.
 */
export function replay(log: Operation[], upTo = log.length): Material {
    if (log.length === 0) throw new Error("Cannot replay an empty log: no origin operation.");
    let material: Material | undefined;
    for (let i = 0; i < Math.min(upTo, log.length); i++) {
        const op = log[i];
        // A stale step is stepped over, not replayed.
        const def = op.disabled ? null : getDefinition(op.type);
        try {
            if (def) material = def.apply(material as Material, op.params);
        } catch (e) {
            throw new ReplayError(
                `Step ${i + 1} (${op.label}) failed: ${e instanceof Error ? e.message : String(e)}`,
                i,
                op,
            );
        }
    }
    return material as Material;
}

/**
 * Replay once, capturing the digest after every step.
 *
 * Used when a log is rewritten (editing a past step): each chip's recorded
 * result has to be recomputed, or the timeline shows the atom counts of a
 * history that no longer exists.
 */
export function replayWithDigests(log: Operation[]): {
    material: Material;
    digests: (ResultDigest | undefined)[];
} {
    if (log.length === 0) throw new Error("Cannot replay an empty log: no origin operation.");
    const digests: (ResultDigest | undefined)[] = [];
    let material: Material | undefined;
    for (let i = 0; i < log.length; i++) {
        const op = log[i];
        const def = op.disabled ? null : getDefinition(op.type);
        try {
            if (def) material = def.apply(material as Material, op.params);
        } catch (e) {
            throw new ReplayError(
                `Step ${i + 1} (${op.label}) failed: ${e instanceof Error ? e.message : String(e)}`,
                i,
                op,
            );
        }
        digests.push(def && material ? digestOf(material) : undefined);
    }
    return { material: material as Material, digests };
}

/** Replay with caching + digest. The Navigator/Viewport/Status bar all read this. */
export function resolve(doc: MaterialDoc): ResolvedMaterial {
    const hit = cache.get(doc.log);
    if (hit) return { doc, material: hit.material, digest: hit.digest };
    const material = replay(doc.log);
    const digest = digestOf(material);
    cache.set(doc.log, { material, digest });
    return { doc, material, digest };
}

/** The digest a chip shows, without paying for a full replay when recorded. */
export function digestAt(doc: MaterialDoc, step: number): ResultDigest | undefined {
    return doc.log[step]?.result;
}

/**
 * A material is "modified" when it carries operations beyond its origin.
 * Undoing back to the origin clears the marker — the revert-aware behaviour
 * v1 tracked with a side array of indices that drifted out of sync.
 */
export function isModified(doc: MaterialDoc): boolean {
    return doc.log.length > 1;
}
