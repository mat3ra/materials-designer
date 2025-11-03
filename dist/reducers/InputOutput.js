import { showSuccessAlert, showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { exportToDisk } from "../utils/downloader";
export function materialsAdd(state, action) {
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
export function materialsRemove(state, action) {
    const { index } = state;
    const { materials } = state; // Use the original materials array
    // Determine which indices to remove. If action.indices is empty, remove the currently selected material.
    const indicesToRemove = action.indices.length ? action.indices : [index];
    // Filter out the materials that are to be removed
    const newMaterials = materials.filter((_, i) => !indicesToRemove.includes(i));
    // Adjust the selected index
    let newIndex = index;
    indicesToRemove.forEach((removedIndex) => {
        if (removedIndex < newIndex) {
            newIndex -= 1;
        }
        else if (removedIndex === newIndex) {
            // If the selected material is removed, select the previous one, or the first if none before
            newIndex = Math.max(0, newIndex - 1);
        }
    });
    // Ensure the newIndex is within bounds
    if (newIndex >= newMaterials.length) {
        newIndex = Math.max(0, newMaterials.length - 1);
    }
    if (newMaterials.length === 0) {
        showWarningAlert("Prevented remove action: cannot remove all materials.");
        return state;
    }
    showSuccessAlert(`Removed materials at indices ${action.indices.join(", ")}.`);
    return { ...state, materials: newMaterials, index: newIndex };
}
export function materialsExport(state, action) {
    const exportHandlers = {
        json: (m) => JSON.stringify(m.toJSON()),
        poscar: (m) => m.getAsPOSCAR(),
    };
    const format = Object.keys(exportHandlers).includes(action.format) ? action.format : "json";
    const materials = action.useMultiple ? state.materials : [state.materials[state.index]];
    // TODO: download as a zip bundle when `action.useMultiple === true`
    materials.map((m) => exportToDisk(exportHandlers[format](m), m.name, format));
    return state;
}
