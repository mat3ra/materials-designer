export class ActionDialog extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ActionDialog {
    namespace propTypes {
        let title: PropTypes.Requireable<string>;
        let show: PropTypes.Validator<boolean>;
        let onClose: PropTypes.Validator<(...args: any[]) => any>;
        let onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        let isLoading: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        let title_1: string;
        export { title_1 as title };
        let children_1: null;
        export { children_1 as children };
        let isLoading_1: boolean;
        export { isLoading_1 as isLoading };
    }
}
import React from "react";
import PropTypes from "prop-types";
