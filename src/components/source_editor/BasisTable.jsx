import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";

const AXES = ["x", "y", "z"];
const COORDINATE_PRECISION = 6;

/** One row per site, read out of the material's basis. */
export function rowsFromMaterial(material) {
    const basis = material.getBasis();
    const constraintsByIndex = new Map(
        (basis.constraints || []).map(({ id, value }) => [id, value]),
    );
    return basis.elements.map(({ id, value }, index) => {
        const coordinates = basis.coordinates[index]?.value ?? [0, 0, 0];
        const constraint = constraintsByIndex.get(id) ?? [true, true, true];
        return {
            key: `${id}-${index}`,
            element: value,
            coordinates: coordinates.map((c) => Number(c)),
            constraints: AXES.map((_, axis) => constraint[axis] !== false),
        };
    });
}

/**
 * Serialises rows back to the XYZ text the basis editor already round-trips, so the table and the
 * text view share one mutation path. Constraint columns are only written when a site is actually
 * constrained, keeping the text identical to what the app produces today for free bases.
 */
export function rowsToXyz(rows) {
    const anyConstrained = rows.some(({ constraints }) => constraints.some((free) => !free));
    return `${rows
        .map(({ element, coordinates, constraints }) => {
            const position = coordinates
                .map((value) => Number(value || 0).toFixed(COORDINATE_PRECISION))
                .join("    ");
            const flags = anyConstrained
                ? `    ${constraints.map((free) => (free ? 1 : 0)).join(" ")}`
                : "";
            return `${element}    ${position}${flags}`;
        })
        .join("\n")}\n`;
}

/**
 * Spreadsheet view of the basis: the same state as the XYZ text, but with one input per value so a
 * single coordinate can be corrected without hand-editing a text buffer.
 */
class BasisTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = { rows: rowsFromMaterial(props.material), editingKey: null };
    }

    // eslint-disable-next-line no-unused-vars
    UNSAFE_componentWillReceiveProps(nextProps) {
        const { material } = this.props;
        // Do not pull the material back in mid-keystroke: it would reformat the cell being typed.
        if (material !== nextProps.material && this.state.editingKey === null) {
            this.setState({ rows: rowsFromMaterial(nextProps.material) });
        }
    }

    commit = (rows) => {
        const { onChange } = this.props;
        this.setState({ rows });
        onChange(rowsToXyz(rows));
    };

    updateRow = (index, changes, { commit = true } = {}) => {
        const { rows } = this.state;
        const next = rows.map((row, i) => (i === index ? { ...row, ...changes } : row));
        if (commit) this.commit(next);
        else this.setState({ rows: next });
    };

    addRow = () => {
        const { rows } = this.state;
        this.commit([
            ...rows,
            {
                key: `new-${rows.length}-${Date.now()}`,
                element: rows[rows.length - 1]?.element || "Si",
                coordinates: [0, 0, 0],
                constraints: [true, true, true],
            },
        ]);
    };

    removeRow = (index) => {
        const { rows } = this.state;
        if (rows.length <= 1) return;
        this.commit(rows.filter((_, i) => i !== index));
    };

    renderCoordinateCell(row, rowIndex, axis) {
        const { editingKey } = this.state;
        const isEditing = editingKey === `${row.key}-${axis}`;
        const raw = row.coordinates[axis];
        return (
            <TableCell key={AXES[axis]} sx={{ p: 0.25 }}>
                <TextField
                    variant="standard"
                    size="small"
                    className={`basis-cell basis-cell-${AXES[axis]}`}
                    value={isEditing ? raw : Number(raw).toFixed(3)}
                    inputProps={{
                        "aria-label": `${AXES[axis]} of site ${rowIndex + 1}`,
                        style: { fontFamily: "monospace", fontSize: "0.78rem" },
                    }}
                    InputProps={{ disableUnderline: !isEditing }}
                    onFocus={() => this.setState({ editingKey: `${row.key}-${axis}` })}
                    onChange={(event) => {
                        const coordinates = [...row.coordinates];
                        coordinates[axis] = event.target.value;
                        this.updateRow(rowIndex, { coordinates }, { commit: false });
                    }}
                    onBlur={() => {
                        const coordinates = row.coordinates.map((value) => Number(value) || 0);
                        this.setState({ editingKey: null });
                        this.updateRow(rowIndex, { coordinates });
                    }}
                />
            </TableCell>
        );
    }

    render() {
        const { rows } = this.state;
        return (
            <Box className="basis-table" sx={{ width: "100%", overflowX: "auto" }}>
                <Table size="small" padding="none">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ color: theme.palette.grey[600] }}>#</TableCell>
                            <TableCell sx={{ color: theme.palette.grey[600] }}>ELEMENT</TableCell>
                            {AXES.map((axis) => (
                                <TableCell key={axis} sx={{ color: theme.palette.grey[600] }}>
                                    {axis.toUpperCase()}
                                </TableCell>
                            ))}
                            <Tooltip title="Allow movement along x, y, z during relaxation">
                                <TableCell sx={{ color: theme.palette.grey[600] }}>FREE</TableCell>
                            </Tooltip>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, rowIndex) => (
                            <TableRow key={row.key} hover className="basis-table-row">
                                <TableCell sx={{ color: theme.palette.grey[600], width: 24 }}>
                                    {rowIndex + 1}
                                </TableCell>
                                <TableCell sx={{ p: 0.25, width: 64 }}>
                                    <TextField
                                        variant="standard"
                                        size="small"
                                        className="basis-cell basis-cell-element"
                                        value={row.element}
                                        inputProps={{
                                            "aria-label": `Element of site ${rowIndex + 1}`,
                                            style: { fontSize: "0.78rem", fontWeight: 600 },
                                        }}
                                        InputProps={{ disableUnderline: true }}
                                        onChange={(event) =>
                                            this.updateRow(
                                                rowIndex,
                                                { element: event.target.value },
                                                { commit: false },
                                            )
                                        }
                                        onBlur={() => this.commit(this.state.rows)}
                                    />
                                </TableCell>
                                {AXES.map((_, axis) =>
                                    this.renderCoordinateCell(row, rowIndex, axis),
                                )}
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    {row.constraints.map((isFree, axis) => (
                                        <Checkbox
                                            // eslint-disable-next-line react/no-array-index-key
                                            key={AXES[axis]}
                                            size="small"
                                            checked={isFree}
                                            className={`basis-constraint basis-constraint-${AXES[axis]}`}
                                            inputProps={{
                                                "aria-label": `${AXES[axis]} free for site ${
                                                    rowIndex + 1
                                                }`,
                                            }}
                                            sx={{ p: 0.25 }}
                                            onChange={(event) => {
                                                const constraints = [...row.constraints];
                                                constraints[axis] = event.target.checked;
                                                this.updateRow(rowIndex, { constraints });
                                            }}
                                        />
                                    ))}
                                </TableCell>
                                <TableCell sx={{ width: 28 }}>
                                    <Tooltip title="Remove site">
                                        <span>
                                            <IconButton
                                                size="small"
                                                className="basis-remove-site"
                                                aria-label={`Remove site ${rowIndex + 1}`}
                                                disabled={rows.length <= 1}
                                                onClick={() => this.removeRow(rowIndex)}
                                            >
                                                <DeleteIcon sx={{ fontSize: "0.9rem" }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    className="basis-add-site"
                    onClick={this.addRow}
                    sx={{ mt: 0.5, textTransform: "none" }}
                >
                    Add site
                </Button>
            </Box>
        );
    }
}

BasisTable.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default BasisTable;
