import { showSuccessAlert, showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import type { MDMaterial } from "src/MDMaterial";

import { exportToDisk } from "../utils/downloader";
import type { MDState } from "./Material";

export function materialsAdd(
    state: MDState,
    action: { materials: MDMaterial[]; addAtIndex: number },
): MDState {
    const index = state.index || 0;
    const actionMaterials = action.materials;
    const newMaterials = action.addAtIndex
        ? state.materials
              .slice(0, index + 1)
              .concat(actionMaterials)
              .concat(state.materials.slice(index + 1))
        : state.materials.concat(actionMaterials);
    return { ...state, materials: newMaterials };
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

    showSuccessAlert(`Removed material at index ${indexToRemove}.`);
    return { ...state, materials: newMaterials, index: newIndex };
}

export function materialsExport(
    state: MDState,
    action: { format: "json" | "poscar"; useMultiple: boolean },
): MDState {
    const exportHandlers = {
        json: (m: MDMaterial) => JSON.stringify(m.toJSON()),
        poscar: (m: MDMaterial) => m.getAsPOSCAR(),
    };
    const format = Object.keys(exportHandlers).includes(action.format) ? action.format : "json";

    const materials = action.useMultiple ? state.materials : [state.materials[state.index]];
    // TODO: download as a zip bundle when `action.useMultiple === true`
    materials.map((m) => exportToDisk(exportHandlers[format](m), m.name, format));
    return state;
}
