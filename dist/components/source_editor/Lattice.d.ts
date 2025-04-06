export default Lattice;
declare class Lattice extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        showLatticeConfigurationDialog: boolean;
    };
    componentDidUpdate(): void;
    latticeTypeOptions: () => {
        label: string;
        value: LatticeTypeSchema;
    }[];
    latticeUnitOptions: () => {
        label: string;
        value: string;
    }[];
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace Lattice {
    namespace propTypes {
        const material: PropTypes.Validator<object>;
        const onUpdate: PropTypes.Validator<(...args: any[]) => any>;
    }
}
import React from "react";
import PropTypes from "prop-types";
