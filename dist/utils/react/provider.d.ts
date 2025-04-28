export default ReduxProvider;
declare class ReduxProvider extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    get parentProps(): Pick<Readonly<any>, string | number | symbol>;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace ReduxProvider {
    namespace propTypes {
        const container: PropTypes.Validator<(...args: any[]) => any>;
        const store: PropTypes.Requireable<object>;
    }
    namespace defaultProps {
        const store_1: {};
        export { store_1 as store };
    }
}
import React from "react";
import PropTypes from "prop-types";
