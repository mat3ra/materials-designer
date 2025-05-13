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
    let { index } = state;
    const materials = state.materials.slice(); // clone original array to force update to components
    // if no indices passed -> remove the material at current index
    let indices = action.indices.length ? action.indices : [index];
    // sort indices to implement logic for index decrement in splice below
    indices = indices.sort();
    // sanity check
    if (materials.length === 1) {
        showWarningAlert("Prevented remove action: only one material in set.");
        return state;
    }
    // remove elements at indices (array is modified in place => subtract idx within `each`)
    indices.forEach((indicesArrayElement, idx) => {
        const currentMaterial = materials[indicesArrayElement - idx];
        const { formula } = currentMaterial;
        showSuccessAlert(`Removed material with index ${indicesArrayElement} and formula ${formula} from set.`);
        materials.splice(indicesArrayElement - idx, 1);
        // lower the current index if it is above the deleted material's index
        if (index > 0)
            index -= 1;
    });
    return { ...state, materials, index };
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
