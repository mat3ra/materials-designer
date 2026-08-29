import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { BOUNDARY_CONDITIONS } from "@mat3ra/wave.js/dist/enums";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React from "react";

import type { MDMaterial } from "../../../MDMaterial";
import type { BoundaryConditionsType } from "../../../reducers/Material";

export interface BoundaryConditionsState {
    boundaryType: BoundaryConditionsType;
    boundaryOffset: number;
}

export interface BoundaryConditionsDialogProps {
    title?: string;
    isOpen: boolean;
    material: MDMaterial;
    onSubmit: (config: BoundaryConditionsState) => void;
    onHide: () => void;
    modalId: string;
}

export class BoundaryConditionsDialog extends React.Component<
    BoundaryConditionsDialogProps,
    BoundaryConditionsState
> {
    constructor(props: BoundaryConditionsDialogProps) {
        super(props);
        this.initializeState();
        this.handleSetBoundaryConditions = this.handleSetBoundaryConditions.bind(this);
    }

    UNSAFE_componentWillReceiveProps() {
        this.initializeState(true);
    }

    handleSetBoundaryConditions() {
        const { onSubmit, onHide } = this.props;

        onSubmit(this.state);
        onHide();
    }

    getBoundaryTypeOptions = () => {
        return BOUNDARY_CONDITIONS.map((e) => (
            <MenuItem key={e.type} value={e.type}>
                {e.name}
            </MenuItem>
        ));
    };

    initializeState(isUpdating = false) {
        const { material } = this.props;
        // `material.boundaryConditions` used to be defaulted to `{}` here. The getter already
        // returns `{}` when there is no metadata, so the branch never ran - and had it ever run it
        // would have thrown, since the property is a getter with no setter.
        // MDMaterial types it as a bare `object`; these are the two keys it actually carries.
        const boundaryConditions = material.boundaryConditions as {
            type?: BoundaryConditionsType;
            offset?: number;
        };
        const updatedState: BoundaryConditionsState = {
            boundaryType: boundaryConditions.type ?? "pbc",
            boundaryOffset: boundaryConditions.offset ?? 0,
        };
        if (!isUpdating) {
            this.state = updatedState;
        } else {
            this.setState(updatedState);
        }
    }

    render() {
        const { isOpen, title = "Set Boundary Conditions", onHide, modalId } = this.props;
        const { boundaryType, boundaryOffset } = this.state;

        return (
            <Dialog
                id={modalId}
                title={title}
                open={isOpen}
                onClose={onHide}
                onSubmit={this.handleSetBoundaryConditions}
            >
                <Grid container spacing={2} id="boundary-conditions">
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="form-boundary-conditions-type"
                            data-tid="type"
                            value={boundaryType}
                            label="Type"
                            size="small"
                            sx={{ minWidth: 0 }}
                            onChange={(e) =>
                                this.setState({
                                    boundaryType: e.target.value as BoundaryConditionsType,
                                })
                            }
                        >
                            {this.getBoundaryTypeOptions()}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            id="form-boundary-conditions-offset-a"
                            data-tid="offset"
                            label="Offset (A)"
                            variant="outlined"
                            size="small"
                            sx={{ minWidth: 0 }}
                            value={boundaryOffset}
                            type="number"
                            onChange={(e) =>
                                this.setState({
                                    boundaryOffset: parseFloat(e.target.value),
                                })
                            }
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                },
                            }}
                        />
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}
