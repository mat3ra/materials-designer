/* eslint-disable react/jsx-props-no-spreading */
import LoadingButton from "@mui/lab/LoadingButton";
import Button from "@mui/material/Button";
import Dialog, { type DialogProps } from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import React from "react";
import _ from "underscore";

const paperStyle = {
    position: "absolute" as const,
    top: "20%",
};

export interface ActionDialogProps {
    title?: string;
    show: boolean;
    onClose: () => void;
    onSubmit: () => void;
    children?: React.ReactNode;
    isLoading?: boolean;
    /**
     * Everything else is forwarded to MUI's Dialog. Subclasses have always passed extra props
     * through this way (modalId, backdropColor, …), so the index signature keeps that contract
     * rather than breaking consumers outside this repo.
     */
    [key: string]: unknown;
}

/**
 * Dialog shell with Cancel/Ok. Exported for consumers outside this repo, which subclass it and
 * supply `title`, `onSubmit` and `renderContent` as members - each one falls back to the matching
 * prop when a subclass does not define it.
 */
export class ActionDialog<P = unknown, S = unknown> extends React.Component<
    P & ActionDialogProps,
    S
> {
    /** Supplied by a subclass; falls back to the `title` prop. */
    title?: string;

    /** Supplied by a subclass; falls back to the `onSubmit` prop. */
    onSubmit?: () => void;

    /** Supplied by a subclass; falls back to `children`. */
    renderContent?: () => React.ReactNode;

    render() {
        const { show, children, onClose, onSubmit, title, isLoading } = this.props;
        // The base has never validated what subclasses forward; MUI does that at runtime.
        const passThrough = _.omit(
            this.props,
            "title",
            "show",
            "onClose",
            "onSubmit",
        ) as Partial<DialogProps>;
        return (
            <Dialog
                open={show}
                transitionDuration={0}
                PaperProps={{ style: paperStyle }}
                {...passThrough}
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
