/* eslint-disable react/sort-comp */
import type { LatticeSchema } from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React from "react";

import { MDMaterial } from "../../MDMaterial";
import { deepClone } from "../../utils/index";

export interface LatticeOption {
    label: string;
    value: string;
}

export interface LatticeConfigurationDialogProps {
    unitOptions: LatticeOption[];
    typeOptions: LatticeOption[];
    submitButtonTxt?: string;
    material: MDMaterial;
    onUpdate: (material: MDMaterial, index?: number) => void;
    /** Optional: the only caller renders the form inline and has nothing to close. */
    onSubmit?: () => void;
}

interface LatticeConfigurationDialogState {
    lattice: LatticeSchema;
    /** Keeps the basis in Angstroms across the edit rather than rescaling it. */
    preserveBasis: boolean;
}

/**
 * @summary Crystal Lattice configuration dialog.
 *
 * @property {object} unitOptions unit options to provide
 * @property {object} typeOptions type options to provide
 * @property {object} lattice the lattice
 * @property {func} onSubmit submitting the data event
 */
class LatticeConfigurationDialog extends React.Component<
    LatticeConfigurationDialogProps,
    LatticeConfigurationDialogState
> {
    constructor(props: LatticeConfigurationDialogProps) {
        super(props);

        this.state = {
            lattice: props.material.lattice,
            // used to preserve Basis in Angstroms
            preserveBasis: false,
        };
    }

    UNSAFE_componentWillReceiveProps(newProps: LatticeConfigurationDialogProps) {
        this.setState({ lattice: newProps.material.lattice });
    }

    // eslint-disable-next-line class-methods-use-this
    getEditModeOptions() {
        const options = ["Scale Interatomic Distances", "Preserve Interatomic Distances"];
        const result: React.ReactElement[] = [];
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
        const result: React.ReactElement[] = [];
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
        const result: React.ReactElement[] = [];
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

    // TODO: implement converter from primitive to conventional cells and re-enable editables.
    // The parameter is what every call site already passes and what the commented-out lookup
    // below needs; it stays declared so the signature matches its use.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
    isDisabled = (param: string) => {
        // const lattice = new Made.Lattice(this.state.lattice);
        return false; // !lattice.editables[param];
    };

    handEditModeSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const zeroOrOne = e.target.value;
        this.setState({ preserveBasis: Boolean(zeroOrOne) });
    };

    handleLatticeUnitSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { lattice } = this.state;
        // `units` is `{ length, angle }`, and the dropdown edits the length unit. Assigning the
        // bare string here replaced the whole object, so the field's own value - read as
        // `lattice.units.length` - became the string's character count on the next render.
        const length = e.target.value as NonNullable<LatticeSchema["units"]>["length"];
        const newLattice = new Made.Lattice({
            ...lattice,
            units: { ...lattice.units, length },
        });
        this.setState({ lattice: newLattice });
    };

    handleLatticeTypeSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { lattice } = this.state;
        const type = e.target.value as LatticeSchema["type"];
        const newLattice = Made.Lattice.getDefaultPrimitiveLatticeConfigByType({
            ...lattice,
            type,
        });
        this.setState({ lattice: newLattice });
    };

    handleLatticeInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { lattice } = this.state;
        const val = Number(e.target.value);
        const { name } = e.target;
        const latticeConf = deepClone(lattice) as unknown as Record<string, unknown>;
        latticeConf[name] = val;
        // The second argument this used to pass is not in the signature and was ignored.
        const newLattice = Made.Lattice.getDefaultPrimitiveLatticeConfigByType(
            latticeConf as unknown as LatticeSchema,
        );
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
        const newMaterial = new MDMaterial(newMaterialConfig);
        // assert basis is stored in 'crystal' units
        newMaterial.toCrystal();
        onUpdate(newMaterial);
        onSubmit?.();
    };

    render() {
        const { submitButtonTxt = "Apply Edits" } = this.props;
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
                            value={lattice.units?.length ?? ""}
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

export default LatticeConfigurationDialog;
