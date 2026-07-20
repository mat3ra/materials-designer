import { showSuccessAlert, showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { exportToDisk } from "../utils/downloader";
import { addUpdatedIndices, adjustUpdatedIndicesForRemove, indicesForAddedMaterials, } from "./Material";
export function materialsAdd(state, action) {
    const index = state.index || 0;
    const actionMaterials = Array.isArray(action.materials) ? action.materials : [action.materials];
    const newMaterials = action.addAtIndex
        ? state.materials
            .slice(0, index + 1)
            .concat(actionMaterials)
            .concat(state.materials.slice(index + 1))
        : state.materials.concat(actionMaterials);
    const addedIndices = indicesForAddedMaterials(state, actionMaterials.length, action.addAtIndex);
    return addUpdatedIndices({ ...state, materials: newMaterials }, addedIndices);
}
export function materialsRemove(state, action) {
    const { index } = state;
    const materials = state.materials.slice();
    const indexToRemove = action.index;
    const newMaterials = materials.filter((_, i) => i !== indexToRemove);
    let newIndex = index;
    if (indexToRemove < index) {
        newIndex -= 1;
    }
    else if (indexToRemove === index) {
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
    return adjustUpdatedIndicesForRemove({ ...state, materials: newMaterials, index: newIndex }, indexToRemove);
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
