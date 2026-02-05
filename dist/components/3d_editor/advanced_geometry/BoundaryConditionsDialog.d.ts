export class BoundaryConditionsDialog extends React.Component<any, any, any> {
    constructor(props: any);
    handleSetBoundaryConditions(): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    getBoundaryTypeOptions: () => import("react/jsx-runtime").JSX.Element[];
    initializeState(isUpdating?: boolean): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace BoundaryConditionsDialog {
    namespace propTypes {
        let title: PropTypes.Requireable<string>;
        let isOpen: PropTypes.Validator<boolean>;
        let material: PropTypes.Validator<object>;
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
