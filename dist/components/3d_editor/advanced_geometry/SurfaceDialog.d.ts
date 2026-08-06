export default SurfaceDialog;
declare class SurfaceDialog extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        h: number;
        k: number;
        l: number;
        thickness: number;
        vacuumRatio: number;
        vx: number;
        vy: number;
        message: string;
    };
    handleGenerateSurface(): void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace SurfaceDialog {
    namespace propTypes {
        const onSubmit: PropTypes.Validator<(...args: any[]) => any>;
        const onHide: PropTypes.Validator<(...args: any[]) => any>;
        const isOpen: PropTypes.Validator<boolean>;
        const modalId: PropTypes.Validator<string>;
    }
}
import React from "react";
import PropTypes from "prop-types";
