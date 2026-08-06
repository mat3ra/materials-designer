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
    renderIOMenu(): React.JSX.Element;
    renderEditMenu(): React.JSX.Element;
    renderViewMenu(): React.JSX.Element;
    renderAdvancedMenu(): React.JSX.Element;
    openPageByURL: (url: any) => void;
    renderHelpMenu(): React.JSX.Element;
    renderSpinner(): React.JSX.Element;
    renderImportModal: () => any;
    renderSaveActionDialog: () => any;
    renderThreejsEditorModal(): React.JSX.Element;
    render(): React.JSX.Element;
}
declare namespace HeaderMenuToolbar {
    namespace propTypes {
        const mdState: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            index: PropTypes.Requireable<number>;
            isLoading: PropTypes.Requireable<boolean>;
            materials: PropTypes.Requireable<(object | null | undefined)[]>;
        }>>>;
        const className: PropTypes.Requireable<string>;
        const maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        const defaultMaterialsSet: PropTypes.Validator<any[]>;
        const onUpdate: PropTypes.Validator<(...args: any[]) => any>;
        const onUndo: PropTypes.Validator<(...args: any[]) => any>;
        const onRedo: PropTypes.Validator<(...args: any[]) => any>;
        const onReset: PropTypes.Validator<(...args: any[]) => any>;
        const onClone: PropTypes.Validator<(...args: any[]) => any>;
        const onToggleIsNonPeriodic: PropTypes.Validator<(...args: any[]) => any>;
        const onAdd: PropTypes.Validator<(...args: any[]) => any>;
        const onExport: PropTypes.Validator<(...args: any[]) => any>;
        const onExit: PropTypes.Requireable<(...args: any[]) => any>;
        const onGenerateSupercell: PropTypes.Validator<(...args: any[]) => any>;
        const onGenerateSurface: PropTypes.Validator<(...args: any[]) => any>;
        const onSetBoundaryConditions: PropTypes.Validator<(...args: any[]) => any>;
        const onSectionVisibilityToggle: PropTypes.Validator<(...args: any[]) => any>;
        const isVisibleItemsList: PropTypes.Validator<boolean>;
        const isVisibleSourceEditor: PropTypes.Validator<boolean>;
        const isVisibleThreeDEditorFullscreen: PropTypes.Validator<boolean>;
        const isVisibleJupyterLiteSessionDrawer: PropTypes.Validator<boolean>;
        const isVisiblePythonReplPanel: PropTypes.Validator<boolean>;
        const openImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const closeImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const openSaveActionDialog: PropTypes.Requireable<(...args: any[]) => any>;
        const children: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    }
    namespace defaultProps {
        const className_1: undefined;
        export { className_1 as className };
        const maxCombinatorialBasesCount_1: number;
        export { maxCombinatorialBasesCount_1 as maxCombinatorialBasesCount };
        const openSaveActionDialog_1: null;
        export { openSaveActionDialog_1 as openSaveActionDialog };
        const children_1: null;
        export { children_1 as children };
        const onExit_1: undefined;
        export { onExit_1 as onExit };
        const openImportModal_1: undefined;
        export { openImportModal_1 as openImportModal };
        const closeImportModal_1: undefined;
        export { closeImportModal_1 as closeImportModal };
    }
}
import React from "react";
import PropTypes from "prop-types";
