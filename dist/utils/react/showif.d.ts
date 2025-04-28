/**
 * @summary Unary condition which will render children depending on condition is either true or false.
 * This is used mostly for readability purposes.
 *
 * @property {boolean} condition The condition
 * @property {node} children Children element that are required for this component
 */
export class ShowIf extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): any;
}
export namespace ShowIf {
    namespace propTypes {
        const condition: PropTypes.Validator<boolean>;
        const children: PropTypes.Validator<NonNullable<PropTypes.ReactNodeLike>>;
    }
}
import React from "react";
import PropTypes from "prop-types";
