export class ButtonActivatedMenuMaterialUI extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        isOpen: any;
        anchorEl: null;
    };
    handleClick: (event: any) => void;
    handleClose: () => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace ButtonActivatedMenuMaterialUI {
    namespace propTypes {
        const title: PropTypes.Requireable<string>;
        const id: PropTypes.Requireable<string>;
        const isOpen: PropTypes.Requireable<boolean>;
        const children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
    namespace defaultProps {
        const id_1: string;
        export { id_1 as id };
        const isOpen_1: boolean;
        export { isOpen_1 as isOpen };
        const children_1: undefined;
        export { children_1 as children };
        const title_1: string;
        export { title_1 as title };
    }
}
import React from "react";
import PropTypes from "prop-types";
