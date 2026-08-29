import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import React from "react";

export type ExportFormat = "json" | "poscar";

export interface ExportActionDialogProps {
    title?: string;
    isOpen: boolean;
    onSubmit: (format: ExportFormat, useMultiple: boolean) => void;
    onHide: () => void;
    modalId: string;
}

interface ExportActionDialogState {
    format: ExportFormat;
    useMultiple: boolean;
}

class ExportActionDialog extends React.Component<ExportActionDialogProps, ExportActionDialogState> {
    constructor(props: ExportActionDialogProps) {
        super(props);
        this.state = {
            format: "json",
            useMultiple: false,
        };
    }

    handleFormatChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ format: event.target.value as ExportFormat });
    };

    /**
     * The select's values are "yes"/"no" while the state is a boolean. A shared handler used to
     * store the raw string, and because "no" is truthy the field snapped back to "yes" and every
     * export went out as "all items".
     */
    handleUseMultipleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ useMultiple: event.target.value === "yes" });
    };

    onSubmit = () => {
        const { onSubmit, onHide } = this.props;
        const { format, useMultiple } = this.state;
        onSubmit(format, useMultiple);
        onHide();
    };

    render() {
        const { format, useMultiple } = this.state;
        const { isOpen, title = "Export Items", onHide, modalId } = this.props;
        return (
            <Dialog
                id={modalId}
                title={title}
                open={isOpen}
                onClose={onHide}
                onSubmit={this.onSubmit}
            >
                <Grid container spacing={2} id="export-dialog">
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="export-format"
                            data-tid="export-format"
                            value={format}
                            label="Format"
                            size="small"
                            onChange={this.handleFormatChange}
                        >
                            <MenuItem value="json" key="json">
                                json
                            </MenuItem>
                            <MenuItem value="poscar" key="poscar">
                                poscar
                            </MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            select
                            fullWidth
                            id="export-use-multiple"
                            data-tid="export-use-multiple"
                            value={useMultiple ? "yes" : "no"}
                            label="Export All Items"
                            size="small"
                            onChange={this.handleUseMultipleChange}
                        >
                            <MenuItem value="yes" key="yes">
                                yes
                            </MenuItem>
                            <MenuItem value="no" key="no">
                                no
                            </MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

export default ExportActionDialog;
