import { showWarningAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import { Made } from "@mat3ra/made";

import {
    MATERIALS_CLONE_ONE,
    MATERIALS_GENERATE_SUPERCELL_FOR_ONE,
    MATERIALS_GENERATE_SURFACE_FOR_ONE,
    MATERIALS_SET_BOUNDARY_CONDITIONS_FOR_ONE,
    MATERIALS_TOGGLE_IS_NON_PERIODIC_FOR_ONE,
    MATERIALS_UPDATE_INDEX,
    MATERIALS_UPDATE_NAME_FOR_ONE,
    MATERIALS_UPDATE_ONE,
} from "../actions";
import { displayMessage } from "../i18n/messages";
import { MDMaterial } from "../MDMaterial";

function materialsUpdateOne(state, action) {
    const materials = state.materials.slice(); // get copy of array
    const index = action.index || state.index; // not passing index when modifying currently displayed material
    const material = action.material.clone(); // clone material to assert props re-render
    material.isUpdated = true; // to be used inside components
    // TODO: consider adjusting the logic to avoid expensive cloning procedure below
    materials[index] = material;
    return { ...state, materials };
}

// eslint-disable-next-line no-unused-vars
function materialsCloneOne(state, action) {
    const materials = state.materials.slice(); // get copy of array
    const material = materials[state.index].clone();
    material.cleanOnCopy();
    material.name = "New Material";
    material.isUpdated = true;
    materials.push(material);
    return { ...state, materials };
}

// eslint-disable-next-line no-unused-vars
function materialsToggleIsNonPeriodicForOne(state, action) {
    const newMaterial = state.materials[state.index].clone({ hash: "", scaledHash: "" });
    // clone check
    if (newMaterial.id) {
        showWarningAlert(
            "Prevented Toggle 'isNonPeriodic' action. Please start from a cloned material",
        );
        return state;
    }
    newMaterial.isNonPeriodic = !newMaterial.isNonPeriodic;
    Made.tools.material.scaleLatticeToMakeNonPeriodic(newMaterial);
    Made.tools.material.translateAtomsToCenter(newMaterial);
    return materialsUpdateOne(state, { ...state, material: newMaterial });
}

function materialsUpdateNameForOne(state, action) {
    const config = { name: action.name, isUpdated: true };
    const material = state.materials[action.index].clone(config);
    const update = { [action.index]: material };
    const materials = Object.assign([], state.materials, update);
    return { ...state, materials };
}

function materialsGenerateSupercellForOne(state, action) {
    const matrixAsNestedArray = action.matrix;
    const material = state.materials[state.index]; // only using currently active material
    const supercellConfig = Made.tools.supercell.generateConfig(material, matrixAsNestedArray);
    const supercell = new MDMaterial(supercellConfig);
    return materialsUpdateOne(state, Object.assign(action, { material: supercell }));
}

function _setMetadataForSlabConfig(
    slabConfig,
    { h, k, l, thickness, vacuumRatio, vx, vy, material },
) {
    const bulkId = material && (material.id || material._id);
    if (!bulkId) showWarningAlert(displayMessage("surface.noBulkId"));

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

function materialsGenerateSurfaceForOne(state, action) {
    const material = state.materials[state.index]; // only using currently active material

    const { h, k, l, thickness, vacuumRatio, vx, vy } = action;
    const supercellConfig = Made.tools.surface.generateConfig(
        material,
        [h, k, l],
        thickness,
        vx,
        vy,
    );
    const { outOfPlaneAxisIndex } = supercellConfig;

    _setMetadataForSlabConfig(supercellConfig, {
        ...action,
        material,
    });

    const newMaterial = new MDMaterial(supercellConfig);
    Made.tools.material.scaleOneLatticeVector(
        newMaterial,
        ["a", "b", "c"][outOfPlaneAxisIndex],
        1 / (1 - vacuumRatio),
    );

    return materialsUpdateOne(state, Object.assign(action, { material: newMaterial }));
}

function materialsSetBoundaryConditionsForOne(state, action) {
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

export default {
    [MATERIALS_UPDATE_INDEX]: materialsUpdateIndex,
    [MATERIALS_UPDATE_ONE]: materialsUpdateOne,
    [MATERIALS_CLONE_ONE]: materialsCloneOne,
    [MATERIALS_UPDATE_NAME_FOR_ONE]: materialsUpdateNameForOne,
    [MATERIALS_GENERATE_SUPERCELL_FOR_ONE]: materialsGenerateSupercellForOne,
    [MATERIALS_GENERATE_SURFACE_FOR_ONE]: materialsGenerateSurfaceForOne,
    [MATERIALS_SET_BOUNDARY_CONDITIONS_FOR_ONE]: materialsSetBoundaryConditionsForOne,
    [MATERIALS_TOGGLE_IS_NON_PERIODIC_FOR_ONE]: materialsToggleIsNonPeriodicForOne,
};
