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
import PropTypes from "prop-types";
import React from "react";
import s from "underscore.string";

import { theme } from "../../settings";
import BasisTable from "./BasisTable";
import BasisText from "./BasisText";

class BasisEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xyzContent: props.material.getBasisAsXyz(),
            coordinateUnits: Made.ATOMIC_COORD_UNITS.crystal,
            checks: props.material.getConsistencyChecks(),
            viewMode: "text",
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
        onUpdate(newMaterial);
    }

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

    renderViewModeToggle() {
        const { viewMode } = this.state;
        return (
            <ToggleButtonGroup
                id="basis-view-mode"
                value={viewMode}
                exclusive
                size="small"
                onChange={(e, mode) => mode && this.setState({ viewMode: mode })}
            >
                <ToggleButton
                    value="text"
                    className="basis-view-text"
                    sx={{ fontSize: theme.typography.caption.fontSize }}
                >
                    Text
                </ToggleButton>
                <ToggleButton
                    value="table"
                    className="basis-view-table"
                    sx={{ fontSize: theme.typography.caption.fontSize }}
                >
                    Table
                </ToggleButton>
            </ToggleButtonGroup>
        );
    }

    render() {
        const { coordinateUnits, checks, xyzContent, viewMode } = this.state;
        const { material } = this.props;
        return (
            <Accordion defaultExpanded className="crystal-basis" elevation={2}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Crystal Basis</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={0.125} id="crystal-basis">
                        <Grid
                            item
                            xs={12}
                            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
                        >
                            <ToggleButtonGroup
                                id="basis-options"
                                value={coordinateUnits}
                                exclusive
                                size="small"
                                sx={{ flex: 1 }}
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
                            {this.renderViewModeToggle()}
                        </Grid>
                        <Grid item xs={12}>
                            {viewMode === "table" ? (
                                <BasisTable
                                    material={material}
                                    onChange={this.handleBasisTextChange}
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
