import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import PyodideLoader from "@mat3ra/cove/dist/other/pyodide";
import { Made } from "@mat3ra/made";
import { darkScrollbar } from "@mui/material";
import Button from "@mui/material/Button";
import DialogContent from "@mui/material/DialogContent";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React from "react";

import { MDMaterial } from "../../../../MDMaterial";
import { theme } from "../../../../settings";
import { exportToDisk } from "../../../../utils/downloader";
import CodeExecutionControls, { ExecutionStatus } from "./CodeExecutionControls";
import ExecutionCell, { ExecutionCellState } from "./ExecutionCell";
import MaterialsSelector from "./MaterialsSelector";
import TransformationSelector, { Transformation } from "./TransformationSelector";

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
    // TODO: import type for Pyodide when they are available in Cove.js
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
const SECTION_HEADER = "BLOCK";
const SECTION_REGEX = new RegExp(
    `"""${SECTION_HEADER}: (.+?)"""\n([\\s\\S]+?)(?=(\n"""${SECTION_HEADER}|$))`,
    "g",
);

class PythonTransformation extends React.Component<
    PythonTransformationProps,
    PythonTransformationState
> {
    constructor(props: PythonTransformationProps) {
        super(props);
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

    componentDidUpdate(prevProps: PythonTransformationProps) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ materials });
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onPyodideLoad = (pyodideInstance: any) => {
        this.setState({ pyodide: pyodideInstance, executionStatus: ExecutionStatus.Idle });
        // redirecting stdout for print per https://pyodide.org/en/stable/usage/streams.html
        pyodideInstance.setStdout({
            batched: (text: string) => {
                this.setState((state) => ({
                    pythonOutput: state.pythonOutput + text + "\n",
                }));
            },
        });
    };

    handleSubmit = async () => {
        const { onSubmit, materials } = this.props;
        const { newMaterials } = this.state;

        onSubmit(newMaterials);
        this.setState({ selectedMaterials: [materials[0]], newMaterials: [] });
    };

    updateStateAtIndex = (
        stateArray: ExecutionCellState[],
        index: number,
        newState: ExecutionCellState,
    ) => {
        const newArray = [...stateArray];
        newArray[index] = { ...newArray[index], ...newState };
        this.setState({ executionCells: newArray });
    };

    executeSection = async (sectionIndex: number) => {
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
        } catch (error: unknown) {
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

        if (!result) return;
        try {
            const materials = result.get("materials_out").toJs();
            if (Array.isArray(materials)) {
                const newMaterials = materials.map((m: Map<string, MapValue>) => {
                    const material = this.mapToObject(m);
                    // material structure is returned in POSCAR format in python code
                    const config = Made.parsers.poscar.fromPoscar(material.poscar as string);
                    const newMaterial: MDMaterial = new MDMaterial(config);

                    return newMaterial;
                });
                this.setState({ newMaterials, executionStatus: ExecutionStatus.Ready });
            } else {
                throw new Error("Expected materials output, but none was found.");
            }
        } catch (error: unknown) {
            let errorMessage = "An unknown error occurred";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            showErrorAlert(errorMessage);
        }
    };

    executeAllExecutionCells = async () => {
        const { executionCells } = this.state;
        await executionCells.reduce(async (previousPromise, _, index) => {
            await previousPromise;
            return this.executeSection(index);
        }, Promise.resolve());
    };

    handleTransformationChange = (newPythonCode: string) => {
        this.setState({ pythonCode: newPythonCode });
        this.parseAndSetExecutionCells(newPythonCode);
    };

    handleDownload = () => {
        const { transformation, executionCells } = this.state;

        let newPythonCode = "";
        executionCells.forEach((section) => {
            const sectionHeader = `"""${SECTION_HEADER}: ${section.name}"""\n`;
            newPythonCode += sectionHeader + section.content;
        });

        const baseFilename = transformation?.title || "python_transformation";
        const extension = "py";

        exportToDisk(newPythonCode, baseFilename, extension);
    };

    parseAndSetExecutionCells = (pythonCode: string) => {
        let match;
        let idx = 0;
        const executionCellStates: ExecutionCellState[] = [];

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

    mapToObject(map: Map<string, MapValue>): PyodideDataMap {
        const obj: PyodideDataMap = {};
        map.forEach((value, key) => {
            if (value instanceof Map) {
                obj[key] = this.mapToObject(value);
            } else {
                obj[key] = value;
            }
        });
        return obj;
    }

    render() {
        const {
            pythonCode,
            transformation,
            materials,
            selectedMaterials,
            newMaterials,
            executionCells,
            executionStatus,
        } = this.state;
        const { show, onHide } = this.props;

        return (
            <Dialog
                id="python-transformation-dialog"
                open={show}
                onClose={onHide}
                fullWidth
                maxWidth="xl"
                onSubmit={this.handleSubmit}
                title="Python Transformation"
                isSubmitButtonDisabled={executionStatus !== ExecutionStatus.Ready}
            >
                <PyodideLoader onLoad={this.onPyodideLoad} triggerLoad={show} />
                {/*
                    TODO: (1) move the full-height dialog with padding to cove; (2) figure how to avoid using
                    dark scrolbar explicitly below (circa 2023-12-13 using CSSBaseLine did not work).
                    NOTE: the 220px below is the sum of dialog margin top/bottom + header/footer
                */}
                <DialogContent
                    sx={{
                        height: "calc(100vh - 260px)",
                        ...(theme.palette.mode === "dark" ? darkScrollbar() : null),
                    }}
                >
                    <Grid
                        container
                        spacing={2}
                        id="python-transformation-dialog-content"
                        sx={{ height: "100%" }}
                        alignItems="center"
                    >
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">Select Source Code</Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <TransformationSelector
                                transformation={transformation}
                                setTransformation={(newTransformation) =>
                                    this.setState({ transformation: newTransformation })
                                }
                                pythonCode={pythonCode}
                                setPythonCode={(newPythonCode) =>
                                    this.handleTransformationChange(newPythonCode)
                                }
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1">
                                Input Materials (<code>materials_in</code>)
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <MaterialsSelector
                                materials={materials}
                                selectedMaterials={selectedMaterials}
                                setSelectedMaterials={(newMaterials) =>
                                    this.setState({ selectedMaterials: newMaterials })
                                }
                                testId="materials-in-selector"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" display="flex" justifyContent="flex-end">
                                <Button
                                    id="download-code-button"
                                    color="secondary"
                                    onClick={this.handleDownload}
                                >
                                    Download Code
                                    <IconByName name="actions.download" />
                                </Button>
                                <CodeExecutionControls
                                    buttonProps={{
                                        id: "all",
                                        title: "Run All",
                                        variant: "contained",
                                        color: "primary",
                                    }}
                                    handleRun={this.executeAllExecutionCells}
                                    executionStatus={executionStatus}
                                />
                            </Stack>
                        </Grid>
                        {/*
                            in the height calculation below we use:
                            - DialogHeader: 64px
                            - DialogContent Header with two fields
                        */}
                        <Grid
                            pt={0}
                            item
                            xs={12}
                            id="execution-cells"
                            sx={{
                                height: "calc(100% - 180px)",
                                overflowY: "hidden",
                            }}
                        >
                            <Paper
                                sx={{
                                    height: "100%",
                                    overflowY: "auto",
                                }}
                            >
                                <Grid container spacing={1} pt={0}>
                                    {executionCells.map((section, index) => (
                                        <Grid item xs={12}>
                                            <ExecutionCell
                                                id={section.id}
                                                key={section.name}
                                                name={section.name}
                                                content={section.content}
                                                output={section.output}
                                                executionStatus={section.executionStatus}
                                                handleRun={() => this.executeSection(index)}
                                                setPythonCode={(newContent) =>
                                                    this.updateStateAtIndex(executionCells, index, {
                                                        ...executionCells[index],
                                                        content: newContent,
                                                    })
                                                }
                                                clearPythonOutput={() =>
                                                    this.updateStateAtIndex(executionCells, index, {
                                                        ...executionCells[index],
                                                        output: "",
                                                    })
                                                }
                                                // The last cell will have the parameters that people will change most of the time
                                                // so it's expanded by default
                                                defaultExpanded={
                                                    index === executionCells.length - 1
                                                }
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid item container xs={12} md={4} alignItems="center">
                            <Typography variant="subtitle1">
                                Output Materials (<code>materials_out</code>)
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <MaterialsSelector
                                materials={newMaterials}
                                selectedMaterials={newMaterials}
                                setSelectedMaterials={(newMaterials) =>
                                    this.setState({ newMaterials })
                                }
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
            </Dialog>
        );
    }
}

export default PythonTransformation;
