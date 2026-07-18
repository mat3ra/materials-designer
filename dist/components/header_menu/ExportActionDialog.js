import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";
class ExportActionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = (name) => (event) => {
            this.setState({ [name]: event.target.value });
        };
        this.onSubmit = () => {
            const { onSubmit, onHide } = this.props;
            const { format, useMultiple } = this.state;
            onSubmit(format, useMultiple);
            onHide();
        };
        this.state = {
            format: "json",
            useMultiple: false,
        };
    }
    render() {
        const { format, useMultiple } = this.state;
        const { isOpen, title, onHide, modalId } = this.props;
        return (_jsx(Dialog, { id: modalId, title: title, open: isOpen, onClose: onHide, onSubmit: this.onSubmit, children: _jsxs(Grid, { container: true, spacing: 2, id: "export-dialog", children: [_jsx(Grid, { item: true, xs: 6, children: _jsxs(TextField, { select: true, fullWidth: true, id: "export-format", "data-tid": "export-format", value: format, label: "Format", size: "small", onChange: this.handleChange("format"), children: [_jsx(MenuItem, { value: "json", children: "json" }, "json"), _jsx(MenuItem, { value: "poscar", children: "poscar" }, "poscar")] }) }), _jsx(Grid, { item: true, xs: 6, children: _jsxs(TextField, { select: true, fullWidth: true, id: "export-use-multiple", "data-tid": "export-use-multiple", value: useMultiple ? "yes" : "no", label: "Export All Items", size: "small", onChange: this.handleChange("useMultiple"), children: [_jsx(MenuItem, { value: "yes", children: "yes" }, "yes"), _jsx(MenuItem, { value: "no", children: "no" }, "no")] }) })] }) }));
    }
}
ExportActionDialog.propTypes = {
    title: PropTypes.string,
    isOpen: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    modalId: PropTypes.string.isRequired,
};
ExportActionDialog.defaultProps = {
    title: "Export Items",
};
export default ExportActionDialog;
