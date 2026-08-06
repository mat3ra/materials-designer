import { ButtonProps } from "@mui/material/Button";
export declare enum ExecutionStatus {
    Idle = "idle",
    Loading = "loading",
    Running = "running",
    Ready = "ready",
    Error = "error"
}
interface CodeExecutionControlsProps {
    buttonProps?: ButtonProps;
    executionStatus: ExecutionStatus;
    handleRun: () => void;
}
declare function CodeExecutionControls(props: CodeExecutionControlsProps): import("react/jsx-runtime").JSX.Element;
export default CodeExecutionControls;
