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
        let title: PropTypes.Requireable<string>;
        let id: PropTypes.Requireable<string>;
        let isOpen: PropTypes.Requireable<boolean>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
    namespace defaultProps {
        let id_1: string;
        export { id_1 as id };
        let isOpen_1: boolean;
        export { isOpen_1 as isOpen };
        let children_1: undefined;
        export { children_1 as children };
        let title_1: string;
        export { title_1 as title };
    }
}
import React from "react";
import PropTypes from "prop-types";
