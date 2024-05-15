import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
        this.handleFileRead = (evt) => {
            this.setState((prevState) => ({ texts: [...prevState.texts, evt.target.result] }));
        };
        this.handleDragOver = (e) => {
            const { dragging } = this.state;
            e.preventDefault();
            if (!dragging) {
                this.setState({ dragging: true });
            }
        };
        this.handleDragLeave = (e) => {
            e.preventDefault();
            this.setState({ dragging: false });
        };
        this.handleDrop = (e) => {
            e.preventDefault();
            const { files } = e.dataTransfer;
            this.handleFileChange(files);
            this.setState({ dragging: false });
        };
        // TODO: move to string utils in code.js
        this.formatDate = (date) => {
            const hours = date.getHours().toString().padStart(2, "0");
            const minutes = date.getMinutes().toString().padStart(2, "0");
            const seconds = date.getSeconds().toString().padStart(2, "0");
            const day = date.getDate().toString().padStart(2, "0");
            // getMonth() returns a zero-based month index, so we add 1
            const month = (date.getMonth() + 1).toString().padStart(2, "0");
            const year = date.getFullYear();
            return `${hours}:${minutes}:${seconds} ${month}/${day}/${year}`;
        };
        this.handleFileRemove = (fileNameToRemove) => {
            this.setState((prevState) => ({
                files: prevState.files.filter((file) => file.fileName !== fileNameToRemove),
            }));
        };
        this.onSubmit = () => {
            const { onClose } = this.props;
            this.handleSubmit();
            onClose();
        };
        this.state = {
            files: [],
            dragging: false,
        };
        this.reader = new FileReader();
        this.reader.onloadend = this.handleFileRead;
    }
    handleSubmit() {
        const { files } = this.state;
        const newMaterialConfigs = [];
        const errors = [];
        files.forEach((file) => {
            try {
                const materialConfig = Made.parsers.nativeFormatParsers.convertFromNativeFormat(file.text);
                const extension = path.extname(file.fileName).replace(".", "");
                newMaterialConfigs.push({
                    ...materialConfig,
                    src: Made.Material.constructMaterialFileSource(file.fileName, file.text, extension),
                });
            }
            catch (error) {
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
                }
                catch (error) {
                    file.format = error.message;
                }
            };
            reader.readAsText(file);
        });
    }
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
                renderCell: (params) => (_jsx(IconButton, { id: `${params.row.fileName
                        .replace(/\s+/g, "-")
                        .replace(/\./g, "-")}-remove-button`, color: "inherit", onClick: () => this.handleFileRemove(params.row.fileName), children: _jsx(IconByName, { name: "actions.remove", fontSize: "small" }) })),
            },
        ];
        return (_jsx(Dialog, { open: show, id: "defaultImportModalDialog", title: "Upload Files", onClose: onClose, onSubmit: this.onSubmit, children: _jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [_jsx(Grid, { item: true, xs: 12, children: files.length > 0 && (_jsxs(Stack, { direction: "row", alignItems: "center", justifyContent: "flex-end", gap: 1, children: [_jsx(Button, { "data-name": "upload-button", variant: "text", onClick: () => this.inputFileReaderRef.click(), children: "Upload more" }), _jsx(Button, { "data-name": "clear-button", variant: "text", color: "error", onClick: () => this.setState({ files: [] }), children: "Clear all" })] })) }), _jsx(Grid, { item: true, xs: 12, children: _jsx(FormControl, { variant: "standard", sx: { width: "100%" }, children: _jsxs(Box, { id: "dropzone", onDragOver: this.handleDragOver, onDragLeave: this.handleDragLeave, onDrop: this.handleDrop, style: { width: "100%" }, children: [files.length > 0 ? (_jsx(DataGrid, { sx: { minHeight: 300 }, "data-name": "datagrid", hideFooter: true, rows: rows, columns: columns, pageSize: 1, style: dataGridStyle(dragging) })) : (_jsxs(Box, { "data-name": "dropzone", style: dropZoneStyle(dragging), onClick: () => this.inputFileReaderRef.click(), children: [_jsx(IconByName, { name: "entities.file.externalUpload", fontSize: "large" }), _jsxs("span", { children: ["Drop files here or ", _jsx("u", { children: "click" }), " to upload"] }), _jsx(Typography, { variant: "body2", children: "Supported formats: poscar, json." })] })), _jsx("input", { "data-name": "fileapi", ref: (ref) => {
                                            this.inputFileReaderRef = ref;
                                        }, style: { display: "none" }, type: "file", id: "fileapi", hidden: true, multiple: true, onChange: (event) => this.handleFileChange(event.target.files) })] }) }) })] }) }));
    }
}
UploadDialog.propTypes = {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};
UploadDialog.defaultProps = {};
export default UploadDialog;
