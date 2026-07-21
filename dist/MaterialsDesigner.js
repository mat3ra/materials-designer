import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import FullscreenComponentMixin from "@mat3ra/cove/dist/other/fullscreen";
import ThemeProvider from "@mat3ra/cove/dist/theme/provider";
// eslint-disable-next-line import/no-unresolved
import { MaterialStandata } from "@mat3ra/standata";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import setClass from "classnames";
import { mix } from "mixwith";
import PropTypes from "prop-types";
import React from "react";
// TODO: use when converting to typescript
// import {MaterialSchema} from "@mat3ra/code/dist/js/types";
import { ThreeDEditorFullscreen } from "./components/3d_editor/ThreeDEditorFullscreen";
import EditorSelectionInfo, { FOOTER_HEIGHT, } from "./components/3d_editor_selection_info/EditorSelectionInfo";
import JupyterLiteSessionDrawer from "./components/drawer_session/JupyterLiteSessionDrawer";
import HeaderMenuToolbar from "./components/header_menu/HeaderMenuToolbar";
import ItemsList from "./components/items_list/ItemsList";
import BasisEditor from "./components/source_editor/Basis";
import LatticeEditor from "./components/source_editor/Lattice";
import { MDMaterial } from "./MDMaterial";
import { theme } from "./settings";
const data = MaterialStandata.runtimeData;
const materialConfigs = Object.values(data.filesMapByName);
const APP_BAR_HEIGHT = 54;
const GRID_CONFIG_BY_VISIBILITY = {
    // "111" means that all three components are visible
    "#111": {
        1: { xs: 12, md: 2.5, lg: 2, xl: 1.5 },
        2: { xs: 12, md: 4.75, lg: 4.375, xl: 4 },
        3: { xs: 12, md: 4.75, lg: 5.625, xl: 6.5 },
    },
    "#001": {
        1: { xs: 12 },
        2: { xs: 12 },
        3: { xs: 12 },
    },
    "#010": {
        1: { xs: 12 },
        2: { xs: 12 },
        3: { xs: 12 },
    },
    "#100": {
        1: { xs: 12 },
        2: { xs: 12 },
        3: { xs: 12 },
    },
    "#011": {
        1: { xs: 0 },
        2: { xs: 12, md: 6 },
        3: { xs: 12, md: 6 },
    },
    "#101": {
        1: { xs: 12, md: 3 },
        2: { xs: 12, md: 0 },
        3: { xs: 12, md: 9 },
    },
    "#110": {
        1: { xs: 12, md: 4 },
        2: { xs: 12, md: 8 },
        3: { xs: 12, md: 0 },
    },
};
class MaterialsDesigner extends mix(React.Component).with(FullscreenComponentMixin) {
    constructor(props) {
        super(props);
        this.getGridConfig = () => {
            const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } = this.state;
            const arrayOfOnesAsStrings = [
                isVisibleItemsList,
                isVisibleSourceEditor,
                isVisibleThreeDEditorFullscreen,
            ].map((e) => String(Number(e)));
            const visibilityKey = `#${arrayOfOnesAsStrings.join("")}`;
            return GRID_CONFIG_BY_VISIBILITY[visibilityKey];
        };
        this.checkIfOnlyOneGridItemIsVisible = () => {
            const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } = this.state;
            return ([isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen]
                .map((e) => Number(e))
                .reduce((a, b) => a + b, 0) === 1);
        };
        this.onSectionVisibilityToggle = (componentName) => {
            const stateKey = `isVisible${componentName}`;
            if (stateKey in this.state) {
                // if only one grid item is visible, it should not be possible to hide it
                if (this.checkIfOnlyOneGridItemIsVisible() && this.state[stateKey])
                    return;
                // otherwise, toggle the visibility
                this.setState({ [stateKey]: !this.state[stateKey] }, () => {
                    // Trigger resize event to update the 3D viewer/editor size
                    window.dispatchEvent(new Event("resize"));
                });
            }
        };
        this.state = {
            isVisibleItemsList: true,
            isVisibleSourceEditor: true,
            isVisibleThreeDEditorFullscreen: true,
            isVisibleJupyterLiteSessionDrawer: false,
            importMaterialsDialogProps: null,
        };
        this.containerRef = React.createRef();
    }
    shouldComponentUpdate(nextProps, nextState) {
        const [nextProps_, thisProps_, nextState_, thisState_] = [
            nextProps,
            this.props,
            nextState,
            this.state,
        ].map(JSON.stringify);
        return !(nextProps_ === thisProps_) || !(nextState_ === thisState_);
    }
    render() {
        const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } = this.state;
        const gridConfig = this.getGridConfig();
        const mainContainerHeightDirective = `calc(100vh - ${APP_BAR_HEIGHT + FOOTER_HEIGHT - 8}px)`; // 8px is the padding + borders
        const { mdState } = this.props;
        const globalMaterial = mdState.materials[mdState.index];
        return (_jsx(ThemeProvider, { theme: theme, children: _jsx(ScopedCssBaseline, { enableColorScheme: true, children: _jsxs(Paper, { id: "materials-designer", children: [_jsx(AppBar, { position: "static", className: setClass("", this.props.className), children: _jsx(HeaderMenuToolbar, { mdState: mdState, onUndo: this.props.onUndo, onRedo: this.props.onRedo, onReset: this.props.onReset, onClone: this.props.onClone, onToggleIsNonPeriodic: this.props.onToggleIsNonPeriodic, onUpdate: this.props.onUpdate, onAdd: this.props.onAdd, onExport: this.props.onExport, onExit: this.props.onExit, openImportModal: this.props.openImportModal, closeImportModal: this.props.closeImportModal, openSaveActionDialog: this.props.openSaveActionDialog, onGenerateSupercell: this.props.onGenerateSupercell, onGenerateSurface: this.props.onGenerateSurface, onSetBoundaryConditions: this.props.onSetBoundaryConditions, maxCombinatorialBasesCount: this.props.maxCombinatorialBasesCount, defaultMaterialsSet: this.props.defaultMaterialsSet, onSectionVisibilityToggle: this.onSectionVisibilityToggle, isVisibleItemsList: isVisibleItemsList, isVisibleSourceEditor: isVisibleSourceEditor, isVisibleThreeDEditorFullscreen: isVisibleThreeDEditorFullscreen, isVisibleJupyterLiteSessionDrawer: this.state.isVisibleJupyterLiteSessionDrawer, children: _jsx(IconButton, { color: "inherit", disabled: true, edge: "start", disableFocusRipple: true, disableRipple: true, sx: { mr: 0.75 }, children: _jsx(IconByName, { size: "large", edge: "start", color: "inherit", name: "entities.material", sx: { fontSize: "1.5rem" } }) }) }) }), _jsx(Box, { component: "main", sx: {
                                [theme.breakpoints.up("md")]: {
                                    height: mainContainerHeightDirective,
                                },
                                [theme.breakpoints.down("md")]: {
                                    maxHeight: mainContainerHeightDirective,
                                },
                                overflowY: "auto",
                            }, children: _jsxs(Grid, { container: true, justifyContent: "flex-start", id: "materials-designer-container", sx: { height: "100%" }, ref: this.containerRef, children: [isVisibleItemsList && (_jsx(Grid, { item: true, ...gridConfig[1], sx: {
                                            borderRight: `1px solid ${theme.palette.grey[800]}`,
                                            height: "100%",
                                            overflowY: "auto",
                                        }, children: _jsx(Grid, { item: true, className: "materials-designer-items-list", xs: 12, mt: 0.25, children: _jsx(ItemsList, { materials: mdState.materials, index: mdState.index, updatedIndices: mdState.updatedIndices, onItemClick: this.props.onItemClick, onRemove: this.props.onRemove, onNameUpdate: this.props.onNameUpdate }) }) })), isVisibleSourceEditor && (_jsxs(Grid, { item: true, ...gridConfig[2], sx: {
                                            borderRight: `1px solid ${theme.palette.grey[800]}`,
                                            height: "100%",
                                            width: "100%",
                                            overflowY: "auto",
                                        }, className: "materials-designer-source-editor", children: [_jsx(Grid, { item: true, xs: 12, mt: 0.25, children: _jsx(LatticeEditor, { material: globalMaterial, onUpdate: this.props.onUpdate }) }), _jsx(Grid, { item: true, xs: 12, mt: 0.25, children: _jsx(BasisEditor, { material: globalMaterial, onUpdate: this.props.onUpdate }) })] })), isVisibleThreeDEditorFullscreen && (
                                    // eslint-disable-next-line react/jsx-props-no-spreading
                                    _jsx(Grid, { item: true, ...gridConfig[3], mt: 0.25, children: _jsx(ThreeDEditorFullscreen, { editable: true, material: globalMaterial, isConventionalCellShown: this.props.isConventionalCellShown, boundaryConditions: globalMaterial.boundaryConditions, initialViewSettings: this.props.initialViewSettings, onUpdate: (material) => {
                                                const newMaterial = MDMaterial.fromMadeMaterial(material, globalMaterial.metadata);
                                                this.props.onUpdate(newMaterial);
                                            } }) })), this.state.isVisibleJupyterLiteSessionDrawer && (_jsx(JupyterLiteSessionDrawer, { materials: mdState.materials, show: this.state.isVisibleJupyterLiteSessionDrawer, onMaterialsUpdate: (...args) => {
                                            this.props.onAdd(...args);
                                        }, onHide: () => {
                                            this.setState({
                                                isVisibleJupyterLiteSessionDrawer: false,
                                            });
                                        }, containerRef: this.containerRef }))] }) }), _jsx(EditorSelectionInfo, {})] }) }) }));
    }
}
MaterialsDesigner.propTypes = {
    mdState: PropTypes.shape({
        index: PropTypes.number,
        isLoading: PropTypes.bool,
        materials: PropTypes.arrayOf(PropTypes.object),
        updatedIndices: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,
    showToolbar: PropTypes.bool,
    isConventionalCellShown: PropTypes.bool,
    onUpdate: PropTypes.func,
    // ItemsList
    onItemClick: PropTypes.func,
    onNameUpdate: PropTypes.func,
    // Toolbar
    onGenerateSupercell: PropTypes.func,
    onGenerateSurface: PropTypes.func,
    onSetBoundaryConditions: PropTypes.func,
    onToggleIsNonPeriodic: PropTypes.func,
    // Undo-Redo
    onUndo: PropTypes.func,
    onRedo: PropTypes.func,
    onReset: PropTypes.func,
    onAdd: PropTypes.func,
    onExport: PropTypes.func,
    onExit: PropTypes.func,
    openImportModal: PropTypes.func,
    closeImportModal: PropTypes.func,
    openSaveActionDialog: PropTypes.func,
    onRemove: PropTypes.func,
    maxCombinatorialBasesCount: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    defaultMaterialsSet: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    initialViewSettings: PropTypes.object,
};
MaterialsDesigner.defaultProps = {
    defaultMaterialsSet: materialConfigs,
};
export default MaterialsDesigner;
