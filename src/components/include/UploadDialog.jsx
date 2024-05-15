import Dialog from "@exabyte-io/cove.js/dist/mui/components/dialog/Dialog";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { Made } from "@mat3ra/made";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DataGrid } from "@mui/x-data-grid";
import { enqueueSnackbar } from "notistack";
import path from "path";
import PropTypes from "prop-types";
import React from "react";

import { Material } from "../../material";

const dropZoneStyle = (dragging) => ({
    height: 300,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    border: "2px dashed gray",
    borderRadius: "5px",
    cursor: "pointer",
    backgroundColor: dragging && "grey",
});
const dataGridStyle = (dragging) => ({
    backgroundColor: dragging && "grey",
});

class UploadDialog extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            dragging: false,
        };

        this.reader = new FileReader();
        this.reader.onloadend = this.handleFileRead;
    }

    handleFileRead = (evt) => {
        this.setState((prevState) => ({ texts: [...prevState.texts, evt.target.result] }));
    };

    handleSubmit() {
        const { files } = this.state;
        const newMaterialConfigs = [];
        const errors = [];

        files.forEach((file) => {
            try {
                const materialConfig = Made.parsers.nativeFormatParsers.convertFromNativeFormat(
                    file.text,
                );

                const extension = path.extname(file.fileName).replace(".", "");

                newMaterialConfigs.push({
                    ...materialConfig,
                    src: Made.Material.constructMaterialFileSource(
                        file.fileName,
                        file.text,
                        extension,
                    ),
                });
            } catch (error) {
                errors.push(error.message);
            }
        });

        if (errors.length > 0) {
            enqueueSnackbar(`Failed to convert some files: ${errors.join(", ")}`, {
                variant: "error",
            });
            return;
        }

        const newMaterials = newMaterialConfigs.map((config) => {
            const newMaterial = new Material(config);
            newMaterial.cleanOnCopy();
            return newMaterial;
        });

        const { onSubmit } = this.props;
        onSubmit(newMaterials);

        this.setState({
            files: [],
        });
    }

    handleDragOver = (e) => {
        const { dragging } = this.state;
        e.preventDefault();
        if (!dragging) {
            this.setState({ dragging: true });
        }
    };

    handleDragLeave = (e) => {
        e.preventDefault();
        this.setState({ dragging: false });
    };

    handleDrop = (e) => {
        e.preventDefault();
        const { files } = e.dataTransfer;
        this.handleFileChange(files);
        this.setState({ dragging: false });
    };

    handleFileChange(files) {
        // Filter out invalid files
        const validFiles = Array.from(files).filter((file) => file && file.size);
        if (validFiles.length === 0) {
            enqueueSnackbar("Error: file(s) cannot be read (inaccessible?)", {
                variant: "warning",
            });
            return;
        }

        validFiles.forEach((file, index) => {
            const reader = new FileReader();
            reader.onloadend = (evt) => {
                const text = evt.target.result;
                const lastModifiedUNIX = new Date(file.lastModified);
                const lastModified = this.formatDate(lastModifiedUNIX);
                try {
                    const format = Made.parsers.nativeFormatParsers.detectFormat(text);
                    const newFile = {
                        id: files.length + index,
                        fileName: file.name,
                        format,
                        text,
                        lastModified,
                    };

                    this.setState((prevState) => ({
                        files: [...prevState.files, newFile],
                    }));
                } catch (error) {
                    file.format = error.message;
                }
            };
            reader.readAsText(file);
        });
    }

    // TODO: move to string utils in code.js
    formatDate = (date) => {
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        // getMonth() returns a zero-based month index, so we add 1
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const year = date.getFullYear();

        return `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`;
    };

    handleFileRemove = (fileNameToRemove) => {
        this.setState((prevState) => ({
            files: prevState.files.filter((file) => file.fileName !== fileNameToRemove),
        }));
    };

    onSubmit = () => {
        const { onClose } = this.props;
        this.handleSubmit();
        onClose();
    };

    render() {
        const { show, onClose } = this.props;
        const { files, dragging } = this.state;

        const rows = files.map((file, i) => ({
            id: i,
            fileName: file.fileName,
            lastModified: file.lastModified || "Not available",
            format: file.format || "Not available",
        }));

        const columns = [
            {
                field: "fileName",
                headerName: "File Name",
                flex: 1,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "format",
                headerName: "Format",
                flex: 1,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "lastModified",
                headerName: "Last Modified",
                flex: 1,
                headerAlign: "center",
                align: "center",
            },
            {
                field: "actions",
                headerName: "Actions",
                flex: 1,
                headerAlign: "center",
                align: "center",
                sortable: false,
                filterable: false,
                disableColumnMenu: true,
                renderCell: (params) => (
                    <IconButton
                        id={`${params.row.fileName
                            .replace(/\s+/g, "-")
                            .replace(/\./g, "-")}-remove-button`}
                        color="inherit"
                        onClick={() => this.handleFileRemove(params.row.fileName)}
                    >
                        <IconByName name="actions.remove" fontSize="small" />
                    </IconButton>
                ),
            },
        ];

        return (
            <Dialog
                open={show}
                id="defaultImportModalDialog"
                title="Upload Files"
                onClose={onClose}
                onSubmit={this.onSubmit}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12}>
                        {files.length > 0 && (
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                gap={1}
                            >
                                <Button
                                    data-name="upload-button"
                                    variant="text"
                                    onClick={() => this.inputFileReaderRef.click()}
                                >
                                    Upload more
                                </Button>
                                <Button
                                    data-name="clear-button"
                                    variant="text"
                                    color="error"
                                    onClick={() => this.setState({ files: [] })}
                                >
                                    Clear all
                                </Button>
                            </Stack>
                        )}
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl variant="standard" sx={{ width: "100%" }}>
                            <Box
                                id="dropzone"
                                onDragOver={this.handleDragOver}
                                onDragLeave={this.handleDragLeave}
                                onDrop={this.handleDrop}
                                style={{ width: "100%" }}
                            >
                                {files.length > 0 ? (
                                    <DataGrid
                                        sx={{ minHeight: 300 }}
                                        data-name="datagrid"
                                        hideFooter
                                        rows={rows}
                                        columns={columns}
                                        pageSize={1}
                                        style={dataGridStyle(dragging)}
                                    />
                                ) : (
                                    <Box
                                        data-name="dropzone"
                                        style={dropZoneStyle(dragging)}
                                        onClick={() => this.inputFileReaderRef.click()}
                                    >
                                        <IconByName
                                            name="entities.file.externalUpload"
                                            fontSize="large"
                                        />
                                        <span>
                                            Drop files here or <u>click</u> to upload
                                        </span>
                                        <Typography variant="body2">
                                            Supported formats: poscar, json.
                                        </Typography>
                                    </Box>
                                )}
                                <input
                                    data-name="fileapi"
                                    ref={(ref) => {
                                        this.inputFileReaderRef = ref;
                                    }}
                                    style={{ display: "none" }}
                                    type="file"
                                    id="fileapi"
                                    hidden
                                    multiple
                                    onChange={(event) => this.handleFileChange(event.target.files)}
                                />
                            </Box>
                        </FormControl>
                    </Grid>
                </Grid>
            </Dialog>
        );
    }
}

UploadDialog.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

UploadDialog.defaultProps = {};

export default UploadDialog;
