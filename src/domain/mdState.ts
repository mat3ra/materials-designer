/**
 * The `window.MDState` view.
 *
 * v1 published its whole reducer state on the window, and the Cypress suite reads it to assert what
 * the session actually holds — `win.MDState.materials.map((m) => m.toJSON())`. That is a contract
 * two repositories depend on, so 2.0 keeps publishing the same shape even though its own state is
 * an operation log rather than a list of materials.
 *
 * It is derived, never authoritative: the log stays the source of truth and this is a projection of
 * it. The same projection is what the embedded costume hands to the platform's save dialog.
 */
import { isModified, resolve } from "../core/replay";
import type { SessionState } from "../core/types";
import { MDMaterial } from "../MDMaterial";

export interface MDStateView {
    index: number;
    isLoading: boolean;
    materials: MDMaterial[];
    updatedIndices: number[];
}

export function toMDState(state: SessionState, isLoading = false): MDStateView {
    /*
     * Positions are counted against what is actually published.
     *
     * A material can fail to rebuild, or to serialise — some standard-library entries carry fields
     * the enhanced schema rejects — and a view that exists so other things can read the session
     * must never be the reason the session stops rendering. But dropping one while still counting
     * positions against the full list would be worse than crashing: `materials[index]` would point
     * at a different material, and the platform's save dialog writes whatever it is handed. So the
     * survivors are collected first and every index is derived from them.
     */
    const kept: { material: MDMaterial; modified: boolean }[] = [];
    let index = 0;

    state.materials.forEach((doc) => {
        let converted: MDMaterial;
        try {
            const { material } = resolve(doc);
            // externalId is the platform's own id; it travels back so a save updates that record
            // rather than creating a duplicate.
            converted = MDMaterial.fromMadeMaterial(
                material,
                doc.externalId ? { _id: doc.externalId } : {},
            );
        } catch {
            return;
        }
        if (doc.id === state.activeId) index = kept.length;
        kept.push({ material: converted, modified: isModified(doc) });
    });

    return {
        index,
        isLoading,
        materials: kept.map((entry) => entry.material),
        updatedIndices: kept
            .map((entry, position) => (entry.modified ? position : -1))
            .filter((position) => position >= 0),
    };
}
