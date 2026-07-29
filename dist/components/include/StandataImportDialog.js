import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dialog from "@mat3ra/cove/dist/mui/components/dialog/Dialog";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { DataGrid } from "@mui/x-data-grid";
import React from "react";
import { MDMaterial } from "../../MDMaterial";
class StandataImportDialog extends React.Component {
    constructor(props) {
        super(props);
        this.handleMaterialSelect = (materialConfigs) => {
            this.setState({
                selectedMaterialConfigs: [...materialConfigs],
            });
        };
        this.handleRemoveMaterial = (index) => {
            this.setState((prevState) => ({
                selectedMaterialConfigs: prevState.selectedMaterialConfigs.filter((_, i) => i !== index),
            }));
        };
        this.addMaterials = () => {
            const { selectedMaterialConfigs } = this.state;
            const materials = selectedMaterialConfigs.map((config) => MDMaterial.fromConfig(config));
            const { onSubmit } = this.props;
            onSubmit(materials);
            this.setState({ selectedMaterialConfigs: [] });
        };
        this.state = {
            selectedMaterialConfigs: [],
        };
    }
    render() {
        const { show, onClose, defaultMaterialConfigs } = this.props;
        const { selectedMaterialConfigs } = this.state;
        const selectedMaterials = selectedMaterialConfigs.map((config) => MDMaterial.fromConfig(config));
        const columns = [
            { field: "name", headerName: "Name", flex: 1, headerAlign: "center", align: "center" },
            {
                field: "lattice",
                headerName: "Lattice",
                flex: 1,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "formula",
                headerName: "Formula",
                flex: 1,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "actions",
                headerName: "Actions",
                headerAlign: "center",
                align: "center",
                flex: 1,
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (_jsx(IconButton, { id: `${params.row.name.replace(/\s+/g, "-")}-remove-button`, color: "inherit", onClick: () => this.handleRemoveMaterial(params.row.id), children: _jsx(IconByName, { name: "actions.remove", fontSize: "small" }) })),
            },
        ];
        return (_jsx(Dialog, { open: show, id: "standata-import-dialog", title: "Import from Standata", onClose: onClose, onSubmit: this.addMaterials, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, children: _jsx(Autocomplete, { multiple: true, id: "materials-autocomplete", "data-tid": "materials-selector", disableCloseOnSelect: true, options: defaultMaterialConfigs || [], value: selectedMaterialConfigs || null, getOptionLabel: (material) => material.name || "Not available", onChange: (_event, newValues) => this.handleMaterialSelect(newValues), ListboxProps: {
                                style: { maxHeight: 300 },
                            }, renderOption: (props, option, { selected }) => (
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            _jsxs("li", { ...props, "data-tid": "select-material", children: [_jsx(Checkbox, { icon: _jsx(CheckBoxOutlineBlank, { fontSize: "small" }), checkedIcon: _jsx(IconByName, { name: "shapes.check", fontSize: "small" }), checked: selected }), option.name] })), renderInput: (params) => (_jsx(TextField
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            , { ...params, label: "Selected Materials", placeholder: "Select materials" })) }) }), _jsx(Grid, { item: true, xs: 12, style: { minHeight: 300 }, children: _jsx(DataGrid, { "data-name": "data-grid", hideFooter: true, rows: selectedMaterials.map((material, index) => {
                                var _a;
                                return ({
                                    name: material.name,
                                    lattice: ((_a = material.lattice) === null || _a === void 0 ? void 0 : _a.type) || "TRI",
                                    formula: material.formula || "Not available",
                                    id: index,
                                });
                            }), columns: columns }) })] }) }));
    }
}
export default StandataImportDialog;
