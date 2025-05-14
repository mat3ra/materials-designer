import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/jsx-props-no-spreading */
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PropTypes from "prop-types";
import React from "react";
import _ from "underscore";
const paperStyle = {
    position: "absolute",
    top: "20%",
};
export class ActionDialog extends React.Component {
    render() {
        const { show, children, onClose, onSubmit, title, isLoading } = this.props;
        return (_jsxs(Dialog, { open: show, transitionDuration: 0, PaperProps: { style: paperStyle }, ..._.omit(this.props, "title", "show", "onClose", "onSubmit"), children: [_jsx(DialogTitle, { children: this.title || title }), _jsx(DialogContent, { children: _.isFunction(this.renderContent) ? this.renderContent() : children }), _jsxs(DialogActions, { children: [_jsx(Button, { "data-name": "Cancel", onClick: onClose, children: "Cancel" }), _jsx(Button, { "data-name": "Submit", onClick: this.onSubmit || onSubmit, disabled: isLoading, loading: isLoading, loadingPosition: "start", children: "Ok" })] })] }));
    }
}
ActionDialog.propTypes = {
    title: PropTypes.string,
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node,
    isLoading: PropTypes.bool,
};
ActionDialog.defaultProps = {
    title: "",
    children: null,
    isLoading: false,
};
