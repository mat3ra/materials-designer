import { ButtonProps } from "@mui/material/Button";
import React from "react";
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
declare function CodeExecutionControls(props: CodeExecutionControlsProps): React.JSX.Element;
export default CodeExecutionControls;
