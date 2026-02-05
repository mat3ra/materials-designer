export default HeaderMenuToolbar;
declare class HeaderMenuToolbar extends React.Component<any, any, any> {
    constructor(config: any);
    state: {
        showSupercellDialog: boolean;
        showSurfaceDialog: boolean;
        showExportMaterialsDialog: boolean;
        showStandataImportDialog: boolean;
        showDefaultImportModalDialog: boolean;
        showCombinatorialDialog: boolean;
        showInterpolateDialog: boolean;
        showThreejsEditorModal: boolean;
        showBoundaryConditionsDialog: boolean;
        showJupyterLiteTransformation: boolean;
    };
    _handleConventionalCellSelect: () => any;
    renderIOMenu(): import("react/jsx-runtime").JSX.Element;
    renderEditMenu(): import("react/jsx-runtime").JSX.Element;
    renderViewMenu(): import("react/jsx-runtime").JSX.Element;
    renderAdvancedMenu(): import("react/jsx-runtime").JSX.Element;
    openPageByURL: (url: any) => void;
    renderHelpMenu(): import("react/jsx-runtime").JSX.Element;
    renderSpinner(): import("react/jsx-runtime").JSX.Element;
    renderImportModal: () => any;
    renderSaveActionDialog: () => any;
    renderThreejsEditorModal(): import("react/jsx-runtime").JSX.Element;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace HeaderMenuToolbar {
    namespace propTypes {
        let mdState: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            index: PropTypes.Requireable<number>;
            isLoading: PropTypes.Requireable<boolean>;
            materials: PropTypes.Requireable<(object | null | undefined)[]>;
        }>>>;
        let className: PropTypes.Requireable<string>;
        let maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        let defaultMaterialsSet: PropTypes.Validator<any[]>;
        let onUpdate: PropTypes.Validator<(...args: any[]) => any>;
        let onUndo: PropTypes.Validator<(...args: any[]) => any>;
        let onRedo: PropTypes.Validator<(...args: any[]) => any>;
        let onReset: PropTypes.Validator<(...args: any[]) => any>;
        let onClone: PropTypes.Validator<(...args: any[]) => any>;
        let onToggleIsNonPeriodic: PropTypes.Validator<(...args: any[]) => any>;
        let onAdd: PropTypes.Validator<(...args: any[]) => any>;
        let onExport: PropTypes.Validator<(...args: any[]) => any>;
        let onExit: PropTypes.Requireable<(...args: any[]) => any>;
        let onGenerateSupercell: PropTypes.Validator<(...args: any[]) => any>;
        let onGenerateSurface: PropTypes.Validator<(...args: any[]) => any>;
        let onSetBoundaryConditions: PropTypes.Validator<(...args: any[]) => any>;
        let onSectionVisibilityToggle: PropTypes.Validator<(...args: any[]) => any>;
        let isVisibleItemsList: PropTypes.Validator<boolean>;
        let isVisibleSourceEditor: PropTypes.Validator<boolean>;
        let isVisibleThreeDEditorFullscreen: PropTypes.Validator<boolean>;
        let openImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        let closeImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        let openSaveActionDialog: PropTypes.Requireable<(...args: any[]) => any>;
        let children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
    namespace defaultProps {
        let className_1: undefined;
        export { className_1 as className };
        let maxCombinatorialBasesCount_1: number;
        export { maxCombinatorialBasesCount_1 as maxCombinatorialBasesCount };
        let openSaveActionDialog_1: null;
        export { openSaveActionDialog_1 as openSaveActionDialog };
        let children_1: null;
        export { children_1 as children };
        let onExit_1: undefined;
        export { onExit_1 as onExit };
        let openImportModal_1: undefined;
        export { openImportModal_1 as openImportModal };
        let closeImportModal_1: undefined;
        export { closeImportModal_1 as closeImportModal };
    }
}
import React from "react";
import PropTypes from "prop-types";
