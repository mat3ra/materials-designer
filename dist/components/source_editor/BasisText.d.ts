export default BasisText;
declare class BasisText extends React.Component<any, any, any> {
    constructor(props: any);
    codeMirrorRef: React.RefObject<any>;
    state: {
        content: any;
        checks: any;
        isContentValidated: boolean;
        message: any;
    };
    updateContent(newContent: any): void;
    UNSAFE_componentWillReceiveProps(nextProps: any, nextContext: any): void;
    validateContent: (content: any) => boolean;
    isContentPassingValidation(content: any): boolean;
    reformatContentAndUpdateStateIfNoManualEdit: (newContent: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace BasisText {
    namespace propTypes {
        const className: PropTypes.Requireable<string>;
        const message: PropTypes.Requireable<string>;
        const content: PropTypes.Requireable<string>;
        const checks: PropTypes.Requireable<any[]>;
        const readOnly: PropTypes.Requireable<boolean>;
        const codeMirrorOptions: PropTypes.Requireable<object>;
        const onChange: PropTypes.Requireable<(...args: any[]) => any>;
    }
    namespace defaultProps {
        const className_1: string;
        export { className_1 as className };
        const message_1: string;
        export { message_1 as message };
        const readOnly_1: boolean;
        export { readOnly_1 as readOnly };
        const content_1: string;
        export { content_1 as content };
        const checks_1: never[];
        export { checks_1 as checks };
        const codeMirrorOptions_1: {};
        export { codeMirrorOptions_1 as codeMirrorOptions };
        export function onChange_1(): void;
        export { onChange_1 as onChange };
    }
}
import React from "react";
import PropTypes from "prop-types";
