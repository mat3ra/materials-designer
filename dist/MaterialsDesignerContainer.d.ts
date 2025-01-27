/// <reference types="redux-undo" />
export class MaterialsDesignerContainer extends React.Component<any, any, any> {
    constructor(props: any);
    store: import("redux").Store<import("redux-undo").StateWithHistory<any>, import("redux").AnyAction> & {
        dispatch: any;
    };
    container: import("react-redux").ConnectedComponent<React.ComponentType<never>, {
        [x: string]: any;
    }>;
    render(): import("react/jsx-runtime").JSX.Element;
}
export namespace MaterialsDesignerContainer {
    namespace propTypes {
        const childrenProps: PropTypes.Requireable<object>;
        const applyMiddleware: PropTypes.Requireable<boolean>;
        const initialMaterials: PropTypes.Requireable<any[]>;
        const onExit: PropTypes.Requireable<(...args: any[]) => any>;
        const openImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const closeImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const openSaveActionDialog: PropTypes.Requireable<(...args: any[]) => any>;
        const materialsSave: PropTypes.Requireable<(...args: any[]) => any>;
        const maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        const isConventionalCellShown: PropTypes.Requireable<boolean>;
        const skipAlertProvider: PropTypes.Requireable<boolean>;
    }
    namespace defaultProps {
        const applyMiddleware_1: boolean;
        export { applyMiddleware_1 as applyMiddleware };
        export { initialMaterials };
        const maxCombinatorialBasesCount_1: number;
        export { maxCombinatorialBasesCount_1 as maxCombinatorialBasesCount };
        export function onExit_1(): void;
        export { onExit_1 as onExit };
        const skipAlertProvider_1: boolean;
        export { skipAlertProvider_1 as skipAlertProvider };
    }
}
import React from "react";
import PropTypes from "prop-types";
declare const initialMaterials_1: any[];
export {};
