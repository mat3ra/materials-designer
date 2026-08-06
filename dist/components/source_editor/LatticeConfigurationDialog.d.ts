export default LatticeConfigurationDialog;
/**
 * @summary Crystal Lattice configuration dialog.
 *
 * @property {object} unitOptions unit options to provide
 * @property {object} typeOptions type options to provide
 * @property {object} lattice the lattice
 * @property {func} onSubmit submitting the data event
 */
declare class LatticeConfigurationDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        lattice: any;
        preserveBasis: boolean;
    };
    UNSAFE_componentWillReceiveProps(newProps: any): void;
    getEditModeOptions(): any[];
    getLatticeUnitOptions(): any[];
    getLatticeTypeOptions(): any[];
    isDisabled: () => boolean;
    handEditModeSelected: (e: any) => void;
    handleLatticeUnitSelected: (e: any) => void;
    handleLatticeTypeSelected: (e: any) => void;
    handleLatticeInputChanged: (e: any) => void;
    handleUpdateLattice: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace LatticeConfigurationDialog {
    namespace propTypes {
        const unitOptions: PropTypes.Validator<any[]>;
        const typeOptions: PropTypes.Validator<any[]>;
        const submitButtonTxt: PropTypes.Requireable<string>;
        const material: PropTypes.Validator<object>;
        const onUpdate: PropTypes.Validator<(...args: any[]) => any>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
    }
    namespace defaultProps {
        const submitButtonTxt_1: string;
        export { submitButtonTxt_1 as submitButtonTxt };
    }
}
import React from "react";
import PropTypes from "prop-types";
