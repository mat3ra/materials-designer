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
        let unitOptions: PropTypes.Validator<any[]>;
        let typeOptions: PropTypes.Validator<any[]>;
        let submitButtonTxt: PropTypes.Requireable<string>;
        let material: PropTypes.Validator<object>;
        let onUpdate: PropTypes.Validator<(...args: any[]) => any>;
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
    }
    namespace defaultProps {
        let submitButtonTxt_1: string;
        export { submitButtonTxt_1 as submitButtonTxt };
    }
}
import React from "react";
import PropTypes from "prop-types";
