import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import { Made } from "@mat3ra/made";
import { displayMessage } from "../i18n/messages";
import { MDMaterial } from "../MDMaterial";
export function materialsUpdateOne(state, action) {
    const materials = state.materials.slice(); // get copy of array
    const index = action.index || state.index; // not passing index when modifying currently displayed material
    const material = action.material.clone(); // clone material to assert props re-render
    material.isUpdated = true; // to be used inside components
    // TODO: consider adjusting the logic to avoid expensive cloning procedure below
    materials[index] = material;
    return { ...state, materials };
}
export function materialsCloneOne(state) {
    const materials = state.materials.slice(); // get copy of array
    const material = materials[state.index].clone();
    material.cleanOnCopy();
    material.name = "New Material";
    material.isUpdated = true;
    materials.push(material);
    return { ...state, materials };
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
    const config = { name: action.name, isUpdated: true };
    const material = state.materials[action.index].clone(config);
    const update = { [action.index]: material };
    const materials = Object.assign([], state.materials, update);
    return { ...state, materials };
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
/** Replace one producer-owned region, while upserting round-tripped authored materials by id. */
export function materialsSyncScope(state, action) {
    const selected = state.materials[state.index];
    const selectedId = (selected === null || selected === void 0 ? void 0 : selected.id) || (selected === null || selected === void 0 ? void 0 : selected._id);
    const materials = state.materials.filter((material) => material.syncScope !== action.syncScope);
    const derived = [];
    action.entities
        .filter((entity) => entity.type === "material")
        .forEach(({ name, config }) => {
        const id = config._id;
        const existingIndex = id
            ? materials.findIndex((candidate) => (candidate.id || candidate._id) === id)
            : -1;
        const existing = existingIndex >= 0 ? materials[existingIndex] : undefined;
        const material = new MDMaterial({
            ...config,
            name,
            metadata: { ...existing === null || existing === void 0 ? void 0 : existing.metadata, ...config.metadata },
        });
        material.isUpdated = true;
        if (existingIndex >= 0)
            materials[existingIndex] = material;
        else if (!id) {
            material.syncScope = action.syncScope;
            derived.push(material);
        }
    });
    materials.push(...derived);
    const survivingSelection = selectedId
        ? materials.findIndex((material) => (material.id || material._id) === selectedId)
        : materials.indexOf(selected);
    const index = survivingSelection >= 0
        ? survivingSelection
        : Math.max(0, Math.min(state.index, materials.length - 1));
    return { ...state, materials, index };
}
