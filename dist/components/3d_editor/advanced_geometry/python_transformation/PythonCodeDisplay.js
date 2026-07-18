import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import CodeMirror from "@mat3ra/cove.js/dist/other/codemirror";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { theme } from "../../../../settings";
// Functionality to clear the output with a button
const clearOutput = (name) => {
    const output = document.getElementById(`python-output-${name}`);
    if (output) {
        output.innerHTML = "";
    }
    const plotTarget = document.getElementById(`pyodide-plot-target-${name}`);
    if (plotTarget) {
        plotTarget.innerHTML = "";
    }
};
const PythonCodeDisplay = (props) => {
    const { name = "", pythonCode, pythonOutput, setPythonCode } = props;
    const { clearPythonOutput } = props;
    const handleClearOutput = () => {
        clearOutput(name);
        clearPythonOutput();
    };
    return (_jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { id: `python-code-input-${name}`, sx: {
                        border: `1px solid ${theme.palette.grey[800]}`,
                    }, children: _jsx(CodeMirror, { content: pythonCode, updateContent: (newContent) => setPythonCode(newContent), options: {
                            lineNumbers: true,
                        }, theme: "dark", language: "python" }) }) }), pythonOutput && (_jsxs(Grid, { item: true, xs: 12, children: [_jsx(Grid, { container: true, justifyContent: "flex-end", children: _jsxs(Button, { id: `clear-output-${name}`, color: "error", variant: "outlined", size: "small", onClick: handleClearOutput, children: [_jsx(Typography, { variant: "button", children: "Clear" }), _jsx(IconByName, { name: "actions.delete" })] }) }), _jsx(Box, { id: `python-output-${name}`, mt: theme.spacing(1), children: _jsx(CodeMirror, { content: pythonOutput, readOnly: true, options: {
                                lineNumbers: false,
                            }, theme: "dark", language: "python" }) })] })), _jsx(Grid, { item: true, xs: 12, children: _jsx(Box, { id: `pyodide-plot-target-${name}` }) })] }));
};
export default PythonCodeDisplay;
