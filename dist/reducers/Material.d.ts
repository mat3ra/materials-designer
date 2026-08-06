import type { MaterialMetadataBoundaryConditions, Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import type { MaterialsSyncPayload } from "../components/repl/materialsDataBridge";
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
/** Replace one producer-owned region, while upserting round-tripped authored materials by id. */
export declare function materialsSyncScope(state: MDState, action: MaterialsSyncPayload): MDState;
