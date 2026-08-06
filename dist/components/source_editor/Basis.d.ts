export default BasisEditor;
declare class BasisEditor extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        xyzContent: any;
        coordinateUnits: string;
        checks: any;
    };
    handleBasisTextChange(content: any): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    getXYZInCoordUnits: (material: any, coordinateUnits: any) => any;
    renderBasisUnitsLabel: (unitsType?: string) => import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace BasisEditor {
    namespace propTypes {
        const material: PropTypes.Validator<object>;
        const onUpdate: PropTypes.Validator<(...args: any[]) => any>;
    }
}
import React from "react";
import PropTypes from "prop-types";
