import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import PyodideLoader from "@exabyte-io/cove.js/dist/other/pyodide";
import { Made } from "@mat3ra/made";
import { darkScrollbar } from "@mui/material";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";
import { Material as MDMaterial } from "../../../../material";
import { theme } from "../../../../settings";
import { exportToDisk } from "../../../../utils/downloader";
import CodeExecutionControls, { ExecutionStatus } from "./CodeExecutionControls";
import ExecutionCell from "./ExecutionCell";
import MaterialsSelector from "./MaterialsSelector";
import TransformationSelector from "./TransformationSelector";
const SECTION_HEADER = "BLOCK";
const SECTION_REGEX = new RegExp(`"""${SECTION_HEADER}: (.+?)"""\n([\\s\\S]+?)(?=(\n"""${SECTION_HEADER}|$))`, "g");
class PythonTransformation extends React.Component {
    constructor(props) {
        super(props);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.onPyodideLoad = (pyodideInstance) => {
            this.setState({ pyodide: pyodideInstance, executionStatus: ExecutionStatus.Idle });
            // redirecting stdout for print per https://pyodide.org/en/stable/usage/streams.html
            pyodideInstance.setStdout({
                batched: (text) => {
                    this.setState((state) => ({
                        pythonOutput: state.pythonOutput + text + "\n",
                    }));
                },
            });
        };
        this.handleSubmit = async () => {
            const { onSubmit, materials } = this.props;
            const { newMaterials } = this.state;
            onSubmit(newMaterials);
            this.setState({ selectedMaterials: [materials[0]], newMaterials: [] });
        };
        this.updateStateAtIndex = (stateArray, index, newState) => {
            const newArray = [...stateArray];
            newArray[index] = { ...newArray[index], ...newState };
            this.setState({ executionCells: newArray });
        };
        this.executeSection = async (sectionIndex) => {
            this.setState({ pythonOutput: "" });
            const { pyodide, executionCells, selectedMaterials } = this.state;
            this.updateStateAtIndex(executionCells, sectionIndex, {
                ...executionCells[sectionIndex],
                executionStatus: ExecutionStatus.Running,
            });
            const section = executionCells[sectionIndex];
            const { content } = section;
            // Designate a DOM element as the target for matplotlib plots supported by pyodide
            // as per https://github.com/pyodide/matplotlib-pyodide
            // @ts-ignore
            document.pyodideMplTarget = document.getElementById(`pyodide-plot-target-${sectionIndex}`);
            const convertedData = pyodide.toPy({ materials_in: selectedMaterials });
            let result;
            try {
                result = await pyodide.runPythonAsync(content, {
                    globals: convertedData,
                });
                const { pythonOutput } = this.state;
                this.updateStateAtIndex(executionCells, sectionIndex, {
                    ...executionCells[sectionIndex],
                    executionStatus: ExecutionStatus.Ready,
                    output: pythonOutput,
                });
            }
            catch (error) {
                let errorMessage = "An unknown error occurred";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                this.setState({ executionStatus: ExecutionStatus.Error });
                this.updateStateAtIndex(executionCells, sectionIndex, {
                    ...executionCells[sectionIndex],
                    executionStatus: ExecutionStatus.Error,
                    output: errorMessage + "\n",
                });
            }
            if (!result)
                return;
            try {
                const materials = result.get("materials_out").toJs();
                if (Array.isArray(materials)) {
                    const newMaterials = materials.map((m) => {
                        const material = this.mapToObject(m);
                        // material structure is returned in POSCAR format in python code
                        const config = Made.parsers.poscar.fromPoscar(material.poscar);
                        const newMaterial = new MDMaterial(config);
                        return newMaterial;
                    });
                    this.setState({ newMaterials, executionStatus: ExecutionStatus.Ready });
                }
                else {
                    throw new Error("Expected materials output, but none was found.");
                }
            }
            catch (error) {
                let errorMessage = "An unknown error occurred";
                if (error instanceof Error) {
                    errorMessage = error.message;
                }
                showErrorAlert(errorMessage);
            }
        };
        this.executeAllExecutionCells = async () => {
            const { executionCells } = this.state;
            await executionCells.reduce(async (previousPromise, _, index) => {
                await previousPromise;
                return this.executeSection(index);
            }, Promise.resolve());
        };
        this.handleTransformationChange = (newPythonCode) => {
            this.setState({ pythonCode: newPythonCode });
            this.parseAndSetExecutionCells(newPythonCode);
        };
        this.handleDownload = () => {
            const { transformation, executionCells } = this.state;
            let newPythonCode = "";
            executionCells.forEach((section) => {
                const sectionHeader = `"""${SECTION_HEADER}: ${section.name}"""\n`;
                newPythonCode += sectionHeader + section.content;
            });
            const baseFilename = (transformation === null || transformation === void 0 ? void 0 : transformation.title) || "python_transformation";
            const extension = "py";
            exportToDisk(newPythonCode, baseFilename, extension);
        };
        this.parseAndSetExecutionCells = (pythonCode) => {
            let match;
            let idx = 0;
            const executionCellStates = [];
            // eslint-disable-next-line no-cond-assign
            while ((match = SECTION_REGEX.exec(pythonCode)) !== null) {
                executionCellStates.push({
                    // eslint-disable-next-line no-plusplus
                    id: idx++,
                    name: match[1],
                    executionStatus: ExecutionStatus.Idle,
                    content: match[2],
                    output: "",
                });
            }
            this.setState({ executionCells: executionCellStates });
        };
        this.state = {
            materials: props.materials,
            selectedMaterials: [props.materials[0]],
            newMaterials: [],
            executionStatus: ExecutionStatus.Loading,
            pyodide: null,
            transformation: null,
            pythonCode: "",
            pythonOutput: "",
            executionCells: [],
        };
    }
    componentDidUpdate(prevProps) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ materials });
        }
    }
    mapToObject(map) {
        const obj = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = this.mapToObject(value);
            }
            else {
                obj[key] = value;
            }
        });
        return obj;
    }
    render() {
        const { pythonCode, transformation, materials, selectedMaterials, newMaterials, executionCells, executionStatus, } = this.state;
        const { show, onHide } = this.props;
        return (_jsxs(Dialog, { id: "python-transformation-dialog", open: show, onClose: onHide, fullWidth: true, maxWidth: "xl", onSubmit: this.handleSubmit, title: "Python Transformation", isSubmitButtonDisabled: executionStatus !== ExecutionStatus.Ready, children: [_jsx(PyodideLoader, { onLoad: this.onPyodideLoad, triggerLoad: show }), _jsx(DialogContent, { sx: {
                        height: "calc(100vh - 260px)",
                        ...(theme.palette.mode === "dark" ? darkScrollbar() : null),
                    }, children: _jsxs(Grid, { container: true, spacing: 2, id: "python-transformation-dialog-content", sx: { height: "100%" }, alignItems: "center", children: [_jsx(Grid, { item: true, xs: 12, md: 4, children: _jsx(Typography, { variant: "subtitle1", children: "Select Source Code" }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(TransformationSelector, { transformation: transformation, setTransformation: (newTransformation) => this.setState({ transformation: newTransformation }), pythonCode: pythonCode, setPythonCode: (newPythonCode) => this.handleTransformationChange(newPythonCode) }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(Typography, { variant: "subtitle1", children: ["Input Materials (", _jsx("code", { children: "materials_in" }), ")"] }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(MaterialsSelector, { materials: materials, selectedMaterials: selectedMaterials, setSelectedMaterials: (newMaterials) => this.setState({ selectedMaterials: newMaterials }), testId: "materials-in-selector" }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Stack, { direction: "row", display: "flex", justifyContent: "flex-end", children: [_jsxs(Button, { id: "download-code-button", color: "secondary", onClick: this.handleDownload, children: ["Download Code", _jsx(IconByName, { name: "actions.download" })] }), _jsx(CodeExecutionControls, { buttonProps: {
                                                id: "all",
                                                title: "Run All",
                                                variant: "contained",
                                                color: "primary",
                                            }, handleRun: this.executeAllExecutionCells, executionStatus: executionStatus })] }) }), _jsx(Grid, { pt: 0, item: true, xs: 12, id: "execution-cells", sx: {
                                    height: "calc(100% - 180px)",
                                    overflowY: "hidden",
                                }, children: _jsx(Paper, { sx: {
                                        height: "100%",
                                        overflowY: "auto",
                                    }, children: _jsx(Grid, { container: true, spacing: 1, pt: 0, children: executionCells.map((section, index) => (_jsx(Grid, { item: true, xs: 12, children: _jsx(ExecutionCell, { id: section.id, name: section.name, content: section.content, output: section.output, executionStatus: section.executionStatus, handleRun: () => this.executeSection(index), setPythonCode: (newContent) => this.updateStateAtIndex(executionCells, index, {
                                                    ...executionCells[index],
                                                    content: newContent,
                                                }), clearPythonOutput: () => this.updateStateAtIndex(executionCells, index, {
                                                    ...executionCells[index],
                                                    output: "",
                                                }), 
                                                // The last cell will have the parameters that people will change most of the time
                                                // so it's expanded by default
                                                defaultExpanded: index === executionCells.length - 1 }, section.name) }))) }) }) }), _jsx(Grid, { item: true, container: true, xs: 12, md: 4, alignItems: "center", children: _jsxs(Typography, { variant: "subtitle1", children: ["Output Materials (", _jsx("code", { children: "materials_out" }), ")"] }) }), _jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(MaterialsSelector, { materials: newMaterials, selectedMaterials: newMaterials, setSelectedMaterials: (newMaterials) => this.setState({ newMaterials }) }) })] }) })] }));
    }
}
export default PythonTransformation;
