export default SupercellDialog;
declare class SupercellDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        m11: number;
        m12: number;
        m13: number;
        m21: number;
        m22: number;
        m23: number;
        m31: number;
        m32: number;
        m33: number;
        message: string;
    };
    handleGenerateSupercell(): void;
    getMatrix(): math.Matrix;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace SupercellDialog {
    namespace propTypes {
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const isOpen: PropTypes.Validator<boolean>;
        const modalId: PropTypes.Validator<string>;
    }
}
import React from "react";
import math from "mathjs";
import PropTypes from "prop-types";
