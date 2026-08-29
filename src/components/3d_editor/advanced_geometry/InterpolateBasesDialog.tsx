import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { Made } from "@mat3ra/made";
import type { Basis } from "@mat3ra/made/dist/js/basis/basis";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React from "react";
import _ from "underscore";

import { displayMessage } from "../../../i18n/messages";
import { MDMaterial } from "../../../MDMaterial";
import BasisText from "../../source_editor/BasisText";

export interface InterpolateBasesDialogProps {
    title: string;
    isOpen: boolean;
    material: MDMaterial;
    material2: MDMaterial;
    onSubmit: (materials: MDMaterial[], addAtIndex?: boolean) => void;
    onHide: () => void;
    modalId: string;
}

interface InterpolateBasesDialogState {
    message: string;
    numberOfSteps: number;
    materialIndex: number;
}

class InterpolateBasesDialog extends React.Component<
    InterpolateBasesDialogProps,
    InterpolateBasesDialogState
> {
    constructor(props: InterpolateBasesDialogProps) {
        super(props);
        this.state = {
            message: "",
            numberOfSteps: 1,
            materialIndex: 0,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps: InterpolateBasesDialogProps) {
        const basis1 = nextProps.material.getBasis();
        const basis2 = nextProps.material2.getBasis();
        if (!_.isEqual(basis1.elementsArray, basis2.elementsArray)) {
            this.setState({ message: displayMessage("basis.elementsNotEqual") });
        } else {
            // reset the message
            this.setState({ message: "" });
        }
    }

    handleSubmit() {
        const { message, numberOfSteps } = this.state;
        // do nothing when bases elements are not equal
        if (message) return;

        const { material, material2, onSubmit } = this.props;

        const basis1 = material.getBasis();
        const basis2 = material2.getBasis();

        // create combinatorial set from a given basis.
        // `interpolate` is a plain function returning an array; calling it with `new` happened to
        // work - a constructor call yields the returned object - but it is not a constructor.
        // The casts are made's own variance wrinkle: ConstrainedBasis narrows `toJSON`, so it is
        // not assignable to the Basis this expects even though it is one.
        const newBases = Made.tools.basis.interpolate(
            basis1 as unknown as Basis,
            basis2 as unknown as Basis,
            numberOfSteps,
        );

        const newMaterials: MDMaterial[] = [];
        _.each(newBases, (newBasis, idx) => {
            const newMaterialConfig = {
                ...material.toJSON(),
                basis: newBasis.toJSON(),
                name: `${idx} - ${material.name} - ${newBasis.formula}`,
            };
            const newMaterial = new MDMaterial(newMaterialConfig);
            newMaterial.cleanOnCopy();
            newMaterials.push(newMaterial);
        });
        // pass up the chain and add materials with `atIndex = true`
        onSubmit(newMaterials, true);
    }

    getOptions = () => {
        return ["initial", "final"].map((value, idx) => {
            return (
                // eslint-disable-next-line react/no-array-index-key
                <MenuItem key={idx} value={idx}>
                    {value}
                </MenuItem>
            );
        });
    };

    render() {
        const { materialIndex, message, numberOfSteps } = this.state;
        const { isOpen, onHide, title, material, material2, modalId } = this.props;
        const xyzContent = [material, material2][materialIndex].getBasisAsXyz();

        return (
            <Dialog
                id={modalId}
                open={isOpen}
                title={title}
                onClose={onHide}
                onSubmit={this.handleSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            id="form-number-immediate-steps"
                            label="# of intermediate steps"
                            variant="outlined"
                            size="small"
                            value={numberOfSteps}
                            type="number"
                            onChange={(e) => {
                                this.setState({ numberOfSteps: parseInt(e.target.value, 10) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            className="materialIndex"
                            id="form-initial-final-structures"
                            value={materialIndex}
                            label="Initial/Final structures"
                            size="small"
                            onChange={(e) => {
                                this.setState({ materialIndex: parseInt(e.target.value, 10) });
                            }}
                        >
                            {this.getOptions()}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <BasisText readOnly content={xyzContent} message={message} />
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

export default InterpolateBasesDialog;
