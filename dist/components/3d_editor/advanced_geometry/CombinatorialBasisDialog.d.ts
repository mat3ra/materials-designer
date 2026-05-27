export default CombinatorialBasisDialog;
declare class CombinatorialBasisDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        xyz: any;
    };
    handleSubmit(): void;
    handleChange(content: any): void;
    assertCombinatorialBasesCount(bases: any): boolean;
    render(): import("react/jsx-runtime").JSX.Element;
    BasisTextComponent: BasisText | null | undefined;
}
declare namespace CombinatorialBasisDialog {
    namespace propTypes {
        const isOpen: PropTypes.Validator<boolean>;
        const material: PropTypes.Validator<object>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        const modalId: PropTypes.Validator<string>;
    }
    namespace defaultProps {
        const maxCombinatorialBasesCount_1: number;
        export { maxCombinatorialBasesCount_1 as maxCombinatorialBasesCount };
    }
}
import React from "react";
import BasisText from "../../source_editor/BasisText";
import PropTypes from "prop-types";
