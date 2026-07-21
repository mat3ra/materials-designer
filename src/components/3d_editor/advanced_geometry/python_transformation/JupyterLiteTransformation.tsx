import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { darkScrollbar } from "@mui/material";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import React from "react";

import { MDMaterial } from "../../../../MDMaterial";
import { theme } from "../../../../settings";
import BaseJupyterLiteSessionComponent, {
    BaseJupyterLiteProps,
} from "../../../include/jupyterlite/BaseJupyterLiteComponent";
import MaterialsSelector from "./MaterialsSelector";

interface JupyterLiteTransformationDialogState {
    selectedMaterials: MDMaterial[];
    newMaterials: MDMaterial[];
}

class JupyterLiteTransformationDialog extends BaseJupyterLiteSessionComponent<
    BaseJupyterLiteProps,
    JupyterLiteTransformationDialogState
> {
    constructor(props: BaseJupyterLiteProps) {
        super(props);
        this.state = {
            selectedMaterials: [this.props.materials[0]],
            newMaterials: [],
        };
    }

    componentDidUpdate(
        prevProps: BaseJupyterLiteProps,
        prevState: JupyterLiteTransformationDialogState,
    ) {
        if (prevProps.materials !== this.props.materials) {
            this.setState({ selectedMaterials: [this.props.materials[0]] });
        }

        if (prevState.selectedMaterials !== this.state.selectedMaterials) {
            this.sendMaterials();
        }
    }

    handleSubmit = () => {
        const { newMaterials } = this.state;
        this.props.onMaterialsUpdate(newMaterials);
    };

    setMaterials = (newMaterials: MDMaterial[]) => {
        this.setState({ newMaterials });
    };

    getMaterialsToUse = () => {
        return this.state.selectedMaterials;
    };

    render() {
        const { title, show, onHide, materials } = this.props;
        const { selectedMaterials, newMaterials } = this.state;

        return (
            <Dialog
                id="jupyterlite-transformation-dialog"
                open={show}
                onClose={onHide}
                fullWidth
                maxWidth="xl"
                onSubmit={this.handleSubmit}
                title={title}
                isSubmitButtonDisabled={newMaterials.length === 0}
            >
                <Grid
                    container
                    spacing={1}
                    id="jupyterlite-transformation-dialog-content"
                    sx={{
                        height: "calc(100vh - 260px)",
                        ...(theme.palette.mode === "dark" ? darkScrollbar() : null),
                    }}
                >
                    <Grid item xs={12} md={4} alignItems="center">
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
                    <Grid
                        pt={0}
                        item
                        xs={12}
                        id="execution-cells"
                        sx={{
                            height: "calc(100% - 80px)",
                            overflow: "hidden",
                        }}
                    >
                        <Paper
                            sx={{
                                height: "100%",
                            }}
                        >
                            {super.render()}
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
                            setSelectedMaterials={(newMaterials) => this.setState({ newMaterials })}
                            testId="materials-out-selector"
                        />
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

export default JupyterLiteTransformationDialog;
