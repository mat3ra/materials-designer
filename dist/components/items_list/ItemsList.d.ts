export default ItemsList;
declare class ItemsList extends React.Component<any, any, any> {
    constructor(props: any);
    state: {
        editedName: any;
        editedIndex: number;
    };
    focusListItem(event: any, index: any): void;
    blurListItem(): void;
    initControlsSwitchFromKeyboard(event: any): void;
    get defaultState(): {
        editedName: any;
        editedIndex: number;
    };
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    /**
     * Used when clicking remove item
     * e.preventDefault is used to inform further
     * elements that event is already handled and they should skip
     * handling it, otherwise the page can crash.
     * @param {React.MouseEvent} e - JS DOM event
     * @param {Number} index - index of element that should be removed
     */
    onDeleteIconClick(e: React.MouseEvent, index: number): void;
    /**
     * this function is used for handling clicks on different elements
     * here is used check if the event is default prevented in order to
     * avoid propagated actions that already was handled and don't handle
     * extra actions that can lead to page crashes
     * @param {React.MouseEvent} e - js dom event
     * @param {Number} index - index of element that should be removed
     */
    onItemListClick(e: React.MouseEvent, index: number): void;
    renderListItem(entity: any, index: any, indexFromState: any): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace ItemsList {
    namespace propTypes {
        const materials: PropTypes.Validator<any[]>;
        const index: PropTypes.Validator<number>;
        const onItemClick: PropTypes.Validator<(...args: any[]) => any>;
        const onRemove: PropTypes.Validator<(...args: any[]) => any>;
        const onNameUpdate: PropTypes.Validator<(...args: any[]) => any>;
    }
}
import React from "react";
import PropTypes from "prop-types";
