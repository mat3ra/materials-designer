import "allotment/dist/style.css";

import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import FullscreenComponentMixin from "@mat3ra/cove/dist/other/fullscreen";
import ThemeProvider from "@mat3ra/cove/dist/theme/provider";
// eslint-disable-next-line import/no-unresolved
import { MaterialStandata } from "@mat3ra/standata";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { Allotment } from "allotment";
import setClass from "classnames";
import { mix } from "mixwith";
import PropTypes from "prop-types";
import React from "react";

// TODO: use when converting to typescript
// import {MaterialSchema} from "@mat3ra/code/dist/js/types";
import { ThreeDEditorFullscreen } from "./components/3d_editor/ThreeDEditorFullscreen";
import EditorSelectionInfo, {
    FOOTER_HEIGHT,
} from "./components/3d_editor_selection_info/EditorSelectionInfo";
import JupyterLiteSessionDrawer from "./components/drawer_session/JupyterLiteSessionDrawer";
import HeaderMenuToolbar from "./components/header_menu/HeaderMenuToolbar";
import { QUICK_ACTIONS_HEIGHT } from "./components/header_menu/QuickActionToolbar";
import StandataImportDialog from "./components/include/StandataImportDialog";
import UploadDialog from "./components/include/UploadDialog";
import ItemsList from "./components/items_list/ItemsList";
import BasisEditor from "./components/source_editor/Basis";
import LatticeEditor from "./components/source_editor/Lattice";
import { MDMaterial } from "./MDMaterial";
import { theme } from "./settings";

const data = MaterialStandata.runtimeData;
const materialConfigs = Object.values(data.filesMapByName);

const MENU_BAR_HEIGHT = 54;
// The app bar stacks the menu row and the quick-action row; the panels below subtract both.
const APP_BAR_HEIGHT = MENU_BAR_HEIGHT + QUICK_ACTIONS_HEIGHT;

/** Panel widths a session starts with, in pixels; the user drags from here. */
const DEFAULT_PANE_SIZES = [280, 440, 780];
const PANE_SIZES_STORAGE_KEY = "materials-designer.paneSizes";

/** Widths the user last dragged to, falling back to the defaults. */
function readStoredPaneSizes() {
    try {
        const stored = JSON.parse(window.localStorage.getItem(PANE_SIZES_STORAGE_KEY));
        const isUsable =
            Array.isArray(stored) &&
            stored.length === DEFAULT_PANE_SIZES.length &&
            stored.every((size) => Number.isFinite(size) && size > 0);
        return isUsable ? stored : DEFAULT_PANE_SIZES;
    } catch (error) {
        // Storage can be unavailable (private browsing, embedded hosts): use the defaults.
        return DEFAULT_PANE_SIZES;
    }
}

class MaterialsDesigner extends mix(React.Component).with(FullscreenComponentMixin) {
    constructor(props) {
        super(props);
        this.state = {
            isVisibleItemsList: true,
            isVisibleSourceEditor: true,
            isVisibleThreeDEditorFullscreen: true,
            isVisibleJupyterLiteSessionDrawer: false,
            importMaterialsDialogProps: null,
            // Owned here rather than in the header menu: the materials list opens these too.
            openDialog: null,
        };
        this.containerRef = React.createRef();
        // Read once: `defaultSizes` is consumed on mount, and `preferredSize` is read again only
        // when a hidden pane comes back. Re-reading storage on every render buys nothing.
        this.paneSizes = readStoredPaneSizes();
    }

    shouldComponentUpdate(nextProps, nextState) {
        try {
            const [nextProps_, thisProps_, nextState_, thisState_] = [
                nextProps,
                this.props,
                nextState,
                this.state,
            ].map(JSON.stringify);
            return !(nextProps_ === thisProps_) || !(nextState_ === thisState_);
        } catch (error) {
            // JSON.stringify calls material.toJSON(); schema failures must not white-screen the app.
            console.error("MaterialsDesigner.shouldComponentUpdate stringify failed", error);
            return true;
        }
    }

    onPanesResized = (sizes) => {
        // Allotment reports a hidden pane as 0 wide. Persisting that zero would fail the
        // "every size > 0" check on the next load and silently drop the whole layout, so a pane
        // that is not on screen keeps whatever width it last had.
        this.paneSizes = sizes.map((size, i) => (size > 0 ? size : this.paneSizes[i]));
        try {
            window.localStorage.setItem(PANE_SIZES_STORAGE_KEY, JSON.stringify(this.paneSizes));
        } catch (error) {
            // Not being able to remember the layout is not worth interrupting the session for.
        }
    };

