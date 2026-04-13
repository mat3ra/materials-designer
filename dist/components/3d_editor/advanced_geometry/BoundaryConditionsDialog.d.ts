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
        const title: PropTypes.Requireable<string>;
        const isOpen: PropTypes.Validator<boolean>;
        const material: PropTypes.Validator<object>;
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
