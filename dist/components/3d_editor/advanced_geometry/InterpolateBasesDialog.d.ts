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
        const title: PropTypes.Validator<string>;
        const isOpen: PropTypes.Validator<boolean>;
        const material: PropTypes.Validator<object>;
        const material2: PropTypes.Validator<object>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const modalId: PropTypes.Validator<string>;
    }
}
import React from "react";
import PropTypes from "prop-types";
