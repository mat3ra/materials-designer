import React from "react";
import { Material as MDMaterial } from "../../../../material";
import { ExecutionStatus } from "./CodeExecutionControls";
import { ExecutionCellState } from "./ExecutionCell";
import { Transformation } from "./TransformationSelector";
interface PythonTransformationProps {
    materials: MDMaterial[];
    show: boolean;
    onSubmit: (newMaterials: MDMaterial[]) => void;
    onHide: () => void;
}
interface PythonTransformationState {
    materials: MDMaterial[];
    selectedMaterials: MDMaterial[];
    newMaterials: MDMaterial[];
    executionStatus: ExecutionStatus;
    pyodide: any;
    transformation: Transformation | null;
    pythonCode: string;
    pythonOutput: string;
    executionCells: ExecutionCellState[];
}
type MapValue = string | number | Map<string, MapValue>;
interface PyodideDataMap {
    [key: string]: string | number | PyodideDataMap;
}
declare class PythonTransformation extends React.Component<PythonTransformationProps, PythonTransformationState> {
    constructor(props: PythonTransformationProps);
    componentDidUpdate(prevProps: PythonTransformationProps): void;
    onPyodideLoad: (pyodideInstance: any) => void;
    handleSubmit: () => Promise<void>;
    updateStateAtIndex: (stateArray: ExecutionCellState[], index: number, newState: ExecutionCellState) => void;
    executeSection: (sectionIndex: number) => Promise<void>;
    executeAllExecutionCells: () => Promise<void>;
    handleTransformationChange: (newPythonCode: string) => void;
    handleDownload: () => void;
    parseAndSetExecutionCells: (pythonCode: string) => void;
    mapToObject(map: Map<string, MapValue>): PyodideDataMap;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default PythonTransformation;
