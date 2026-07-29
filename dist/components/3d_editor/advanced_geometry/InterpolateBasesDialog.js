import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import { Made } from "@mat3ra/made";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";
import _ from "underscore";
import { displayMessage } from "../../../i18n/messages";
import { MDMaterial } from "../../../MDMaterial";
import BasisText from "../../source_editor/BasisText";
class InterpolateBasesDialog extends React.Component {
    constructor(props) {
        super(props);
        this.getOptions = () => {
            return ["initial", "final"].map((value, idx) => {
                return (
                // eslint-disable-next-line react/no-array-index-key
                _jsx(MenuItem, { value: idx, children: value }, idx));
            });
        };
        this.state = {
            message: "",
            numberOfSteps: 1,
            materialIndex: 0,
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        const basis1 = nextProps.material.getBasis();
        const basis2 = nextProps.material2.getBasis();
        if (!_.isEqual(basis1.elementsArray, basis2.elementsArray)) {
            this.setState({ message: displayMessage("basis.elementsNotEqual") });
        }
        else {
            // reset the message
            this.setState({ message: "" });
        }
    }
    handleSubmit() {
        const { message, numberOfSteps } = this.state;
        // do nothing when bases elements are not equal
        if (message)
            return;
        const { material, material2, onSubmit } = this.props;
        const basis1 = material.getBasis();
        const basis2 = material2.getBasis();
        // create combinatorial set from a given basis
        // eslint-disable-next-line new-cap
        const newBases = new Made.tools.basis.interpolate(basis1, basis2, numberOfSteps);
        const newMaterials = [];
        _.each(newBases, (newBasis, idx) => {
            const newMaterialConfig = {
                ...material.toJSON(),
                basis: newBasis.toJSON(),
                name: `${idx} - ${material.name} - ${newBasis.formula}`,
            };
            const newMaterial = MDMaterial.fromConfig(newMaterialConfig);
            newMaterial.cleanOnCopy();
            newMaterials.push(newMaterial);
        });
        // pass up the chain and add materials with `atIndex = true`
        onSubmit(newMaterials, true);
    }
    render() {
        const { materialIndex, message, numberOfSteps } = this.state;
        const { isOpen, onHide, title, material, material2, modalId } = this.props;
        const xyzContent = [material, material2][materialIndex].getBasisAsXyz();
        return (_jsx(Dialog, { id: modalId, open: isOpen, title: title, onClose: onHide, onSubmit: this.handleSubmit, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { fullWidth: true, id: "form-number-immediate-steps", label: "# of intermediate steps", variant: "outlined", size: "small", value: numberOfSteps, type: "number", onChange: (e) => {
                                this.setState({ numberOfSteps: parseInt(e.target.value, 10) });
                            }, InputProps: {
                                inputProps: {
                                    min: 0,
                                    step: 1,
                                },
                            } }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { select: true, fullWidth: true, className: "materialIndex", id: "form-initial-final-structures", value: materialIndex, label: "Initial/Final structures", size: "small", onChange: (e) => {
                                this.setState({ materialIndex: parseInt(e.target.value, 10) });
                            }, children: this.getOptions() }) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(BasisText, { readOnly: true, content: xyzContent, message: message }) })] }) }));
    }
}
InterpolateBasesDialog.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    material2: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    modalId: PropTypes.string.isRequired,
};
export default InterpolateBasesDialog;
