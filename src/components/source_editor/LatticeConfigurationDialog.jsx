/* eslint-disable react/sort-comp */
import { Made } from "@mat3ra/made";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";

import { MDMaterial } from "../../MDMaterial";
import { deepClone } from "../../utils/index";

/**
 * @summary Crystal Lattice configuration dialog.
 *
 * @property {object} unitOptions unit options to provide
 * @property {object} typeOptions type options to provide
 * @property {object} lattice the lattice
 * @property {func} onSubmit submitting the data event
 */
class LatticeConfigurationDialog extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            lattice: props.material.lattice,
            // used to preserve Basis in Angstroms
            preserveBasis: false,
        };
    }

    UNSAFE_componentWillReceiveProps(newProps) {
        this.setState({ lattice: newProps.material.lattice });
    }

    // eslint-disable-next-line class-methods-use-this
    getEditModeOptions() {
        const options = ["Scale Interatomic Distances", "Preserve Interatomic Distances"];
        const result = [];
        options.forEach((item, i) => {
            result.push(
                <MenuItem value={i} key={item}>
                    {item}
                </MenuItem>,
            );
        });
        return result;
    }

    getLatticeUnitOptions() {
        const result = [];
        const { unitOptions } = this.props;
        unitOptions.forEach((item, i) => {
            result.push(
                // eslint-disable-next-line react/no-array-index-key
                <MenuItem value={item.value} key={"type" + i}>
                    {item.label}
                </MenuItem>,
            );
        });
        return result;
    }

    getLatticeTypeOptions() {
        const result = [];
        const { typeOptions } = this.props;
        typeOptions.forEach((item, i) => {
            result.push(
                // eslint-disable-next-line react/no-array-index-key
                <MenuItem value={item.value} key={"type" + i}>
                    {item.label}
                </MenuItem>,
            );
        });
        return result;
    }

    isDisabled = () => {
        // TODO: implement converter from primitive to conventional cells and re-enable editables
        // const lattice = new Made.Lattice(this.state.lattice);
        return false; // !lattice.editables[param];
    };

    handEditModeSelected = (e) => {
        const zeroOrOne = e.target.value;
        this.setState({ preserveBasis: Boolean(zeroOrOne) });
    };

    handleLatticeUnitSelected = (e) => {
        const { lattice } = this.state;
        const units = e.target.value;
        const newLattice = new Made.Lattice({
            ...lattice,
            units,
        });
        this.setState({ lattice: newLattice });
    };

    handleLatticeTypeSelected = (e) => {
        const { lattice } = this.state;
        const type = e.target.value;
        const newLattice = Made.Lattice.getDefaultPrimitiveLatticeConfigByType({
            ...lattice,
            type,
        });
        this.setState({ lattice: newLattice });
    };

    handleLatticeInputChanged = (e) => {
        const { lattice } = this.state;
        const val = Number(e.target.value);
        const { name } = e.target;
        const latticeConf = deepClone(lattice);
        latticeConf[name] = val;
        const newLattice = Made.Lattice.getDefaultPrimitiveLatticeConfigByType(latticeConf, true);
        this.setState({ lattice: newLattice });
    };

    handleUpdateLattice = () => {
        const { material, onUpdate, onSubmit } = this.props;
        const { preserveBasis, lattice } = this.state;
        const oldMaterialCopy = material.clone();
        if (preserveBasis) {
            oldMaterialCopy.toCartesian();
        } else {
            oldMaterialCopy.toCrystal();
        }
        const newMaterialConfig = {
            ...oldMaterialCopy.toJSON(),
            lattice,
        };

        // preserve basis if asked to do so (eg. when constructing a slab)
        const newMaterial = new MDMaterial(newMaterialConfig, oldMaterialCopy.constraints);
        // assert basis is stored in 'crystal' units
        newMaterial.toCrystal();
        onUpdate(newMaterial);
        onSubmit();
    };

    render() {
        const { submitButtonTxt } = this.props;
        const { preserveBasis, lattice } = this.state;
        return (
            <Box component="form" className="crystal-lattice-config">
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="form-lattice-units"
                            data-tid="units"
                            value={lattice.units.length}
                            label="Lattice units"
                            size="small"
                            onChange={this.handleLatticeUnitSelected}
                        >
                            {this.getLatticeUnitOptions()}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="form-lattice-type"
                            data-tid="type"
                            value={lattice.type}
                            label="Lattice type"
                            size="small"
                            onChange={this.handleLatticeTypeSelected}
                        >
                            {this.getLatticeTypeOptions()}
                        </TextField>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="lattice-a-length"
                            label="Lattice 'a'"
                            variant="outlined"
                            name="a"
                            size="small"
                            disabled={this.isDisabled("a")}
                            value={lattice.a}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            onFocus={(event) => event.target.select()}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="lattice-b-length"
                            label="Lattice 'b'"
                            variant="outlined"
                            name="b"
                            size="small"
                            disabled={this.isDisabled("b")}
                            value={lattice.b}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            onFocus={(event) => event.target.select()}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="lattice-c-length"
                            label="Lattice 'c'"
                            variant="outlined"
                            name="c"
                            size="small"
                            disabled={this.isDisabled("b")}
                            value={lattice.c}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            onFocus={(event) => event.target.select()}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="form-angle-b-c"
                            label="angle (b^c)"
                            variant="outlined"
                            name="alpha"
                            size="small"
                            disabled={this.isDisabled("alpha")}
                            value={lattice.alpha}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="form-angle-a-c"
                            label="angle (a^c)"
                            variant="outlined"
                            name="beta"
                            size="small"
                            disabled={this.isDisabled("beta")}
                            value={lattice.beta}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            fullWidth
                            id="form-angle-a-b"
                            label="angle (a^b)"
                            variant="outlined"
                            name="gamma"
                            size="small"
                            disabled={this.isDisabled("gamma")}
                            value={lattice.gamma}
                            type="number"
                            onChange={this.handleLatticeInputChanged}
                            InputProps={{
                                inputProps: {
                                    min: 0.05,
                                    step: 0.05,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="form-edit-mode"
                            data-tid="edit-mode"
                            value={preserveBasis ? 1 : 0}
                            label="Lattice units"
                            size="small"
                            onChange={this.handEditModeSelected}
                        >
                            {this.getEditModeOptions()}
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <Button
                            fullWidth
                            variant="text"
                            className="save-lattice-config"
                            onClick={this.handleUpdateLattice}
                            sx={{ pt: 1, pb: 1 }}
                        >
                            {submitButtonTxt}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        );
    }
}

LatticeConfigurationDialog.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    unitOptions: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    typeOptions: PropTypes.array.isRequired,
    submitButtonTxt: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

LatticeConfigurationDialog.defaultProps = {
    submitButtonTxt: "Apply Edits",
};

export default LatticeConfigurationDialog;
