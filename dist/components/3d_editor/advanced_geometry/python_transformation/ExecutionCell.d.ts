import { ExecutionStatus } from "./CodeExecutionControls";
export interface ExecutionCellState {
    id: number;
    name: string;
    executionStatus: ExecutionStatus;
    content: string;
    output: string;
}
interface ExecutionCellProps extends ExecutionCellState {
    defaultExpanded: boolean;
    handleRun: () => void;
    setPythonCode: (pythonCode: string) => void;
    clearPythonOutput: () => void;
}
declare function ExecutionCell(props: ExecutionCellProps): import("react/jsx-runtime").JSX.Element;
export default ExecutionCell;
