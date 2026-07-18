import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button, { ButtonProps } from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import React from "react";

import { theme } from "../../../../settings";

export enum ExecutionStatus {
    Idle = "idle",
    Loading = "loading",
    Running = "running",
    Ready = "ready",
    Error = "error",
}

interface CodeExecutionControlsProps {
    buttonProps?: ButtonProps;
    executionStatus: ExecutionStatus;
    handleRun: () => void;
}

function CodeExecutionControls(props: CodeExecutionControlsProps) {
    const {
        buttonProps = { id: "run", title: "Run", variant: "outlined" },
        handleRun,
        executionStatus,
    } = props;

    const statusIndicator = {
        [ExecutionStatus.Idle]: null,
        [ExecutionStatus.Loading]: null,
        [ExecutionStatus.Running]: null,
        [ExecutionStatus.Ready]: (
            <Chip
                icon={<IconByName name="shapes.check" color="success" />}
                label="Ready"
                variant="outlined"
            />
        ),
        [ExecutionStatus.Error]: (
            <Chip
                icon={<IconByName name="actions.cancel" color="error" />}
                label="Error"
                variant="outlined"
            />
        ),
    };

    const buttonStatusStyles = {
        [ExecutionStatus.Idle]: {
            disabled: false,
            indicator: <IconByName name="actions.execute" />,
        },
        [ExecutionStatus.Loading]: {
            disabled: true,
            indicator: (
                <CircularProgress color="secondary" size={theme.typography.button.fontSize} />
            ),
        },
        [ExecutionStatus.Running]: {
            disabled: true,
            indicator: <CircularProgress color="success" size={theme.typography.button.fontSize} />,
        },
        [ExecutionStatus.Ready]: {
            disabled: false,
            indicator: <IconByName name="actions.execute" />,
        },
        [ExecutionStatus.Error]: {
            disabled: false,
            indicator: <IconByName name="actions.execute" />,
        },
    };

    const { disabled, indicator } = buttonStatusStyles[executionStatus];

    return (
        <Box sx={{ display: "flex", justifyContent: "flex-end" }} gap={1}>
            <Box sx={{ display: "flex", alignItems: "center" }} gap={1}>
                {statusIndicator[executionStatus]}
            </Box>
            <Button
                id={`run-button-${buttonProps.id}`}
                className="run-button"
                variant={buttonProps.variant}
                size="small"
                color={buttonProps.color}
                onClick={(event) => {
                    event.stopPropagation();
                    handleRun();
                }}
                disabled={disabled}
            >
                <Typography variant="button">{buttonProps.title}</Typography>
                {indicator}
            </Button>
        </Box>
    );
}

export default CodeExecutionControls;
