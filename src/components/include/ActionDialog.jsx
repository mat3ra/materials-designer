/* eslint-disable react/jsx-props-no-spreading */
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
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
        return (
            <Dialog
                open={show}
                transitionDuration={0}
                PaperProps={{ style: paperStyle }}
                {..._.omit(this.props, "title", "show", "onClose", "onSubmit")}
            >
                <DialogTitle>{this.title || title}</DialogTitle>

                <DialogContent>
                    {_.isFunction(this.renderContent) ? this.renderContent() : children}
                </DialogContent>

                <DialogActions>
                    <Stack direction="row" spacing={2}>
                        <Button data-name="Cancel" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <LoadingButton
                            data-name="Submit"
                            onClick={this.onSubmit || onSubmit}
                            disabled={isLoading}
                            loading={isLoading}
                            loadingPosition="start"
                        >
                            Ok
                        </LoadingButton>
                    </Stack>
                </DialogActions>
            </Dialog>
        );
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
