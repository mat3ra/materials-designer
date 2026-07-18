import { jsx as _jsx } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove.js/dist/mui/components/dialog/Dialog";
import { showWarningAlert } from "@mat3ra/cove.js/dist/other/alerts";
import { Made } from "@mat3ra/made";
import PropTypes from "prop-types";
import React from "react";
import _ from "underscore";
import { displayMessage } from "../../../i18n/messages";
import { MDMaterial } from "../../../MDMaterial";
import BasisText from "../../source_editor/BasisText";
// TODO: adjust this component and SourceEditor to inherit from the same one - XYZBasisEditor
class CombinatorialBasisDialog extends React.Component {
    constructor(props) {
        super(props);
        const { material } = this.props;
        this.state = {
            xyz: material.getBasisAsXyz(),
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(content) {
        // update the input field immediately on typing
        this.setState({ xyz: content });
    }
    handleSubmit() {
        if (!this.BasisTextComponent.state.isContentValidated)
            return; // don't proceed if cannot validate xyz
        const { xyz } = this.state;
        const { material, onSubmit } = this.props;
        // TODO: avoid modifying materials directly inside this component move the below logic to reducer
        // create combinatorial set from a given basis
        const newBases = new Made.parsers.xyz.CombinatorialBasis(xyz).allBasisConfigs;
        if (!this.assertCombinatorialBasesCount(newBases))
            return;
        const newMaterials = [];
        // eslint-disable-next-line no-unused-vars
        _.each(newBases, (elm, idx) => {
            // first set units from existing material, as allBasises() returns no units
            const latticeConfig = material.lattice;
            const lattice = new Made.Lattice(latticeConfig);
            const basis = Made.Basis.fromElementsAndCoordinates({
                elements: elm.elements,
                coordinates: elm.coordinates,
                cell: lattice.vectorArrays,
                units: material.basis.units,
                labels: material.Basis.labels,
            });
            // then create material
            const newMaterialConfig = {
                ...material.toJSON(),
                basis: basis.toJSON(),
                name: `${material.name} - ${basis.formula}`,
            };
            const newMaterial = new MDMaterial(newMaterialConfig);
            newMaterial.cleanOnCopy();
            newMaterials.push(newMaterial);
        });
        // pass up the chain
        onSubmit(newMaterials);
    }
    assertCombinatorialBasesCount(bases) {
        const { maxCombinatorialBasesCount } = this.props;
        if (bases.length > maxCombinatorialBasesCount) {
            showWarningAlert(displayMessage("combinatorialBasesCountExceeded", maxCombinatorialBasesCount));
            return false;
        }
        return true;
    }
    render() {
        const { isOpen, onHide, modalId } = this.props;
        const { xyz } = this.state;
        return (_jsx(Dialog, { id: modalId, open: isOpen, title: "Generate Combinatorial Set", onClose: onHide, onSubmit: this.handleSubmit, children: _jsx(BasisText, { ref: (el) => {
                    this.BasisTextComponent = el;
                }, className: "combinatorial-basis", content: xyz, onChange: this.handleChange }) }));
    }
}
CombinatorialBasisDialog.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    maxCombinatorialBasesCount: PropTypes.number,
    modalId: PropTypes.string.isRequired,
};
CombinatorialBasisDialog.defaultProps = {
    maxCombinatorialBasesCount: 100,
};
export default CombinatorialBasisDialog;
