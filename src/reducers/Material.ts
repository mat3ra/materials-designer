import { showWarningAlert } from "@mat3ra/cove/dist/other/alerts";
import type {
    MaterialMetadataBoundaryConditions,
    Matrix3X3Schema,
} from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import type { SlabConfigSchema } from "@mat3ra/made/dist/js/tools/surface";

import type { MaterialsSyncPayload } from "../components/repl/types";
import { displayMessage } from "../i18n/messages";
import { MDMaterial } from "../MDMaterial";

export type MDState = {
    index: number;
    isLoading: boolean;
    materials: MDMaterial[];
    updatedIndices: number[];
};

export function addUpdatedIndices(state: MDState, indices: number[]): MDState {
    const updated = new Set(state.updatedIndices);
    indices.forEach((i) => updated.add(i));
    return { ...state, updatedIndices: [...updated] };
}

export function isMaterialUpdated(state: MDState, index: number): boolean {
    return state.updatedIndices.includes(index);
}

function adjustUpdatedIndicesOnRemove(updatedIndices: number[], removedIndex: number): number[] {
    return updatedIndices
        .filter((i) => i !== removedIndex)
        .map((i) => (i > removedIndex ? i - 1 : i));
}

export function indicesForAddedMaterials(
    state: MDState,
    count: number,
    addAtIndex?: boolean,
): number[] {
    const index = state.index || 0;
    if (addAtIndex) {
        return Array.from({ length: count }, (_, i) => index + 1 + i);
    }
    const start = state.materials.length;
    return Array.from({ length: count }, (_, i) => start + i);
}

export function adjustUpdatedIndicesForRemove(state: MDState, removedIndex: number): MDState {
    return {
        ...state,
        updatedIndices: adjustUpdatedIndicesOnRemove(state.updatedIndices, removedIndex),
    };
}

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
    // TODO: consider adjusting the logic to avoid expensive cloning procedure below
    materials[index] = material;
    return addUpdatedIndices({ ...state, materials }, [index]);
}

export function materialsCloneOne(state: MDState): MDState {
    const materials = state.materials.slice(); // get copy of array
    const material = materials[state.index].clone();
    material.cleanOnCopy();
    material.name = "New Material";
    materials.push(material);
    return addUpdatedIndices({ ...state, materials }, [materials.length - 1]);
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
    const config = { name: action.name };
    const material = state.materials[action.index].clone(config);
    const update = { [action.index]: material };
    const materials = Object.assign([], state.materials, update);
    return addUpdatedIndices({ ...state, materials }, [action.index]);
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
            // Persist here: Material.toJSON schema-cleans top-level extras like outOfPlaneAxisIndex.
            outOfPlaneAxisIndex: slabConfig.outOfPlaneAxisIndex,
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

/** Replace one producer-owned region, while upserting round-tripped authored materials by id. */
export function materialsSyncScope(state: MDState, action: MaterialsSyncPayload): MDState {
    const selected = state.materials[state.index];
    const selectedId = selected?.id || selected?._id;
    const materials = state.materials.filter((material) => material.syncScope !== action.syncScope);

    const derived: MDMaterial[] = [];
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
                metadata: { ...existing?.metadata, ...config.metadata },
            });
            material.isUpdated = true;
            if (existingIndex >= 0) materials[existingIndex] = material;
            else if (!id) {
                material.syncScope = action.syncScope;
                derived.push(material);
            }
        });

    materials.push(...derived);
    const survivingSelection = selectedId
        ? materials.findIndex((material) => (material.id || material._id) === selectedId)
        : materials.indexOf(selected);
    const index =
        survivingSelection >= 0
            ? survivingSelection
            : Math.max(0, Math.min(state.index, materials.length - 1));
    return { ...state, materials, index };
}
