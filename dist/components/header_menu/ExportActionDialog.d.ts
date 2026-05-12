export default ExportActionDialog;
declare class ExportActionDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        format: string;
        useMultiple: boolean;
    };
    handleChange: (name: any) => (event: any) => void;
    onSubmit: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace ExportActionDialog {
    namespace propTypes {
        let title: PropTypes.Requireable<string>;
        let isOpen: PropTypes.Validator<boolean>;
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        let onHide: PropTypes.Validator<(...args: any[]) => any>;
        let modalId: PropTypes.Validator<string>;
    }
    namespace defaultProps {
        let title_1: string;
        export { title_1 as title };
    }
}
import React from "react";
import PropTypes from "prop-types";
