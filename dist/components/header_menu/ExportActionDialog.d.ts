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
        const title: PropTypes.Requireable<string>;
        const isOpen: PropTypes.Validator<boolean>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const modalId: PropTypes.Validator<string>;
    }
    namespace defaultProps {
        const title_1: string;
        export { title_1 as title };
    }
}
import React from "react";
import PropTypes from "prop-types";
