/* eslint-disable react/sort-comp */
import type { BasisSchema, ConsistencyCheck } from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import React from "react";
import s from "underscore.string";

import type { MDMaterial } from "../../MDMaterial";
import { theme } from "../../settings";
import BasisTable from "./BasisTable";
import BasisText from "./BasisText";

/**
 * made types these two constants as plain `string`, but they are the only values the basis
 * accepts. Narrowed once here so everything downstream carries the union rather than a cast.
 */
const COORDINATE_UNITS = Made.ATOMIC_COORD_UNITS as {
    crystal: BasisSchema["units"];
    cartesian: BasisSchema["units"];
};

export interface BasisEditorProps {
    material: MDMaterial;
    onUpdate: (material: MDMaterial) => void;
}

interface BasisEditorState {
    xyzContent: string;
    coordinateUnits: BasisSchema["units"];
    checks: ConsistencyCheck[];
    viewMode: "text" | "table";
}

class BasisEditor extends React.Component<BasisEditorProps, BasisEditorState> {
    constructor(props: BasisEditorProps) {
        super(props);

        this.state = {
            xyzContent: props.material.getBasisAsXyz(),
            coordinateUnits: COORDINATE_UNITS.crystal,
            checks: props.material.getConsistencyChecks(),
            viewMode: "text",
        };

        this.handleBasisTextChange = this.handleBasisTextChange.bind(this);
    }

    UNSAFE_componentWillReceiveProps(nextProps: BasisEditorProps) {
        const { material } = this.props;
        if (material !== nextProps.material) {
            this.setState({
                xyzContent: nextProps.material.getBasisAsXyz(),
                checks: nextProps.material.getConsistencyChecks(),
            });
        }
    }

    getXYZInCoordUnits = (material: MDMaterial, coordinateUnits: BasisSchema["units"]) => {
        switch (coordinateUnits) {
            case COORDINATE_UNITS.cartesian:
                material.toCartesian();
                break;
            case COORDINATE_UNITS.crystal:
                material.toCrystal();
                break;
            default:
                break;
        }
        return material.getBasisAsXyz();
    };

    handleBasisTextChange(content: string) {
        // "clone" original material from props to assert state updates
        const { material, onUpdate } = this.props;
        const { coordinateUnits } = this.state;
        const newMaterial = material.clone();
        newMaterial.setBasis(content, "xyz", coordinateUnits);
        onUpdate(newMaterial);
    }

    renderBasisUnitsLabel = (unitsType: BasisSchema["units"] = "crystal") => {
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
                                {this.renderBasisUnitsLabel(COORDINATE_UNITS.crystal)}
                                {this.renderBasisUnitsLabel(COORDINATE_UNITS.cartesian)}
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

export default BasisEditor;
