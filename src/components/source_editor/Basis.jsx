/* eslint-disable react/sort-comp */
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

class BasisEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xyzContent: props.material.getBasisAsXyz(),
            coordinateUnits: Made.ATOMIC_COORD_UNITS.crystal,
            checks: props.material.getConsistencyChecks(),
        };

        this.handleBasisTextChange = this.handleBasisTextChange.bind(this);
    }

    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const { material } = this.props;
        if (material !== nextProps.material) {
            this.setState({
                xyzContent: nextProps.material.getBasisAsXyz(),
                checks: nextProps.material.getConsistencyChecks(),
            });
        }
    }

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
        return material.getBasisAsXyz();
    };

    handleBasisTextChange(content) {
        // "clone" original material from props to assert state updates
        const { material, onUpdate } = this.props;
        const { coordinateUnits } = this.state;
        const newMaterial = material.clone();
        newMaterial.setBasis(content, "xyz", coordinateUnits);
        // XYZ text holds no starting magnetization and renumbers atoms by line: carry it by position
        const basis = newMaterial.getBasis();
        const atomIds = material.basis.elements.map(({ id }) => id).slice(0, basis.nAtoms);
        basis.startingMagnetization = material
            .getBasis()
            .startingMagnetization.filter(({ id }) => atomIds.includes(id))
            .map(({ id, value }) => ({ id: atomIds.indexOf(id), value }));
        newMaterial.setBasis(basis.toJSON());
        onUpdate(newMaterial);
    }

    getAtomRows() {
        const { material } = this.props;
        const basis = material.getBasis();
        const { labels, startingMagnetization } = basis;
        const valueOf = (entries, atomId) => entries.find(({ id }) => id === atomId)?.value ?? null;
        return basis.elements.map(({ id, value }, index) => ({
            id,
            index: index + 1,
            element: value,
            label: valueOf(labels, id),
            startingMagnetization: valueOf(startingMagnetization, id),
        }));
    }

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
        const { coordinateUnits, checks, xyzContent } = this.state;
        const { material } = this.props;
        const columns = [
            { field: "index", headerName: "Index", flex: 1 },
            { field: "element", headerName: "Element", flex: 1 },
            {
                field: "label",
                headerName: "Label",
                type: "number",
                flex: 1,
                editable: true,
                preProcessEditCellProps: ({ props }) => ({ ...props, error: props.value < 0 }),
            },
            {
                field: "startingMagnetization",
                headerName: "Starting Magnetization",
                type: "number",
                flex: 1,
                editable: true,
            },
        ];
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
                                value={coordinateUnits}
                                fullWidth
                                exclusive
                                size="small"
                                onChange={(e, unitsType) => {
                                    this.setState({
                                        coordinateUnits: unitsType,
                                        xyzContent: this.getXYZInCoordUnits(material, unitsType),
                                    });
                                }}
                            >
                                {this.renderBasisUnitsLabel(Made.ATOMIC_COORD_UNITS.crystal)}
                                {this.renderBasisUnitsLabel(Made.ATOMIC_COORD_UNITS.cartesian)}
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12}>
                            <BasisText
                                content={xyzContent}
                                checks={checks}
                                onChange={this.handleBasisTextChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <DataGrid
                                rows={this.getAtomRows()}
                                columns={columns}
                                processRowUpdate={this.handleAtomRowUpdate}
                            />
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
