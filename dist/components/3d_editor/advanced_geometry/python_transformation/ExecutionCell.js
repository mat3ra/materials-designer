import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import React from "react";
import CodeExecutionControls from "./CodeExecutionControls";
import PythonCodeDisplay from "./PythonCodeDisplay";
function ExecutionCell(props) {
    const { id, name, content, output, executionStatus, handleRun, setPythonCode, defaultExpanded, clearPythonOutput, } = props;
    const [expanded, setExpanded] = React.useState(defaultExpanded);
    const handleAccordionChange = (_event, isExpanded) => {
        setExpanded(isExpanded);
    };
    return (_jsxs(Accordion, { defaultExpanded: defaultExpanded, onChange: handleAccordionChange, elevation: 6, children: [_jsx(AccordionSummary, { expandIcon: _jsx(IconByName, { name: "shapes.arrow.down", sx: { m: 1 } }), children: _jsxs(Grid, { container: true, alignItems: "center", children: [_jsx(Grid, { item: true, xs: 10, children: _jsx(Typography, { children: name }) }), _jsx(Grid, { item: true, xs: 2, children: _jsx(CodeExecutionControls, { executionStatus: executionStatus, handleRun: handleRun, buttonProps: {
                                    id: id.toString(),
                                    title: "Run",
                                    variant: expanded ? "outlined" : "text",
                                } }) })] }) }), _jsx(AccordionDetails, { children: _jsx(PythonCodeDisplay, { name: id.toString(), pythonCode: content, pythonOutput: output, setPythonCode: (newContent) => setPythonCode(newContent), clearPythonOutput: clearPythonOutput }) })] }));
}
export default ExecutionCell;
