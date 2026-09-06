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
    const materials = state.materials.flatMap((doc) => {
        const { material } = resolve(doc);
        try {
            // externalId is the platform's own id; it travels back so a save updates the right
            // record rather than creating a duplicate.
            return [
                MDMaterial.fromMadeMaterial(
                    material,
                    doc.externalId ? { _id: doc.externalId } : {},
                ),
            ];
        } catch {
            // Not every material in the standard library survives a round trip through the
            // enhanced schema — some carry fields it rejects. A view that exists so other things
            // can read the session must never be the reason the session stops rendering, so such
            // a material is left out of the projection rather than taking the app down with it.
            return [];
        }
    });

    return {
        index: Math.max(
            0,
            state.materials.findIndex((doc) => doc.id === state.activeId),
        ),
        isLoading,
        materials,
        updatedIndices: state.materials
            .map((doc, index) => (isModified(doc) ? index : -1))
            .filter((index) => index >= 0),
    };
}
