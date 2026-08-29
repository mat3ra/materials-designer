import { Made } from "@mat3ra/made";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import React from "react";
import _ from "underscore";

import type { MDMaterial } from "../../MDMaterial";
import LatticeConfigurationDialog from "./LatticeConfigurationDialog";

export interface LatticeProps {
    material: MDMaterial;
    onUpdate: (material: MDMaterial, index?: number) => void;
}

class Lattice extends React.Component<LatticeProps> {
    latticeTypeOptions = () => {
        return _.map(Made.LATTICE_TYPE_CONFIGS, (item) => {
            return {
                label: item.label,
                value: item.code,
            };
        });
    };

    latticeUnitOptions = () => {
        return _.map(Made.DEFAULT_LATTICE_UNITS.length, (value) => {
            return {
                label: value,
                value,
            };
        });
    };

    render() {
        const { material, onUpdate } = this.props;
        return (
            <Accordion className="crystal-lattice" elevation={2}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Crystal Lattice</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {/* Not actually a dialog: it renders a form inline in this accordion, and
                        read none of the modalId / show / backdropColor / onHide props it used to
                        be given. */}
                    <LatticeConfigurationDialog
                        unitOptions={this.latticeUnitOptions()}
                        typeOptions={this.latticeTypeOptions()}
                        material={material}
                        onUpdate={onUpdate}
                    />
                </AccordionDetails>
            </Accordion>
        );
    }
}

export default Lattice;
