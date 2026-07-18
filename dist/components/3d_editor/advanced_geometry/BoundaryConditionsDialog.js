import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove.js/dist/mui/components/dialog/Dialog";
import { BOUNDARY_CONDITIONS } from "@exabyte-io/wave.js/dist/enums";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";
export class BoundaryConditionsDialog extends React.Component {
    constructor(props) {
        super(props);
        this.getBoundaryTypeOptions = () => {
            return BOUNDARY_CONDITIONS.map((e) => (_jsx(MenuItem, { value: e.type, children: e.name }, e.type)));
        };
        this.initializeState();
        this.handleSetBoundaryConditions = this.handleSetBoundaryConditions.bind(this);
    }
    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
        this.initializeState(true);
    }
    handleSetBoundaryConditions() {
        const { onSubmit, onHide } = this.props;
        onSubmit(this.state);
        onHide();
    }
    initializeState(isUpdating = false) {
        const { material } = this.props;
        if (!material.boundaryConditions) {
            material.boundaryConditions = {};
        }
        const updatedState = {
            boundaryType: material.boundaryConditions.type || "pbc",
            boundaryOffset: material.boundaryConditions.offset || 0,
        };
        if (!isUpdating) {
            this.state = updatedState;
        }
        else {
            this.setState(updatedState);
        }
    }
    render() {
        const { isOpen, title, onHide, modalId } = this.props;
        const { boundaryType, boundaryOffset } = this.state;
        return (_jsx(Dialog, { id: modalId, title: title, open: isOpen, onClose: onHide, onSubmit: this.handleSetBoundaryConditions, children: _jsxs(Grid, { container: true, spacing: 2, id: "boundary-conditions", children: [_jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { select: true, fullWidth: true, id: "form-boundary-conditions-type", "data-tid": "type", value: boundaryType, label: "Type", size: "small", sx: { minWidth: 0 }, onChange: (e) => this.setState({ boundaryType: e.target.value }), children: this.getBoundaryTypeOptions() }) }), _jsx(Grid, { item: true, xs: 6, children: _jsx(TextField, { fullWidth: true, id: "form-boundary-conditions-offset-a", "data-tid": "offset", label: "Offset (A)", variant: "outlined", size: "small", sx: { minWidth: 0 }, value: boundaryOffset, type: "number", onChange: (e) => this.setState({
                                boundaryOffset: parseFloat(e.target.value),
                            }), InputProps: {
                                inputProps: {
                                    min: 0,
                                },
                            } }) })] }) }));
    }
}
BoundaryConditionsDialog.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    modalId: PropTypes.string.isRequired,
};
BoundaryConditionsDialog.defaultProps = {
    title: "Set Boundary Conditions",
};
