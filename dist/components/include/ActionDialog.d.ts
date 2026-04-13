export class ActionDialog extends React.Component<any, any, any> {
    constructor(props: any);
    constructor(props: any, context: any);
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ActionDialog {
    namespace propTypes {
        const title: PropTypes.Requireable<string>;
        const show: PropTypes.Validator<boolean>;
        const onClose: PropTypes.Validator<(...args: any[]) => any>;
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
        const isLoading: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        const title_1: string;
        export { title_1 as title };
        const children_1: null;
        export { children_1 as children };
        const isLoading_1: boolean;
        export { isLoading_1 as isLoading };
    }
}
import React from "react";
import PropTypes from "prop-types";
