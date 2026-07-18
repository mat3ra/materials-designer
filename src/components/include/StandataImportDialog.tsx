import Dialog from "@mat3ra/cove.js/dist/mui/components/dialog/Dialog";
import IconByName from "@mat3ra/cove.js/dist/mui/components/icon/IconByName";
import { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import Autocomplete from "@mui/material/Autocomplete";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

import { MDMaterial } from "../../MDMaterial";

interface StandataImportDialogProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (materials: MDMaterial[]) => void;
    defaultMaterialConfigs: MaterialSchema[];
}

interface StandataImportDialogState {
    selectedMaterialConfigs: MaterialSchema[];
}

class StandataImportDialog extends React.Component<
    StandataImportDialogProps,
    StandataImportDialogState
> {
    constructor(props: StandataImportDialogProps) {
        super(props);
        this.state = {
            selectedMaterialConfigs: [],
        };
    }

    handleMaterialSelect = (materialConfigs: MaterialSchema[] | []) => {
        this.setState({
            selectedMaterialConfigs: [...materialConfigs],
        });
    };

    handleRemoveMaterial = (index: number) => {
        this.setState((prevState) => ({
            selectedMaterialConfigs: prevState.selectedMaterialConfigs.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    addMaterials = () => {
        const { selectedMaterialConfigs } = this.state;
        const materials = selectedMaterialConfigs.map((config) => new MDMaterial(config));
        const { onSubmit } = this.props;
        onSubmit(materials);
        this.setState({ selectedMaterialConfigs: [] });
    };

    render() {
        const { show, onClose, defaultMaterialConfigs } = this.props;
        const { selectedMaterialConfigs } = this.state;

        const selectedMaterials = selectedMaterialConfigs.map((config) => new MDMaterial(config));

        const columns: GridColDef[] = [
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
                renderCell: (params) => (
                    <IconButton
                        id={`${params.row.name.replace(/\s+/g, "-")}-remove-button`}
                        color="inherit"
                        onClick={() => this.handleRemoveMaterial(params.row.id)}
                    >
                        <IconByName name="actions.remove" fontSize="small" />
                    </IconButton>
                ),
            },
        ];

        return (
            <Dialog
                open={show}
                id="standata-import-dialog"
                title="Import from Standata"
                onClose={onClose}
                onSubmit={this.addMaterials}
            >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            id="materials-autocomplete"
                            data-tid="materials-selector"
                            disableCloseOnSelect
                            options={defaultMaterialConfigs || []}
                            value={selectedMaterialConfigs || null}
                            getOptionLabel={(material) => material.name || "Not available"}
                            onChange={(_event, newValues) => this.handleMaterialSelect(newValues)}
                            ListboxProps={{
                                style: { maxHeight: 300 },
                            }}
                            renderOption={(props, option, { selected }) => (
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                <li {...props} data-tid="select-material">
                                    <Checkbox
                                        icon={<CheckBoxOutlineBlank fontSize="small" />}
                                        checkedIcon={
                                            <IconByName name="shapes.check" fontSize="small" />
                                        }
                                        checked={selected}
                                    />
                                    {option.name}
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    {...params}
                                    label="Selected Materials"
                                    placeholder="Select materials"
                                />
                            )}
                        />
                    </Grid>
                    <Grid item xs={12} style={{ minHeight: 300 }}>
                        <DataGrid
                            data-name="data-grid"
                            hideFooter
                            rows={selectedMaterials.map((material, index) => ({
                                name: material.name,
                                lattice: material.lattice?.type || "TRI",
                                formula: material.formula || "Not available",
                                id: index,
                            }))}
                            columns={columns}
                        />
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

export default StandataImportDialog;
