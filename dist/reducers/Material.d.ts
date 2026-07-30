import type { MaterialMetadataBoundaryConditions, Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import type { ReplSyncOperation } from "../components/repl/MaterialsReplSession";
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
export declare function materialsUpdateOne(state: MDState, action: {
    material: MDMaterial;
    index?: number;
}): MDState;
export declare function materialsCloneOne(state: MDState): MDState;
export declare function materialsToggleIsNonPeriodicForOne(state: MDState): MDState;
export declare function materialsUpdateNameForOne(state: MDState, action: {
    name: string;
    index: number;
}): MDState;
export declare function materialsGenerateSupercellForOne(state: MDState, action: {
    matrix: Matrix3X3Schema;
}): MDState;
export declare function materialsGenerateSurfaceForOne(state: MDState, action: SurfaceConfig): MDState;
export type BoundaryConditionsType = NonNullable<MaterialMetadataBoundaryConditions>["type"];
export declare function materialsSetBoundaryConditionsForOne(state: MDState, action: {
    boundaryType: BoundaryConditionsType;
    boundaryOffset: number;
}): MDState;
export declare function materialsUpdateIndex(state: MDState, action: {
    index: number;
}): MDState;
/**
 * One state transition per execution, so a run is a single undo step. Slots are resolved by
 * `replClientId` rather than index, which survives the list being reindexed by removals/clones.
 * The last touched material becomes active so the viewer follows it.
 *
 * Deliberately not routed through `materialsUpdateOne`: its `action.index || state.index` treats
 * slot 0 as falsy and would misdirect an update to the active material.
 */
export declare function materialsApplyReplSync(state: MDState, action: {
    operations: ReplSyncOperation[];
}): MDState;
