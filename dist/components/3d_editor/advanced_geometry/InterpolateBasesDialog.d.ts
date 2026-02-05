export default InterpolateBasesDialog;
declare class InterpolateBasesDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        message: string;
        numberOfSteps: number;
        materialIndex: number;
    };
    handleSubmit(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    getOptions: () => import("react/jsx-runtime").JSX.Element[];
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace InterpolateBasesDialog {
    namespace propTypes {
        let title: PropTypes.Validator<string>;
        let isOpen: PropTypes.Validator<boolean>;
        let material: PropTypes.Validator<object>;
        let material2: PropTypes.Validator<object>;
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        let onHide: PropTypes.Validator<(...args: any[]) => any>;
        let modalId: PropTypes.Validator<string>;
    }
}
import React from "react";
import PropTypes from "prop-types";
