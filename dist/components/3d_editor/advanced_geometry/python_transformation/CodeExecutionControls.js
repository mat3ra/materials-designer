import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { theme } from "../../../../settings";
export var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["Idle"] = "idle";
    ExecutionStatus["Loading"] = "loading";
    ExecutionStatus["Running"] = "running";
    ExecutionStatus["Ready"] = "ready";
    ExecutionStatus["Error"] = "error";
})(ExecutionStatus || (ExecutionStatus = {}));
function CodeExecutionControls(props) {
    const { buttonProps = { id: "run", title: "Run", variant: "outlined" }, handleRun, executionStatus, } = props;
    const statusIndicator = {
        [ExecutionStatus.Idle]: null,
        [ExecutionStatus.Loading]: null,
        [ExecutionStatus.Running]: null,
        [ExecutionStatus.Ready]: (_jsx(Chip, { icon: _jsx(IconByName, { name: "shapes.check", color: "success" }), label: "Ready", variant: "outlined" })),
        [ExecutionStatus.Error]: (_jsx(Chip, { icon: _jsx(IconByName, { name: "actions.cancel", color: "error" }), label: "Error", variant: "outlined" })),
    };
    const buttonStatusStyles = {
        [ExecutionStatus.Idle]: {
            disabled: false,
            indicator: _jsx(IconByName, { name: "actions.execute" }),
        },
        [ExecutionStatus.Loading]: {
            disabled: true,
            indicator: (_jsx(CircularProgress, { color: "secondary", size: theme.typography.button.fontSize })),
        },
        [ExecutionStatus.Running]: {
            disabled: true,
            indicator: _jsx(CircularProgress, { color: "success", size: theme.typography.button.fontSize }),
        },
        [ExecutionStatus.Ready]: {
            disabled: false,
            indicator: _jsx(IconByName, { name: "actions.execute" }),
        },
        [ExecutionStatus.Error]: {
            disabled: false,
            indicator: _jsx(IconByName, { name: "actions.execute" }),
        },
    };
    const { disabled, indicator } = buttonStatusStyles[executionStatus];
    return (_jsxs(Box, { sx: { display: "flex", justifyContent: "flex-end" }, gap: 1, children: [_jsx(Box, { sx: { display: "flex", alignItems: "center" }, gap: 1, children: statusIndicator[executionStatus] }), _jsxs(Button, { id: `run-button-${buttonProps.id}`, className: "run-button", variant: buttonProps.variant, size: "small", color: buttonProps.color, onClick: (event) => {
                    event.stopPropagation();
                    handleRun();
                }, disabled: disabled, children: [_jsx(Typography, { variant: "button", children: buttonProps.title }), indicator] })] }));
}
export default CodeExecutionControls;
