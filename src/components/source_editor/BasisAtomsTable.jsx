import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import { DataGrid } from "@mui/x-data-grid";
import PropTypes from "prop-types";
import React from "react";

const ATOM_COLUMNS = [
    { field: "index", headerName: "Index", type: "number", width: 60 },
    { field: "element", headerName: "Element", width: 80 },
    { field: "label", headerName: "Label", type: "number", flex: 1, editable: true },
    {
        field: "magneticMoment",
        headerName: "Magnetic Moment (μB)",
        type: "number",
        flex: 2,
        minWidth: 155,
        editable: true,
    },
];

/** Returns one row per atom, in basis order, with its label and magnetic moment */
function getAtomRows(material) {
    const basis = material.getBasis();
    const { atomicLabelsArray, magneticMoments } = basis;
    const magneticMomentByAtomId = new Map(magneticMoments.map(({ id, value }) => [id, value]));
    return basis.elements.map(({ id, value }, index) => ({
        id,
        index: index + 1,
        element: value,
        label: atomicLabelsArray[index] ?? null,
        magneticMoment: magneticMomentByAtomId.get(id) ?? null,
    }));
}

/** Per-atom label and magnetic moment table; `readOnly` disables editing */
function BasisAtomsTable({ material, onUpdate, readOnly }) {
    /** Writes the edited row's values through made; made's validation refuses out-of-range ones */
    const handleAtomRowUpdate = (updatedRow) => {
        const rows = getAtomRows(material).map((row) =>
            row.id === updatedRow.id ? updatedRow : row,
        );
        const entriesOf = (field) =>
            rows
                .filter((row) => row[field] !== null)
                .map((row) => ({ id: row.id, value: row[field] }));
        const newMaterial = material.clone();
        const basis = newMaterial.getBasis();
        basis.labels = entriesOf("label");
        basis.magneticMoments = entriesOf("magneticMoment");
        newMaterial.setBasis(basis.toJSON());
        onUpdate(newMaterial);
        return updatedRow;
    };

    return (
        <DataGrid
            rows={getAtomRows(material)}
            columns={ATOM_COLUMNS}
            isCellEditable={() => !readOnly}
            processRowUpdate={handleAtomRowUpdate}
            onProcessRowUpdateError={(error) =>
                showErrorAlert(error.details?.error?.[0]?.message ?? error.message)
            }
            disableRowSelectionOnClick
        />
    );
}

BasisAtomsTable.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object.isRequired,
    onUpdate: PropTypes.func,
    readOnly: PropTypes.bool,
};

BasisAtomsTable.defaultProps = {
    onUpdate: undefined,
    readOnly: false,
};

export default BasisAtomsTable;
