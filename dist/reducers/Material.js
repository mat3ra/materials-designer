import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import { Made } from "@mat3ra/made";
import { displayMessage } from "../i18n/messages";
import { MDMaterial } from "../MDMaterial";
export function addUpdatedIndices(state, indices) {
    const updated = new Set(state.updatedIndices);
    indices.forEach((i) => updated.add(i));
    return { ...state, updatedIndices: [...updated] };
}
export function isMaterialUpdated(state, index) {
    return state.updatedIndices.includes(index);
}
function adjustUpdatedIndicesOnRemove(updatedIndices, removedIndex) {
    return updatedIndices
        .filter((i) => i !== removedIndex)
        .map((i) => (i > removedIndex ? i - 1 : i));
}
export function indicesForAddedMaterials(state, count, addAtIndex) {
    const index = state.index || 0;
    if (addAtIndex) {
        return Array.from({ length: count }, (_, i) => index + 1 + i);
    }
    const start = state.materials.length;
    return Array.from({ length: count }, (_, i) => start + i);
}
export function adjustUpdatedIndicesForRemove(state, removedIndex) {
    return {
        ...state,
        updatedIndices: adjustUpdatedIndicesOnRemove(state.updatedIndices, removedIndex),
    };
}
export function materialsUpdateOne(state, action) {
    const materials = state.materials.slice(); // get copy of array
    const index = action.index || state.index; // not passing index when modifying currently displayed material
    const material = action.material.clone(); // clone material to assert props re-render
    // TODO: consider adjusting the logic to avoid expensive cloning procedure below
    materials[index] = material;
    return addUpdatedIndices({ ...state, materials }, [index]);
}
export function materialsCloneOne(state) {
    const materials = state.materials.slice(); // get copy of array
    const material = materials[state.index].clone();
    material.cleanOnCopy();
    material.name = "New Material";
    materials.push(material);
    return addUpdatedIndices({ ...state, materials }, [materials.length - 1]);
}
export function materialsToggleIsNonPeriodicForOne(state) {
    const newMaterial = state.materials[state.index].clone({ hash: "", scaledHash: "" });
    // clone check
    if (newMaterial.id) {
        showWarningAlert("Prevented Toggle 'isNonPeriodic' action. Please start from a cloned material");
        return state;
    }
    newMaterial.isNonPeriodic = !newMaterial.isNonPeriodic;
    Made.tools.material.scaleLatticeToMakeNonPeriodic(newMaterial);
    Made.tools.material.translateAtomsToCenter(newMaterial);
    return materialsUpdateOne(state, { ...state, material: newMaterial });
}
export function materialsUpdateNameForOne(state, action) {
    const config = { name: action.name };
    const material = state.materials[action.index].clone(config);
    const update = { [action.index]: material };
    const materials = Object.assign([], state.materials, update);
    return addUpdatedIndices({ ...state, materials }, [action.index]);
}
export function materialsGenerateSupercellForOne(state, action) {
    const matrixAsNestedArray = action.matrix;
    const material = state.materials[state.index]; // only using currently active material
    const supercellConfig = Made.tools.supercell.generateConfig(material, matrixAsNestedArray);
    const supercell = new MDMaterial(supercellConfig);
    return materialsUpdateOne(state, { ...action, material: supercell });
}
function _setMetadataForSlabConfig(slabConfig, { h, k, l, thickness, vacuumRatio, vx, vy, material }) {
    const bulkId = material && (material.id || material._id);
    if (!bulkId)
        showWarningAlert(displayMessage("surface.noBulkId"));
    Object.assign(slabConfig, {
        metadata: {
            isSlab: true,
            h,
            k,
            l,
            thickness,
            vacuumRatio,
            vx,
            vy,
            bulkId,
        },
    });
}
export function materialsGenerateSurfaceForOne(state, action) {
    const material = state.materials[state.index]; // only using currently active material
    const { h, k, l, thickness, vacuumRatio, vx, vy } = action;
    const supercellConfig = Made.tools.surface.generateConfig(material, [h, k, l], thickness, vx, vy);
    const { outOfPlaneAxisIndex } = supercellConfig;
    _setMetadataForSlabConfig(supercellConfig, {
        ...action,
        material,
    });
    const newMaterial = new MDMaterial(supercellConfig);
    Made.tools.material.scaleOneLatticeVector(newMaterial, ["a", "b", "c"][outOfPlaneAxisIndex], 1 / (1 - vacuumRatio));
    return materialsUpdateOne(state, {
        ...action,
        material: newMaterial,
    });
}
export function materialsSetBoundaryConditionsForOne(state, action) {
    const newMaterial = state.materials[state.index].clone();
    newMaterial.metadata = {
        ...newMaterial.metadata,
        boundaryConditions: {
            type: action.boundaryType,
            offset: action.boundaryOffset,
        },
    };
    return materialsUpdateOne(state, Object.assign(action, { material: newMaterial }));
}
export function materialsUpdateIndex(state, action) {
    return { ...state, index: action.index };
}
