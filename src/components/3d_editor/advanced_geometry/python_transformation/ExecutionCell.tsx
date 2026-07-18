import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React from "react";

import CodeExecutionControls, { ExecutionStatus } from "./CodeExecutionControls";
import PythonCodeDisplay from "./PythonCodeDisplay";

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

function ExecutionCell(props: ExecutionCellProps) {
    const {
        id,
        name,
        content,
        output,
        executionStatus,
        handleRun,
        setPythonCode,
        defaultExpanded,
        clearPythonOutput,
    } = props;
    const [expanded, setExpanded] = React.useState(defaultExpanded);

    const handleAccordionChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
    };
    return (
        <Accordion defaultExpanded={defaultExpanded} onChange={handleAccordionChange} elevation={6}>
            <AccordionSummary expandIcon={<IconByName name="shapes.arrow.down" sx={{ m: 1 }} />}>
                <Grid container alignItems="center">
                    <Grid item xs={10}>
                        <Typography>{name}</Typography>
                    </Grid>
                    <Grid item xs={2}>
                        <CodeExecutionControls
                            executionStatus={executionStatus}
                            handleRun={handleRun}
                            buttonProps={{
                                id: id.toString(),
                                title: "Run",
                                variant: expanded ? "outlined" : "text",
                            }}
                        />
                    </Grid>
                </Grid>
            </AccordionSummary>
            <AccordionDetails>
                <PythonCodeDisplay
                    name={id.toString()}
                    pythonCode={content}
                    pythonOutput={output}
                    setPythonCode={(newContent) => setPythonCode(newContent)}
                    clearPythonOutput={clearPythonOutput}
                />
            </AccordionDetails>
        </Accordion>
    );
}

export default ExecutionCell;
