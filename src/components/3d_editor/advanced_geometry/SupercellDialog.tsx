import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import type { Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import math from "mathjs";
import React from "react";

/** The nine matrix cells, by the state key each input writes to. */
type MatrixKey = `m${1 | 2 | 3}${1 | 2 | 3}`;

export interface SupercellDialogProps {
    onSubmit: (matrix: Matrix3X3Schema) => void;
    onHide: () => void;
    isOpen: boolean;
    modalId: string;
}

type SupercellDialogState = Record<MatrixKey, number> & { message: string };

class SupercellDialog extends React.Component<SupercellDialogProps, SupercellDialogState> {
    constructor(props: SupercellDialogProps) {
        super(props);
        this.state = {
            m11: 1,
            m12: 0,
            m13: 0,
            m21: 0,
            m22: 1,
            m23: 0,
            m31: 0,
            m32: 0,
            m33: 1,
            message: "",
        };
        this.handleGenerateSupercell = this.handleGenerateSupercell.bind(this);
    }

    handleGenerateSupercell() {
        const { onSubmit, onHide } = this.props;
        const matrix = this.getMatrix();
        if (math.det(matrix) === 0) {
            this.setState({ message: "Matrix determinant must be non-zero." });
            return;
        }
        this.setState(
            {
                message: "",
            },
            () => {
                onSubmit(matrix.toArray() as unknown as Matrix3X3Schema);
                onHide();
            },
        );
    }

    getMatrix() {
        const { m11, m12, m13, m21, m22, m23, m31, m32, m33 } = this.state;

        return math.matrix([
            [m11, m12, m13],
            [m21, m22, m23],
            [m31, m32, m33],
        ]);
    }

    render() {
        const { message } = this.state;
        const { isOpen, onHide, modalId } = this.props;
        const matrix = this.getMatrix();

        return (
            <Dialog
                id={modalId}
                open={isOpen}
                title="Generate supercell with matrix `m_ij`"
                onClose={onHide}
                onSubmit={this.handleGenerateSupercell}
            >
                <Grid container spacing={2}>
                    {(matrix.toArray() as number[][]).map((rowOfElements, i) => {
                        return rowOfElements.map((element, j) => {
                            const elementName = `m${i + 1}${j + 1}` as MatrixKey;
                            return (
                                <Grid item xs={4} key={elementName}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={element}
                                        type="number"
                                        className={elementName}
                                        label={elementName}
                                        onChange={(e) => {
                                            this.setState({
                                                [elementName]: parseFloat(e.target.value),
                                            } as Pick<SupercellDialogState, MatrixKey>);
                                        }}
                                        InputProps={{
                                            inputProps: {
                                                step: 1,
                                            },
                                        }}
                                    />
                                </Grid>
                            );
                        });
                    })}
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

export default SupercellDialog;
