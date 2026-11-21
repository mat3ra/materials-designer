/**
 * Import review — see what you are bringing in before you bring it in.
 *
 * v1 called this the Upload dialog and it is the one place where a modal is the honest shape: this
 * is not an operation on a material, it is a staging list you are deciding about, and it goes away
 * once you have decided. So it uses the Catalog's overlay rather than the panel zone, which is
 * three hundred pixels wide and belongs to the material you can still see behind it.
 *
 * The DOM contract is v1's, exactly — `#defaultImportModalDialog`, `input[data-name="fileapi"]`,
 * the DataGrid's `role="cell"`/`data-field` cells, `#<file-name>-remove-button` and the dialog's
 * submit and cancel ids. `I upload files` is one of the seven phrases 62 web-app features consume,
 * so the markup underneath it is not ours to redesign.
 */
import { Made } from "@mat3ra/made";
import IconButton from "@mui/material/IconButton";
import { type GridColDef, DataGrid } from "@mui/x-data-grid";
import React, { useCallback, useRef, useState } from "react";

import { readFiles } from "../core/io";

export interface StagedFile {
    id: number;
    fileName: string;
    format: string;
    text: string;
    lastModified: string;
}

/** v1's format, kept so the column reads the same after the cutover. */
export function formatTimestamp(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(
        date.getMonth() + 1,
    )}/${pad(date.getDate())}/${date.getFullYear()}`;
}

/** The id the remove button carries. Dots and spaces are not valid in a CSS id selector. */
export function removeButtonId(fileName: string): string {
    return `${fileName.replace(/\s+/g, "-").replace(/\./g, "-")}-remove-button`;
}

/**
 * What a file is, as far as the review grid is concerned.
 *
 * Detection is made.js's, so the accepted set is exactly v1's. A file it cannot place is still
 * listed — with the reason in the format column — rather than dropped silently: seeing that a file
 * arrived and was not understood is the whole point of reviewing before importing.
 */
export function stageFile(name: string, text: string, at: Date, id: number): StagedFile {
    let format: string;
    try {
        format = Made.parsers.nativeFormatParsers.detectFormat(text);
    } catch (error) {
        format = (error as Error).message;
    }
    return { id, fileName: name, format, text, lastModified: formatTimestamp(at) };
}

export interface ImportReviewProps {
    onSubmit: (files: StagedFile[]) => void;
    onClose: () => void;
}

export function ImportReview({ onSubmit, onClose }: ImportReviewProps) {
    const [files, setFiles] = useState<StagedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const input = useRef<HTMLInputElement>(null);

    const stage = useCallback(async (incoming: FileList | File[]) => {
        // Empty or unreadable files are dropped before staging, as v1 did: a zero-byte file has no
        // format to detect and nothing to import.
        const usable = Array.from(incoming).filter((file) => file && file.size);
        if (!usable.length) return;
        const read = await readFiles(usable);
        setFiles((current) => [
            ...current,
            ...read.map((one, index) =>
                stageFile(one.name, one.content, new Date(), current.length + index),
            ),
        ]);
    }, []);

    const columns: GridColDef[] = [
        {
            field: "fileName",
            headerName: "File Name",
            flex: 1,
            headerAlign: "center",
            align: "center",
        },
        { field: "format", headerName: "Format", flex: 1, headerAlign: "center", align: "center" },
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
                    id={removeButtonId(params.row.fileName)}
                    color="inherit"
                    aria-label={`Remove ${params.row.fileName}`}
                    onClick={() =>
                        setFiles((current) =>
                            current.filter((one) => one.fileName !== params.row.fileName),
                        )
                    }
                >
                    ✕
                </IconButton>
            ),
        },
    ];

    return (
        <section
            className="md2-import"
            id="defaultImportModalDialog"
            aria-label="Upload files"
            data-testid="panel-import-review"
        >
            <header className="md2-catalog-head">
                <h2 className="md2-panel-title">Upload files</h2>
                <span className="md2-spacer" />
                {files.length > 0 && (
                    <>
                        <button
                            type="button"
                            className="md2-btn"
                            data-name="upload-button"
                            onClick={() => input.current?.click()}
                        >
                            Upload more
                        </button>
                        <button
                            type="button"
                            className="md2-btn"
                            data-name="clear-button"
                            onClick={() => setFiles([])}
                        >
                            Clear all
                        </button>
                    </>
                )}
            </header>

            <div
                className="md2-import-body"
                id="dropzone"
                onDragOver={(event) => {
                    event.preventDefault();
                    if (!dragging) setDragging(true);
                }}
                onDragLeave={(event) => {
                    event.preventDefault();
                    setDragging(false);
                }}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    stage(event.dataTransfer.files);
                }}
            >
                {files.length > 0 ? (
                    <DataGrid
                        sx={{ minHeight: 300, border: 0 }}
                        data-name="datagrid"
                        hideFooter
                        rows={files}
                        columns={columns}
                    />
                ) : (
                    <button
                        type="button"
                        className={`md2-dropzone${dragging ? " md2-dragging" : ""}`}
                        data-name="dropzone"
                        onClick={() => input.current?.click()}
                    >
                        <span className="md2-dropzone-icon" aria-hidden="true">
                            ⇪
                        </span>
                        <span>
                            Drop files here or <u>click</u> to upload
                        </span>
                        <span className="md2-note">Supported formats: poscar, json.</span>
                    </button>
                )}
                <input
                    data-name="fileapi"
                    ref={input}
                    id="fileapi"
                    type="file"
                    hidden
                    multiple
                    onChange={(event) => {
                        if (event.target.files?.length) stage(event.target.files);
                        // Re-uploading the same file must stage it again; without this the input
                        // holds the old value and fires no change event.
                        event.target.value = "";
                    }}
                />
            </div>

            <div className="md2-actions">
                <button
                    type="button"
                    className="md2-btn"
                    id="defaultImportModalDialog-cancel-button"
                    onClick={onClose}
                >
                    Cancel
                </button>
                <button
                    type="button"
                    className="md2-btn md2-btn-primary"
                    id="defaultImportModalDialog-submit-button"
                    disabled={files.length === 0}
                    onClick={() => onSubmit(files)}
                >
                    Add {files.length || ""} to session
                </button>
            </div>
        </section>
    );
}
