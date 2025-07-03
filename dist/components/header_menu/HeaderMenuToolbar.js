import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/* eslint-disable react/sort-comp */
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { ThreejsEditorModal } from "@exabyte-io/wave.js";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import AssignmentIcon from "@mui/icons-material/Assignment";
// TODO: rename other menu icons similarly
import SupercellIcon from "@mui/icons-material/BorderClear";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import CloneIcon from "@mui/icons-material/Collections";
import DeviceHubIcon from "@mui/icons-material/DeviceHub";
import BoundaryConditionsIcon from "@mui/icons-material/Directions";
import NanotubeIcon from "@mui/icons-material/DonutLarge";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import ConventionalCellIcon from "@mui/icons-material/FormatShapes";
import GetAppIcon from "@mui/icons-material/GetApp";
import HelpIcon from "@mui/icons-material/Help";
import SlabIcon from "@mui/icons-material/Layers";
import CombinatorialSetIcon from "@mui/icons-material/LibraryAdd";
import RedoIcon from "@mui/icons-material/Redo";
import SaveIcon from "@mui/icons-material/Save";
import InterpolatedSetIcon from "@mui/icons-material/SwapVert";
import Terminal from "@mui/icons-material/Terminal";
import ThreeDEditorIcon from "@mui/icons-material/ThreeDRotation";
import PolymerIcon from "@mui/icons-material/Timeline";
import UndoIcon from "@mui/icons-material/Undo";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";
import { BoundaryConditionsDialog } from "../3d_editor/advanced_geometry/BoundaryConditionsDialog";
import CombinatorialBasisDialog from "../3d_editor/advanced_geometry/CombinatorialBasisDialog";
import InterpolateBasesDialog from "../3d_editor/advanced_geometry/InterpolateBasesDialog";
import JupyterLiteTransformation from "../3d_editor/advanced_geometry/python_transformation/JupyterLiteTransformation";
// import PythonTransformation from "../3d_editor/advanced_geometry/python_transformation/PythonTransformation";
import SupercellDialog from "../3d_editor/advanced_geometry/SupercellDialog";
import SurfaceDialog from "../3d_editor/advanced_geometry/SurfaceDialog";
import { ButtonActivatedMenuMaterialUI } from "../include/material-ui/ButtonActivatedMenu";
import StandataImportDialog from "../include/StandataImportDialog";
import UploadDialog from "../include/UploadDialog";
import ExportActionDialog from "./ExportActionDialog";
class HeaderMenuToolbar extends React.Component {
    constructor(config) {
        super(config);
        this._handleConventionalCellSelect = () => {
            const { onUpdate, mdState: { materials, index }, } = this.props;
            const newMaterial = materials[index].getACopyWithConventionalCell();
            return onUpdate(newMaterial, index);
        };
        this.openPageByURL = (url) => {
            window.open(url, "_blank");
        };
        this.renderImportModal = () => {
            const { onAdd, openImportModal, closeImportModal, defaultMaterialsSet } = this.props;
            return openImportModal
                ? openImportModal({
                    modalId: "defaultImportModalDialog",
                    show: true,
                    onSubmit: (materials) => {
                        onAdd(materials);
                        closeImportModal();
                    },
                    onClose: closeImportModal,
                    defaultMaterialsSet,
                })
                : null;
        };
        this.renderSaveActionDialog = () => {
            const { openSaveActionDialog, mdState } = this.props;
            return openSaveActionDialog ? openSaveActionDialog(mdState) : null;
        };
        this.state = {
            showSupercellDialog: false,
            showSurfaceDialog: false,
            showExportMaterialsDialog: false,
            showStandataImportDialog: false,
            showDefaultImportModalDialog: false,
            showCombinatorialDialog: false,
            showInterpolateDialog: false,
            showThreejsEditorModal: false,
            showBoundaryConditionsDialog: false,
            // showPythonTransformation: false,
            showJupyterLiteTransformation: false,
        };
    }
    renderIOMenu() {
        const { openSaveActionDialog, onExit, openImportModal } = this.props;
        return (_jsxs(ButtonActivatedMenuMaterialUI, { title: "Input/Output", children: [_jsxs(MenuItem, { disabled: !openImportModal, onClick: this.renderImportModal, children: [_jsx(ListItemIcon, { children: _jsx(AddCircleIcon, {}) }), "Import"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showStandataImportDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(AddCircleIcon, {}) }), "Import from Standata"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showDefaultImportModalDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(IconByName, { name: "actions.upload" }) }), "Upload from Disk"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showExportMaterialsDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(GetAppIcon, {}) }), "Export"] }), _jsxs(MenuItem, { disabled: !openSaveActionDialog, onClick: this.renderSaveActionDialog, children: [_jsx(ListItemIcon, { children: _jsx(SaveIcon, {}) }), "Save"] }), _jsxs(MenuItem, { disabled: !onExit, onClick: onExit, children: [_jsx(ListItemIcon, { children: _jsx(ExitToAppIcon, {}) }), "Exit"] })] }));
    }
    renderEditMenu() {
        const { onUndo, onRedo, onReset, onClone, onToggleIsNonPeriodic } = this.props;
        return (_jsxs(ButtonActivatedMenuMaterialUI, { title: "Edit", children: [_jsxs(MenuItem, { onClick: onUndo, children: [_jsx(ListItemIcon, { children: _jsx(UndoIcon, {}) }), "Undo"] }), _jsxs(MenuItem, { onClick: onRedo, children: [_jsx(ListItemIcon, { children: _jsx(RedoIcon, {}) }), "Redo"] }), _jsxs(MenuItem, { onClick: onReset, children: [_jsx(ListItemIcon, { children: _jsx(CloseIcon, {}) }), "Reset"] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: onClone, children: [_jsx(ListItemIcon, { children: _jsx(CloneIcon, {}) }), "Clone"] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: this._handleConventionalCellSelect, children: [_jsx(ListItemIcon, { children: _jsx(ConventionalCellIcon, {}) }), "Use Conventional Cell"] }), _jsxs(MenuItem, { onClick: onToggleIsNonPeriodic, children: [_jsx(ListItemIcon, { children: _jsx(DeviceHubIcon, {}) }), "Toggle \"isNonPeriodic\""] })] }));
    }
    renderViewMenu() {
        const { onSectionVisibilityToggle, isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen, } = this.props;
        return (_jsxs(ButtonActivatedMenuMaterialUI, { title: "View", children: [_jsxs(MenuItem, { onClick: () => this.setState({ showThreejsEditorModal: true }), children: [_jsx(ListItemIcon, { children: _jsx(ThreeDEditorIcon, {}) }), "Multi-Material 3D Editor"] }), _jsx(Divider, {}), _jsxs(MenuItem, { onClick: () => onSectionVisibilityToggle("ItemsList"), children: [_jsx(ListItemIcon, { children: isVisibleItemsList ? _jsx(VisibilityOffIcon, {}) : _jsx(VisibilityIcon, {}) }), "Sidebar"] }), _jsxs(MenuItem, { onClick: () => onSectionVisibilityToggle("SourceEditor"), children: [_jsx(ListItemIcon, { children: isVisibleSourceEditor ? _jsx(VisibilityOffIcon, {}) : _jsx(VisibilityIcon, {}) }), "Source Editor"] }), _jsxs(MenuItem, { onClick: () => onSectionVisibilityToggle("ThreeDEditorFullscreen"), children: [_jsx(ListItemIcon, { children: isVisibleThreeDEditorFullscreen ? (_jsx(VisibilityOffIcon, {})) : (_jsx(VisibilityIcon, {})) }), "3D Viewer/Editor"] }), _jsxs(MenuItem, { onClick: () => onSectionVisibilityToggle("JupyterLiteSessionDrawer"), children: [_jsx(ListItemIcon, { children: _jsx(Terminal, {}) }), "JupyterLite Session"] })] }));
    }
    renderAdvancedMenu() {
        return (_jsxs(ButtonActivatedMenuMaterialUI, { title: "Advanced", children: [_jsxs(MenuItem, { onClick: () => this.setState({ showSupercellDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(SupercellIcon, {}) }), "Supercell"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showCombinatorialDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(CombinatorialSetIcon, {}) }), "Combinatorial set"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showInterpolateDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(InterpolatedSetIcon, {}) }), "Interpolated set"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showSurfaceDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(SlabIcon, {}) }), "Surface / slab"] }), _jsxs(MenuItem, { onClick: () => this.setState({ showBoundaryConditionsDialog: true }), children: [_jsx(ListItemIcon, { children: _jsx(BoundaryConditionsIcon, {}) }), "Boundary Conditions"] }), false && (_jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(PolymerIcon, {}) }), "Polymer"] })), false && (_jsxs(MenuItem, { children: [_jsx(ListItemIcon, { children: _jsx(NanotubeIcon, {}) }), "Nanotube"] })), _jsxs(MenuItem, { onClick: () => this.setState((state) => ({
                        showJupyterLiteTransformation: !state.showJupyterLiteTransformation,
                    })), children: [_jsx(ListItemIcon, { children: _jsx(Terminal, {}) }), "JupyterLite Transformation"] })] }));
    }
    renderHelpMenu() {
        return (_jsxs(ButtonActivatedMenuMaterialUI, { title: "Help", children: [_jsxs(MenuItem, { onClick: () => this.openPageByURL("https://docs.exabyte.io/materials-designer/overview/"), children: [_jsx(ListItemIcon, { children: _jsx(HelpIcon, {}) }), "Documentation"] }), _jsxs(MenuItem, { onClick: () => this.openPageByURL("https://docs.exabyte.io/tutorials/materials/overview/"), children: [_jsx(ListItemIcon, { children: _jsx(AssignmentIcon, {}) }), "Tutorials"] })] }));
    }
    renderSpinner() {
        const { mdState } = this.props;
        return (_jsx(Stack, { spacing: 2, direction: "row", justifyContent: "end", sx: { flex: 1 }, children: mdState.isLoading ? (_jsx(CircularProgress, { color: "warning", size: 30 })) : (_jsx(CheckIcon, { color: "success", size: 50 })) }));
    }
    renderThreejsEditorModal() {
        const { onAdd, mdState: { materials }, } = this.props;
        const { showThreejsEditorModal } = this.state;
        return (_jsx(ThreejsEditorModal, { show: showThreejsEditorModal, onHide: (material) => {
                this.setState({ showThreejsEditorModal: !showThreejsEditorModal });
                if (material) {
                    const newMaterial = material;
                    newMaterial.isUpdated = true; // to show it as new (yellow color)
                    onAdd(newMaterial);
                }
            }, materials: materials, modalId: "threejs-editor" }));
    }
    render() {
        const { showThreejsEditorModal, showSupercellDialog, showSurfaceDialog, showBoundaryConditionsDialog, showCombinatorialDialog, showExportMaterialsDialog, showInterpolateDialog, 
        // showPythonTransformation,
        showStandataImportDialog, showDefaultImportModalDialog, showJupyterLiteTransformation, } = this.state;
        const { children, className, mdState: { materials, index }, onAdd, onExport, onGenerateSupercell, onGenerateSurface, onSetBoundaryConditions, maxCombinatorialBasesCount, defaultMaterialsSet, } = this.props;
        const material = materials[index];
        if (showThreejsEditorModal)
            return this.renderThreejsEditorModal();
        return (_jsxs(Toolbar, { variant: "dense", className: setClass(className, "materials-designer-header-menu"), children: [children, this.renderIOMenu(), this.renderEditMenu(), this.renderViewMenu(), this.renderAdvancedMenu(), this.renderHelpMenu(), this.renderSpinner(), _jsx(SupercellDialog, { isOpen: showSupercellDialog, modalId: "supercellModal", backdropColor: "dark", onSubmit: onGenerateSupercell, onHide: () => this.setState({ showSupercellDialog: false }) }), _jsx(SurfaceDialog, { isOpen: showSurfaceDialog, modalId: "surfaceModal", backdropColor: "dark", onSubmit: onGenerateSurface, onHide: () => this.setState({ showSurfaceDialog: false }) }), _jsx(BoundaryConditionsDialog, { isOpen: showBoundaryConditionsDialog, modalId: "BoundaryConditionsModal", backdropColor: "dark", material: material, onSubmit: onSetBoundaryConditions, onHide: () => this.setState({ showBoundaryConditionsDialog: false }) }), _jsx(ExportActionDialog, { isOpen: showExportMaterialsDialog, modalId: "ExportActionsModal", onHide: () => this.setState({ showExportMaterialsDialog: false }), onSubmit: onExport }), _jsx(StandataImportDialog, { modalId: "standataImportModalDialog", show: showStandataImportDialog, onSubmit: (...args) => {
                        onAdd(...args);
                        this.setState({ showStandataImportDialog: false });
                    }, onClose: () => this.setState({ showStandataImportDialog: false }), defaultMaterialConfigs: defaultMaterialsSet }), _jsx(UploadDialog, { show: showDefaultImportModalDialog, onClose: () => this.setState({ showDefaultImportModalDialog: false }), onSubmit: (...args) => {
                        onAdd(...args);
                        this.setState({ showDefaultImportModalDialog: false });
                    } }), _jsx(CombinatorialBasisDialog, { title: "Generate Combinatorial Set", modalId: "combinatorialSetModal", isOpen: showCombinatorialDialog, maxCombinatorialBasesCount: maxCombinatorialBasesCount, backdropColor: "dark", material: material, onHide: () => this.setState({ showCombinatorialDialog: false }), onSubmit: (...args) => {
                        onAdd(...args);
                        this.setState({ showCombinatorialDialog: false });
                    } }), _jsx(InterpolateBasesDialog, { title: "Generate Interpolated Set", modalId: "interpolatedSetModal", isOpen: showInterpolateDialog, backdropColor: "dark", material: material, material2: materials[index + 1 === materials.length ? 0 : index + 1], onHide: () => this.setState({ showInterpolateDialog: false }), onSubmit: (...args) => {
                        onAdd(...args);
                        this.setState({ showInterpolateDialog: false });
                    } }), _jsx(JupyterLiteTransformation, { title: "JupyterLite Transformation", show: showJupyterLiteTransformation, materials: materials, onHide: () => this.setState({ showJupyterLiteTransformation: false }), onMaterialsUpdate: (...args) => {
                        onAdd(...args);
                        this.setState({ showJupyterLiteTransformation: false });
                    } })] }));
    }
}
HeaderMenuToolbar.propTypes = {
    mdState: PropTypes.shape({
        index: PropTypes.number,
        isLoading: PropTypes.bool,
        materials: PropTypes.arrayOf(PropTypes.object),
    }).isRequired,
    className: PropTypes.string,
    maxCombinatorialBasesCount: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    defaultMaterialsSet: PropTypes.array.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    onReset: PropTypes.func.isRequired,
    onClone: PropTypes.func.isRequired,
    onToggleIsNonPeriodic: PropTypes.func.isRequired,
    onAdd: PropTypes.func.isRequired,
    onExport: PropTypes.func.isRequired,
    onExit: PropTypes.func,
    onGenerateSupercell: PropTypes.func.isRequired,
    onGenerateSurface: PropTypes.func.isRequired,
    onSetBoundaryConditions: PropTypes.func.isRequired,
    onSectionVisibilityToggle: PropTypes.func.isRequired,
    isVisibleItemsList: PropTypes.bool.isRequired,
    isVisibleSourceEditor: PropTypes.bool.isRequired,
    isVisibleThreeDEditorFullscreen: PropTypes.bool.isRequired,
    openImportModal: PropTypes.func,
    closeImportModal: PropTypes.func,
    openSaveActionDialog: PropTypes.func,
    children: PropTypes.node,
};
HeaderMenuToolbar.defaultProps = {
    className: undefined,
    openSaveActionDialog: null,
    children: null,
    onExit: undefined,
    openImportModal: undefined,
    closeImportModal: undefined,
};
export default HeaderMenuToolbar;
