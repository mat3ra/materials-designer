import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import type {
    MaterialMetadataBoundaryConditions,
    Matrix3X3Schema,
} from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import type { SlabConfigSchema } from "@mat3ra/made/dist/js/tools/surface";

import type { ReplSyncOperation } from "../components/repl/PyodideReplSession";
import { displayMessage } from "../i18n/messages";
import { MDMaterial } from "../MDMaterial";

export type MDState = {
    index: number;
    isLoading: boolean;
    materials: MDMaterial[];
};

export type SurfaceConfig = {
    h: number;
    k: number;
    l: number;
    thickness: number;
    vacuumRatio: number;
    vx: number;
    vy: number;
};

export function materialsUpdateOne(
    state: MDState,
    action: { material: MDMaterial; index?: number },
): MDState {
    const materials = state.materials.slice(); // get copy of array
    const index = action.index || state.index; // not passing index when modifying currently displayed material
    const material = action.material.clone(); // clone material to assert props re-render
    material.isUpdated = true; // to be used inside components
    // TODO: consider adjusting the logic to avoid expensive cloning procedure below
    materials[index] = material;
    return { ...state, materials };
}

export function materialsCloneOne(state: MDState): MDState {
    const materials = state.materials.slice(); // get copy of array
    const material = materials[state.index].clone();
    material.cleanOnCopy();
    material.name = "New Material";
    material.isUpdated = true;
    materials.push(material);
    return { ...state, materials };
}

export function materialsToggleIsNonPeriodicForOne(state: MDState): MDState {
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

export function materialsUpdateNameForOne(
    state: MDState,
    action: { name: string; index: number },
): MDState {
    const config = { name: action.name, isUpdated: true };
    const material = state.materials[action.index].clone(config);
    const update = { [action.index]: material };
    const materials = Object.assign([], state.materials, update);
    return { ...state, materials };
}

export function materialsGenerateSupercellForOne(
    state: MDState,
    action: { matrix: Matrix3X3Schema },
): MDState {
    const matrixAsNestedArray = action.matrix;
    const material = state.materials[state.index]; // only using currently active material
    const supercellConfig = Made.tools.supercell.generateConfig(material, matrixAsNestedArray);
    const supercell = new MDMaterial(supercellConfig);
    return materialsUpdateOne(state, { ...action, material: supercell });
}

function _setMetadataForSlabConfig(
    slabConfig: SlabConfigSchema,
    { h, k, l, thickness, vacuumRatio, vx, vy, material }: SurfaceConfig & { material: MDMaterial },
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

export function materialsGenerateSurfaceForOne(state: MDState, action: SurfaceConfig): MDState {
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
        ["a", "b", "c"][outOfPlaneAxisIndex] as "a" | "b" | "c",
        1 / (1 - vacuumRatio),
    );

    return materialsUpdateOne(state, {
        ...action,
        material: newMaterial,
    });
}

export type BoundaryConditionsType = NonNullable<MaterialMetadataBoundaryConditions>["type"];

export function materialsSetBoundaryConditionsForOne(
    state: MDState,
    action: { boundaryType: BoundaryConditionsType; boundaryOffset: number },
): MDState {
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

export function materialsUpdateIndex(state: MDState, action: { index: number }): MDState {
    return { ...state, index: action.index };
}

/**
 * Apply a batch of materials produced by one Python REPL execution, as a single state transition
 * (one undo step). Each operation carries the ESSE `config` and the stable `clientId` the session
 * assigned to the Python variable. The current slot is resolved by `replClientId` (robust to the
 * list being reindexed by removals/clones), so a known variable updates in place and a new/removed
 * one appends. The last touched material becomes active so the viewer follows it.
 *
 * We do not route through `materialsUpdateOne` here: its `action.index || state.index` treats slot 0
 * as falsy and would misdirect an update to the active material.
 */
export function materialsApplyReplSync(
    state: MDState,
    action: { operations: ReplSyncOperation[] },
): MDState {
    if (action.operations.length === 0) return state;
    const materials = state.materials.slice();
    let activeIndex = state.index;
    action.operations.forEach(({ variableName, clientId, config }) => {
        // Name the list item after the Python variable so the mapping is visible to the user.
        const material = new MDMaterial({ ...config, name: variableName });
        material.replClientId = clientId;
        material.isUpdated = true;
        const existingIndex = materials.findIndex((m) => m.replClientId === clientId);
        if (existingIndex >= 0) {
            materials[existingIndex] = material;
            activeIndex = existingIndex;
        } else {
            materials.push(material);
            activeIndex = materials.length - 1;
        }
    });
    return { ...state, materials, index: activeIndex };
}
