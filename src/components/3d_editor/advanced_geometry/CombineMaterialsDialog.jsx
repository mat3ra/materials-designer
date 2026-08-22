/* eslint-disable react/sort-comp */
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React from "react";

import BasisText from "../../source_editor/BasisText";
import {
    combineMaterials,
    findOverlappingAtoms,
    getDefaultName,
    getDefaultOffset,
} from "./combineMaterials";

const AXES = ["x", "y", "z"];

/** Offsets are held as typed text so a field can be cleared or start with "-" while editing. */
function toNumber(value) {
    const number = parseFloat(value);
    return Number.isFinite(number) ? number : 0;
}

/**
 * Combines several of the session's materials into one: the host keeps its lattice, and each
 * selected material is placed into it at a cartesian offset in angstrom.
 *
 * This replaces the multi-material scene of the removed THREE.js editor modal. Placement is
 * numeric here rather than drag-and-drop; the result can then be adjusted atom by atom in the 3D
 * editor's own edit mode.
 */
class CombineMaterialsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitialState();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { isOpen } = this.props;
        // The dialog stays mounted between openings, so a stale selection would otherwise be
        // waiting the next time it is opened - against a material list that may have changed.
        if (isOpen && !prevProps.isOpen) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState(this.getInitialState());
        }
    }

    getInitialState() {
        return { hostIndex: null, selected: {}, offsets: {}, name: null, message: "" };
    }

    /** Defaults to the material the session has active, until the user picks another host. */
    get hostIndex() {
        const { index, materials } = this.props;
        const { hostIndex } = this.state;
        const candidate = hostIndex === null ? index : hostIndex;
        return candidate >= 0 && candidate < materials.length ? candidate : 0;
    }

    get guestIndices() {
        const { selected } = this.state;
        const { materials } = this.props;
        return materials
            .map((material, index) => index)
            .filter((index) => index !== this.hostIndex && selected[index]);
    }

    get name() {
        const { materials } = this.props;
        const { name } = this.state;
        if (name !== null) return name;
        return getDefaultName(
            materials[this.hostIndex],
            this.guestIndices.map((index) => materials[index]),
        );
    }

    getOffset(materialIndex) {
        const { offsets } = this.state;
        return offsets[materialIndex] || getDefaultOffset(0);
    }

    handleHostChange = (event) => {
        const hostIndex = parseInt(event.target.value, 10);
        // Whatever was selected as a guest may now be the host; drop it from the selection.
        this.setState((state) => {
            const selected = { ...state.selected };
            delete selected[hostIndex];
            return { hostIndex, selected };
        });
    };

    handleToggleGuest = (materialIndex) => {
        this.setState((state) => {
            const selected = { ...state.selected };
            const offsets = { ...state.offsets };
            if (selected[materialIndex]) {
                delete selected[materialIndex];
                return { selected };
            }
            // A newly selected guest starts further along x than the ones already there, so
            // several of them do not land on top of each other.
            if (!offsets[materialIndex]) {
                offsets[materialIndex] = getDefaultOffset(Object.keys(selected).length);
            }
            selected[materialIndex] = true;
            return { selected, offsets };
        });
    };

    handleOffsetChange = (materialIndex, axisIndex, value) => {
        this.setState((state) => {
            const offset = [...(state.offsets[materialIndex] || getDefaultOffset(0))];
            offset[axisIndex] = value;
            return { offsets: { ...state.offsets, [materialIndex]: offset } };
        });
    };

    /** The merged material, or `null` with a reason when it cannot be built yet. */
    buildCombined() {
        const { materials } = this.props;
        const { guestIndices } = this;
        if (!guestIndices.length) return { material: null, error: "" };
        try {
            const material = combineMaterials({
                host: materials[this.hostIndex],
                guests: guestIndices.map((index) => ({
                    material: materials[index],
                    offset: this.getOffset(index).map(toNumber),
                })),
                name: this.name,
            });
            return { material, error: "" };
        } catch (error) {
            return { material: null, error: `Unable to combine these materials: ${error.message}` };
        }
    }

    handleSubmit() {
        const { onSubmit, onHide } = this.props;
        const { material, error } = this.buildCombined();
        if (!material) {
            this.setState({ message: error || "Select at least one material to combine." });
            return;
        }
        // Appended rather than inserted after the active material: the sources stay where the user
        // left them, and the combination arrives at the end of the list.
        onSubmit([material]);
        onHide();
    }

    renderGuestRow(material, materialIndex) {
        const { selected } = this.state;
        const isSelected = Boolean(selected[materialIndex]);
        const offset = this.getOffset(materialIndex);
        return (
            <Grid
                container
                spacing={1}
                alignItems="center"
                key={materialIndex}
                data-tid={`combine-guest-${materialIndex}`}
            >
                <Grid item xs={12} sm={5}>
                    <FormControlLabel
                        data-tid={`combine-guest-toggle-${materialIndex}`}
                        control={
                            <Checkbox
                                size="small"
                                checked={isSelected}
                                onChange={() => this.handleToggleGuest(materialIndex)}
                                inputProps={{ "aria-label": `Combine ${material.name}` }}
                            />
                        }
                        label={
                            <Typography variant="body2" noWrap>
                                {material.name}
                            </Typography>
                        }
                    />
                </Grid>
                {AXES.map((axis, axisIndex) => (
                    <Grid item xs={4} sm={2} key={axis}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={`${axis}, Å`}
                            disabled={!isSelected}
                            data-tid={`combine-offset-${axis}-${materialIndex}`}
                            value={offset[axisIndex]}
                            onChange={(e) =>
                                this.handleOffsetChange(materialIndex, axisIndex, e.target.value)
                            }
                            InputProps={{ inputProps: { step: 0.1 } }}
                        />
                    </Grid>
                ))}
            </Grid>
        );
    }

    render() {
        const { isOpen, onHide, title, modalId, materials } = this.props;
        const { message } = this.state;

        // Only while open: this dialog stays mounted, and merging on every toolbar render would
        // rebuild a basis nobody is looking at.
        const { material: combined, error } = isOpen
            ? this.buildCombined()
            : { material: null, error: "" };
        const overlapping = combined ? findOverlappingAtoms(combined) : [];
        const guestCount = this.guestIndices.length;

        let hint = message || error;
        if (!hint && !guestCount) hint = "Select at least one material to combine into the host.";
        if (!hint && overlapping.length) {
            hint = `${overlapping.length} pair(s) of atoms overlap - adjust the offsets if that is not intended.`;
        }

        return (
            <Dialog
                id={modalId}
                open={isOpen}
                title={title}
                onClose={onHide}
                onSubmit={this.handleSubmit}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            select
                            fullWidth
                            size="small"
                            data-tid="combine-host"
                            id="combine-host-material"
                            label="Host material (keeps its lattice)"
                            value={this.hostIndex}
                            onChange={this.handleHostChange}
                        >
                            {materials.map((material, index) => (
                                // eslint-disable-next-line react/no-array-index-key
                                <MenuItem key={index} value={index}>
                                    {material.name}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            size="small"
                            data-tid="combine-name"
                            id="combine-material-name"
                            label="Name of the combined material"
                            value={this.name}
                            onChange={(e) => this.setState({ name: e.target.value })}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                            Materials to add, and where to place each one relative to the host
                            origin. Each contributes the atoms of its own unit cell.
                        </Typography>
                    </Grid>
                    <Grid item xs={12} sx={{ maxHeight: 220, overflowY: "auto" }}>
                        {materials.length < 2 ? (
                            <Typography variant="body2" color="text.secondary">
                                Only one material in the session - import or clone another to
                                combine.
                            </Typography>
                        ) : (
                            materials.map((material, index) =>
                                index === this.hostIndex
                                    ? null
                                    : this.renderGuestRow(material, index),
                            )
                        )}
                    </Grid>

                    <Grid item xs={12}>
                        <BasisText
                            readOnly
                            content={combined ? combined.getBasisAsXyz(true) : ""}
                            message={hint}
                        />
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

CombineMaterialsDialog.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    modalId: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    materials: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
};

export default CombineMaterialsDialog;
