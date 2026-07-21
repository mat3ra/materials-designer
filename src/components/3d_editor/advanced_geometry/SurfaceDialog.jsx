import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React from "react";

class SurfaceDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            h: 1,
            k: 0,
            l: 0,
            thickness: 3,
            vacuumRatio: 0.8,
            vx: 1,
            vy: 1,
            message: "",
        };
        this.handleGenerateSurface = this.handleGenerateSurface.bind(this);
    }

    handleGenerateSurface() {
        const { onSubmit, onHide } = this.props;

        this.setState(
            {
                message: "",
            },
            () => {
                onSubmit(this.state);
                onHide();
            },
        );
    }

    render() {
        const { message, h, k, l, thickness, vacuumRatio, vx, vy } = this.state;
        const { isOpen, onHide, modalId } = this.props;

        return (
            <Dialog
                id={modalId}
                open={isOpen}
                title="Generate surface/slab with parameters"
                onClose={onHide}
                onSubmit={this.handleGenerateSurface}
            >
                <Grid container id="surface" className="surface" spacing={2}>
                    <Grid item xs={4}>
                        <TextField
                            data-tid="miller-h"
                            fullWidth
                            label="Miller h"
                            variant="outlined"
                            size="small"
                            value={h}
                            type="number"
                            onChange={(e) => {
                                this.setState({ h: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            data-tid="miller-k"
                            fullWidth
                            label="Miller k"
                            variant="outlined"
                            size="small"
                            value={k}
                            type="number"
                            onChange={(e) => {
                                this.setState({ k: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField
                            data-tid="miller-l"
                            fullWidth
                            label="Miller l"
                            variant="outlined"
                            size="small"
                            value={l}
                            type="number"
                            onChange={(e) => {
                                this.setState({ l: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 0,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            data-tid="thickness"
                            fullWidth
                            label="Thickness in layers"
                            variant="outlined"
                            size="small"
                            value={thickness}
                            type="number"
                            onChange={(e) => {
                                this.setState({ thickness: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            data-tid="vacuum-ratio"
                            fullWidth
                            label="Vacuum ratio"
                            variant="outlined"
                            size="small"
                            value={vacuumRatio}
                            type="number"
                            onChange={(e) => {
                                this.setState({ vacuumRatio: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    step: 0.01,
                                    min: 0,
                                    max: 0.99,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            data-tid="vx"
                            fullWidth
                            label="Supercell dimension x"
                            variant="outlined"
                            size="small"
                            value={vx}
                            type="number"
                            onChange={(e) => {
                                this.setState({ vx: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            data-tid="vy"
                            fullWidth
                            label="Supercell dimension y"
                            variant="outlined"
                            size="small"
                            value={vy}
                            type="number"
                            onChange={(e) => {
                                this.setState({ vy: parseFloat(e.target.value) });
                            }}
                            InputProps={{
                                inputProps: {
                                    min: 1,
                                    step: 1,
                                },
                            }}
                        />
                    </Grid>
                </Grid>
                {message && (
                    <Typography variant="body1" color="error" textAlign="center">
                        {message}
                    </Typography>
                )}
            </Dialog>
        );
    }
}

SurfaceDialog.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    modalId: PropTypes.string.isRequired,
};

export default SurfaceDialog;
