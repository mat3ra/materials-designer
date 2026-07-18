import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import PropTypes from "prop-types";
import React from "react";

class ExportActionDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            format: "json",
            useMultiple: false,
        };
    }

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    onSubmit = () => {
        const { onSubmit, onHide } = this.props;
        const { format, useMultiple } = this.state;
        onSubmit(format, useMultiple);
        onHide();
    };

    render() {
        const { format, useMultiple } = this.state;
        const { isOpen, title, onHide, modalId } = this.props;
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
                            onChange={this.handleChange("format")}
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
                            onChange={this.handleChange("useMultiple")}
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
