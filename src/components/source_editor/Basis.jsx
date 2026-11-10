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
import BasisAtomsTable from "./BasisAtomsTable";
import BasisText from "./BasisText";

const ATOMS_VIEW = "atoms";

class BasisEditor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xyzContent: props.material.getBasisAsXyz(),
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
        const newMaterial = material.clone();
        newMaterial.setBasis(content, "xyz", material.basis.units);
        onUpdate(newMaterial);
    }

    renderBasisUnitsLabel = (unitsType = "crystal", label = `${s.capitalize(unitsType)} Units`) => {
        return (
            <ToggleButton
                value={unitsType}
                sx={{
                    fontSize: theme.typography.caption.fontSize,
                }}
            >
                {label}
            </ToggleButton>
        );
    };

    render() {
        const { basisView, checks, xyzContent } = this.state;
        const { material, onUpdate } = this.props;
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
                                {this.renderBasisUnitsLabel(ATOMS_VIEW, "Atoms")}
                            </ToggleButtonGroup>
                        </Grid>
                        <Grid item xs={12}>
                            {basisView === ATOMS_VIEW ? (
                                <div id="basis-atoms">
                                    <BasisAtomsTable material={material} onUpdate={onUpdate} />
                                </div>
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
