/* eslint-disable react/sort-comp */
import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import { Made } from "@mat3ra/made";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import React from "react";
import s from "underscore.string";

import { theme } from "../../settings";
import BasisText from "./BasisText";

const ATOMS_VIEW = "atoms";

const ATOM_COLUMNS = [
    { field: "index", headerName: "Index", type: "number", width: 60 },
    { field: "element", headerName: "Element", width: 80 },
    { field: "label", headerName: "Label", type: "number", flex: 1, editable: true },
    {
        field: "startingMagnetization",
        headerName: "Starting Magnetization",
        type: "number",
        flex: 2,
        minWidth: 155,
        editable: true,
    },
];

class BasisEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xyzContent: this.getXyzWithoutLabels(props.material),
            basisView: Made.ATOMIC_COORD_UNITS.crystal,
            checks: props.material.getConsistencyChecks(),
        };

        this.handleBasisTextChange = this.handleBasisTextChange.bind(this);
    }

    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = this.props;
        if (material !== nextProps.material) {
            this.setState({
                xyzContent: this.getXyzWithoutLabels(nextProps.material),
                checks: nextProps.material.getConsistencyChecks(),
            });
        }
    }

    getXyzWithoutLabels = (material) =>
        material.getBasisAsXyz(
            false,
            material.getBasis().elements.map(({ value }) => value),
        );

    getXYZInCoordUnits = (material, coordinateUnits) => {
        switch (coordinateUnits) {
            case Made.ATOMIC_COORD_UNITS.cartesian:
                material.toCartesian();
                break;
            case Made.ATOMIC_COORD_UNITS.crystal:
                material.toCrystal();
                break;
            default:
                break;
        }
        return this.getXyzWithoutLabels(material);
    };

    handleBasisTextChange(content) {
        // "clone" original material from props to assert state updates
        const { material, onUpdate } = this.props;
        const { basisView } = this.state;
        const newMaterial = material.clone();
        newMaterial.setBasis(content, "xyz", basisView);
        const basis = newMaterial.getBasis();
        basis.copyLabelsAndStartingMagnetizationByIndex(material.getBasis());
        newMaterial.setBasis(basis.toJSON());
        onUpdate(newMaterial);
    }

    /** Returns one row per atom, in basis order, with its label and starting magnetization */
    getAtomRows() {
        const { material } = this.props;
        const basis = material.getBasis();
        const { atomicLabelsArray, startingMagnetizationArray } = basis;
        return basis.elements.map(({ id, value }, index) => ({
            id,
            index: index + 1,
            element: value,
            label: atomicLabelsArray[index] ?? null,
            startingMagnetization: startingMagnetizationArray[index],
        }));
    }

    /** Writes the edited row's values through made; made's validation refuses out-of-range ones */
    handleAtomRowUpdate = (updatedRow) => {
        const { material, onUpdate } = this.props;
        const rows = this.getAtomRows().map((row) => (row.id === updatedRow.id ? updatedRow : row));
        const entriesOf = (field) =>
            rows
                .filter((row) => row[field] !== null)
                .map((row) => ({ id: row.id, value: row[field] }));
        const newMaterial = material.clone();
        const basis = newMaterial.getBasis();
        basis.labels = entriesOf("label");
        basis.startingMagnetization = entriesOf("startingMagnetization");
        newMaterial.setBasis(basis.toJSON());
        onUpdate(newMaterial);
        return updatedRow;
    };

    handleAtomRowUpdateError = (error) =>
        error.details.error.forEach(({ instancePath, message }) =>
            showErrorAlert(`${instancePath} ${message}`),
        );

    renderBasisUnitsLabel = (unitsType = "crystal") => {
        return (
            <ToggleButton
                value={unitsType}
                sx={{
                    fontSize: theme.typography.caption.fontSize,
                }}
            >
                {s.capitalize(unitsType)} Units
            </ToggleButton>
        );
    };

    render() {
        const { basisView, checks, xyzContent } = this.state;
        const { material } = this.props;
        return (
            <Accordion defaultExpanded className="crystal-basis" elevation={2}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Crystal Basis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={0.125} id="crystal-basis">
                        <Grid item xs={12}>
                            <ToggleButtonGroup
                                id="basis-options"
                                value={basisView}
                                fullWidth
                                exclusive
                                size="small"
                                onChange={(e, view) => {
                                    this.setState({
                                        basisView: view,
                                        xyzContent: this.getXYZInCoordUnits(material, view),
                                    });
                                }}
                            >
                                {this.renderBasisUnitsLabel(Made.ATOMIC_COORD_UNITS.crystal)}
                                {this.renderBasisUnitsLabel(Made.ATOMIC_COORD_UNITS.cartesian)}
                                <ToggleButton
                                    value={ATOMS_VIEW}
                                    sx={{ fontSize: theme.typography.caption.fontSize }}
                                >
                                    Atoms
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12}>
                            {basisView === ATOMS_VIEW ? (
                                <DataGrid
                                    rows={this.getAtomRows()}
                                    columns={ATOM_COLUMNS}
                                    processRowUpdate={this.handleAtomRowUpdate}
                                    onProcessRowUpdateError={this.handleAtomRowUpdateError}
                                />
                            ) : (
                                <BasisText
                                    content={xyzContent}
                                    checks={checks}
                                    onChange={this.handleBasisTextChange}
                                />
                            )}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
        );
    }
}

BasisEditor.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default BasisEditor;
