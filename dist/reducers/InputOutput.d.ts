import type { MDMaterial } from "src/MDMaterial";
import type { MDState } from "./Material";
export declare function materialsAdd(state: MDState, action: {
    materials: MDMaterial[];
    addAtIndex: number;
}): MDState;
export declare function materialsRemove(state: MDState, action: {
    indices: number[];
}): MDState;
export declare function materialsExport(state: MDState, action: {
    format: "json" | "poscar";
    useMultiple: boolean;
}): MDState;