    checkIfOnlyOneGridItemIsVisible = () => {
        const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } =
            this.state;
        return (
            [isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen]
                .map((e) => Number(e))
                .reduce((a, b) => a + b, 0) === 1
        );
    };

    onOpenDialog = (openDialog) => this.setState({ openDialog });

    onCloseDialog = () => this.setState({ openDialog: null });

    onAddFromDialog = (...args) => {
        this.props.onAdd(...args);
        this.onCloseDialog();
    };

    onSectionVisibilityToggle = (componentName) => {
        const stateKey = `isVisible${componentName}`;
        if (stateKey in this.state) {
            // if only one grid item is visible, it should not be possible to hide it
            if (this.checkIfOnlyOneGridItemIsVisible() && this.state[stateKey]) return;
            // otherwise, toggle the visibility
            this.setState({ [stateKey]: !this.state[stateKey] }, () => {
                // Trigger resize event to update the 3D viewer/editor size
                window.dispatchEvent(new Event("resize"));
            });
        }
    };

    render() {
        const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } =
            this.state;
        const mainContainerHeightDirective = `calc(100vh - ${
            APP_BAR_HEIGHT + FOOTER_HEIGHT - 8
        }px)`; // 8px is the padding + borders

        const { mdState } = this.props;
        const globalMaterial = mdState.materials[mdState.index];

        return (
            <ThemeProvider theme={theme}>
                <ScopedCssBaseline enableColorScheme>
                    <Paper id="materials-designer">
                        <AppBar position="static" className={setClass("", this.props.className)}>
                            {/* TODO: find out how to avoid passing material to header */}
                            <HeaderMenuToolbar
                                mdState={mdState}
                                onUndo={this.props.onUndo}
                                onRedo={this.props.onRedo}
                                canUndo={this.props.canUndo}
                                canRedo={this.props.canRedo}
                                onReset={this.props.onReset}
                                onClone={this.props.onClone}
                                onToggleIsNonPeriodic={this.props.onToggleIsNonPeriodic}
                                onUpdate={this.props.onUpdate}
                                onAdd={this.props.onAdd}
                                onExport={this.props.onExport}
                                onExit={this.props.onExit}
                                openImportModal={this.props.openImportModal}
                                closeImportModal={this.props.closeImportModal}
                                openSaveActionDialog={this.props.openSaveActionDialog}
                                onGenerateSupercell={this.props.onGenerateSupercell}
                                onGenerateSurface={this.props.onGenerateSurface}
                                onSetBoundaryConditions={this.props.onSetBoundaryConditions}
                                maxCombinatorialBasesCount={this.props.maxCombinatorialBasesCount}
                                defaultMaterialsSet={this.props.defaultMaterialsSet}
                                onSectionVisibilityToggle={this.onSectionVisibilityToggle}
                                onOpenDialog={this.onOpenDialog}
                                onItemClick={this.props.onItemClick}
                                isVisibleItemsList={isVisibleItemsList}
                                isVisibleSourceEditor={isVisibleSourceEditor}
                                isVisibleThreeDEditorFullscreen={isVisibleThreeDEditorFullscreen}
                                isVisibleJupyterLiteSessionDrawer={
                                    this.state.isVisibleJupyterLiteSessionDrawer
                                }
                            >
                                <IconButton
                                    color="inherit"
                                    disabled
                                    edge="start"
                                    disableFocusRipple
                                    disableRipple
                                    sx={{ mr: 0.75 }}
                                >
                                    <IconByName
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        name="entities.material"
                                        sx={{ fontSize: "1.5rem" }}
                                    />
                                </IconButton>
                            </HeaderMenuToolbar>
                        </AppBar>
                        <Box
                            component="main"
                            sx={{
                                [theme.breakpoints.up("md")]: {
                                    height: mainContainerHeightDirective,
                                },
                                [theme.breakpoints.down("md")]: {
                                    maxHeight: mainContainerHeightDirective,
                                },
                                overflowY: "auto",
                            }}
                        >
                            <Allotment
                                id="materials-designer-container"
                                className="materials-designer-panes"
                                ref={this.containerRef}
                                defaultSizes={this.paneSizes}
                                onDragEnd={this.onPanesResized}
                            >
                                <Allotment.Pane
                                    visible={isVisibleItemsList}
                                    minSize={220}
                                    preferredSize={this.paneSizes[0]}
                                >
                                    <Box
                                        className="materials-designer-items-list"
                                        sx={{ height: "100%", overflowY: "auto" }}
                                    >
                                        <ItemsList
                                            materials={mdState.materials}
                                            index={mdState.index}
                                            updatedIndices={mdState.updatedIndices}
                                            onItemClick={this.props.onItemClick}
                                            onRemove={this.props.onRemove}
                                            onRestore={this.props.onRestore}
                                            onNameUpdate={this.props.onNameUpdate}
                                            onClone={this.props.onClone}
                                            onImport={() => this.onOpenDialog("standata")}
                                            onUpload={() => this.onOpenDialog("upload")}
                                        />
                                    </Box>
                                </Allotment.Pane>

                                <Allotment.Pane
                                    visible={isVisibleSourceEditor}
                                    minSize={300}
                                    preferredSize={this.paneSizes[1]}
                                >
                                    <Box
                                        className="materials-designer-source-editor"
                                        sx={{ height: "100%", overflowY: "auto" }}
                                    >
                                        <LatticeEditor
                                            material={globalMaterial}
                                            onUpdate={this.props.onUpdate}
                                        />
                                        <BasisEditor
                                            material={globalMaterial}
                                            onUpdate={this.props.onUpdate}
                                        />
                                    </Box>
                                </Allotment.Pane>

                                <Allotment.Pane
                                    visible={isVisibleThreeDEditorFullscreen}
                                    minSize={320}
                                >
                                    <Box
                                        className="materials-designer-3d-editor"
                                        sx={{ height: "100%" }}
                                    >
                                        <ThreeDEditorFullscreen
                                            editable
                                            material={globalMaterial}
                                            isConventionalCellShown={
                                                this.props.isConventionalCellShown
                                            }
                                            boundaryConditions={globalMaterial.boundaryConditions}
                                            initialViewSettings={this.props.initialViewSettings}
                                            onUpdate={(material) => {
                                                const newMaterial = MDMaterial.fromMadeMaterial(
                                                    material,
                                                    globalMaterial.metadata,
                                                );
                                                this.props.onUpdate(newMaterial);
                                            }}
                                        />
                                    </Box>
                                </Allotment.Pane>
                            </Allotment>

                            {this.state.isVisibleJupyterLiteSessionDrawer && (
                                <JupyterLiteSessionDrawer
                                    materials={mdState.materials}
                                    show={this.state.isVisibleJupyterLiteSessionDrawer}
                                    onMaterialsUpdate={(...args) => {
                                        this.props.onAdd(...args);
                                    }}
                                    onHide={() => {
                                        this.setState({
                                            isVisibleJupyterLiteSessionDrawer: false,
                                        });
                                    }}
                                    containerRef={this.containerRef}
                                />
                            )}
                        </Box>
                        <EditorSelectionInfo
                            material={globalMaterial}
                            index={mdState.index}
                            materialsCount={mdState.materials.length}
                        />

                        <StandataImportDialog
                            modalId="standataImportModalDialog"
                            show={this.state.openDialog === "standata"}
                            onSubmit={this.onAddFromDialog}
                            onClose={this.onCloseDialog}
                            defaultMaterialConfigs={this.props.defaultMaterialsSet}
                        />

                        <UploadDialog
                            show={this.state.openDialog === "upload"}
                            onClose={this.onCloseDialog}
                            onSubmit={this.onAddFromDialog}
                        />
                    </Paper>
                </ScopedCssBaseline>
            </ThemeProvider>
        );
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
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,

    onAdd: PropTypes.func,
    onExport: PropTypes.func,
    onExit: PropTypes.func,

    openImportModal: PropTypes.func,
    closeImportModal: PropTypes.func,
    openSaveActionDialog: PropTypes.func,

    onRemove: PropTypes.func,
    onRestore: PropTypes.func,

    maxCombinatorialBasesCount: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    defaultMaterialsSet: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    initialViewSettings: PropTypes.object,
};

MaterialsDesigner.defaultProps = {
    defaultMaterialsSet: materialConfigs,
    canUndo: true,
    canRedo: true,
};

export default MaterialsDesigner;
