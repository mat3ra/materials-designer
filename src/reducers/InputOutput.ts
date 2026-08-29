import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import type { MDMaterial } from "src/MDMaterial";

import { exportToDisk } from "../utils/downloader";
import {
    type MDState,
    addUpdatedIndices,
    adjustUpdatedIndicesForRemove,
    indicesForAddedMaterials,
    syncUpdatedIndexBySignature,
} from "./Material";

export function materialsAdd(
    state: MDState,
    action: { materials: MDMaterial | MDMaterial[]; addAtIndex?: boolean },
): MDState {
    const index = state.index || 0;
    const actionMaterials = Array.isArray(action.materials) ? action.materials : [action.materials];
    const newMaterials = action.addAtIndex
        ? state.materials
              .slice(0, index + 1)
              .concat(actionMaterials)
              .concat(state.materials.slice(index + 1))
        : state.materials.concat(actionMaterials);
    const addedIndices = indicesForAddedMaterials(state, actionMaterials.length, action.addAtIndex);
    // Materials arriving from outside the session (import, upload, transformation output) carry no
    // original signature, so they stay flagged as updated until saved.
    return addUpdatedIndices({ ...state, materials: newMaterials }, addedIndices);
}

export function materialsRemove(state: MDState, action: { index: number }): MDState {
    const { index } = state;
    const materials = state.materials.slice();
    const indexToRemove = action.index;

    const newMaterials = materials.filter((_, i) => i !== indexToRemove);

    let newIndex = index;
    if (indexToRemove < index) {
        newIndex -= 1;
    } else if (indexToRemove === index) {
        newIndex = Math.max(0, index - 1);
    }

    if (newIndex >= newMaterials.length) {
        newIndex = Math.max(0, newMaterials.length - 1);
    }

    if (newMaterials.length === 0) {
        showWarningAlert("Prevented remove action: cannot remove all materials.");
        return state;
    }

    // The removal is announced by the caller, which can offer to undo it.
    return adjustUpdatedIndicesForRemove(
        { ...state, materials: newMaterials, index: newIndex },
        indexToRemove,
    );
}

/**
 * Puts a removed material back where it was, keeping it selected. The material object carries its
 * own original signature, so restoring does not make an unedited material look edited.
 */
export function materialsInsertAt(
    state: MDState,
    action: { material: MDMaterial; index: number },
): MDState {
    const index = Math.max(0, Math.min(action.index, state.materials.length));
    const materials = [
        ...state.materials.slice(0, index),
        action.material,
        ...state.materials.slice(index),
    ];
    const updatedIndices = state.updatedIndices.map((i) => (i >= index ? i + 1 : i));
    // Shifting every flag at or past the insert point leaves `index` itself unflagged, so the
    // restored material is re-judged against its own original signature: an edited material that
    // was removed and put back is still edited.
    return syncUpdatedIndexBySignature({ ...state, materials, updatedIndices, index }, index);
}

const exportHandlers = {
    json: (m: MDMaterial) => JSON.stringify(m.toJSON()),
    poscar: (m: MDMaterial) => m.getAsPOSCAR(),
};

/**
 * The formats a material can be written as - the set of handlers above, so the two cannot drift.
 * Deliberately not `detectFormat`'s return type, which also includes "unknown" for text that
 * parses as neither.
 */
export type ExportFormat = keyof typeof exportHandlers;

export function materialsExport(
    state: MDState,
    action: { format: ExportFormat; useMultiple: boolean },
): MDState {
    const format = Object.keys(exportHandlers).includes(action.format) ? action.format : "json";

    const materials = action.useMultiple ? state.materials : [state.materials[state.index]];
    // TODO: download as a zip bundle when `action.useMultiple === true`
    materials.map((m) => exportToDisk(exportHandlers[format](m), m.name, format));
    return state;
}
