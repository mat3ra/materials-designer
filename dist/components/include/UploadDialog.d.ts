export default UploadDialog;
declare class UploadDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        files: never[];
        dragging: boolean;
    };
    reader: FileReader;
    handleFileRead: (evt: any) => void;
    handleSubmit(): void;
    handleDragOver: (e: any) => void;
    handleDragLeave: (e: any) => void;
    handleDrop: (e: any) => void;
    handleFileChange(files: any): void;
    formatDate: (date: any) => string;
    handleFileRemove: (fileNameToRemove: any) => void;
    onSubmit: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
    inputFileReaderRef: HTMLInputElement | null | undefined;
}
declare namespace UploadDialog {
    namespace propTypes {
        const show: PropTypes.Validator<boolean>;
        const onClose: PropTypes.Validator<(...args: any[]) => any>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
    }
    const defaultProps: {};
}
import React from "react";
import PropTypes from "prop-types";
