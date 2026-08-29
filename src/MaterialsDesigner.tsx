import "allotment/dist/style.css";

import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import FullscreenComponentMixin from "@mat3ra/cove/dist/other/fullscreen";
import ThemeProvider from "@mat3ra/cove/dist/theme/provider";
import type { MaterialSchema, Matrix3X3Schema } from "@mat3ra/esse/dist/js/types";
import type Material from "@mat3ra/made/dist/js/Material";
// eslint-disable-next-line import/no-unresolved
import { MaterialStandata } from "@mat3ra/standata";
import type { ViewSettingsFromUrl } from "@mat3ra/wave.js/dist/utils/viewSettingsUrl";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";
import { type AllotmentHandle, Allotment } from "allotment";
import setClass from "classnames";
import React from "react";

import { ThreeDEditorFullscreen } from "./components/3d_editor/ThreeDEditorFullscreen";
import EditorSelectionInfo, {
    FOOTER_HEIGHT,
} from "./components/3d_editor_selection_info/EditorSelectionInfo";
import JupyterLiteSessionDrawer from "./components/drawer_session/JupyterLiteSessionDrawer";
import type { SharedDialogName } from "./components/header_menu/actions";
import HeaderMenuToolbar from "./components/header_menu/HeaderMenuToolbar";
import type { SectionName } from "./components/header_menu/QuickActionToolbar";
import { QUICK_ACTIONS_HEIGHT } from "./components/header_menu/QuickActionToolbar";
import StandataImportDialog from "./components/include/StandataImportDialog";
import UploadDialog from "./components/include/UploadDialog";
import ItemsList from "./components/items_list/ItemsList";
import BasisEditor from "./components/source_editor/Basis";
import LatticeEditor from "./components/source_editor/Lattice";
import type { ImportModalProps } from "./MaterialsDesignerContainer";
import { MDMaterial } from "./MDMaterial";
import type { ExportFormat } from "./reducers/InputOutput";
import type { BoundaryConditions, MDState, SurfaceConfig } from "./reducers/Material";
import { theme } from "./settings";

const data = MaterialStandata.runtimeData;
// Standata infers one anonymous literal type per bundled file, with `lattice.type` widened to
// `string` and no `metadata`. Narrowed once here so every consumer sees the schema it expects.
const materialConfigs = Object.values(data.filesMapByName) as unknown as MaterialSchema[];

const MENU_BAR_HEIGHT = 54;
// The app bar stacks the menu row and the quick-action row; the panels below subtract both.
const APP_BAR_HEIGHT = MENU_BAR_HEIGHT + QUICK_ACTIONS_HEIGHT;

/** Panel widths a session starts with, in pixels; the user drags from here. */
const DEFAULT_PANE_SIZES = [280, 440, 780];
const PANE_SIZES_STORAGE_KEY = "materials-designer.paneSizes";

/** Widths the user last dragged to, falling back to the defaults. */
function readStoredPaneSizes() {
    try {
        const raw = window.localStorage.getItem(PANE_SIZES_STORAGE_KEY);
        const stored = raw ? JSON.parse(raw) : null;
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

export interface MaterialsDesignerProps {
    mdState: MDState;
    className?: string;
    isConventionalCellShown?: boolean;

    onUpdate: (material: MDMaterial, index?: number) => void;

    // ItemsList
    onItemClick: (index: number) => void;
    onNameUpdate: (name: string, index: number) => void;
    onRemove: (index: number) => void;
    onRestore?: (material: MDMaterial, index: number) => void;
    onClone: () => void;

    // Toolbar
    onGenerateSupercell: (matrix: Matrix3X3Schema) => void;
    onGenerateSurface: (config: SurfaceConfig) => void;
    onSetBoundaryConditions: (config: BoundaryConditions) => void;
    onToggleIsNonPeriodic: () => void;

    // Undo-Redo
    onUndo: () => void;
    onRedo: () => void;
    onReset: () => void;
    canUndo?: boolean;
    canRedo?: boolean;

    onAdd: (materials: MDMaterial | MDMaterial[], addAtIndex?: boolean) => void;
    onExport: (format: ExportFormat, useMultiple: boolean) => void;
    onExit?: () => void;

    // Both are fire-and-effect: the host opens its own modal, and the return value
    // is discarded - these are wired straight to a MenuItem onClick.
    openImportModal?: (params: ImportModalProps) => void;
    closeImportModal?: () => void;
    openSaveActionDialog?: ((state: MDState) => void) | null;

    maxCombinatorialBasesCount?: number;
    defaultMaterialsSet?: MaterialSchema[];
    initialViewSettings?: ViewSettingsFromUrl;
}

/** The `isVisible*` state keys, derived so they cannot drift from {@link SectionName}. */
type VisibilityKey = `isVisible${SectionName}`;

type MaterialsDesignerState = Record<VisibilityKey, boolean> & {
    /** Owned here rather than in the header menu: the materials list opens these too. */
    openDialog: SharedDialogName | null;
};

/**
 * cove's mixin is a plain class factory, so it is applied directly rather than through mixwith.
 * `mix(X).with(F)` is `mixins.reduce((c, m) => m(c), X)` - exactly `F(X)` for a single mixin - and
 * cove does not wrap this one in mixwith's `Mixin()`, so none of the caching or
 * `Symbol.hasInstance` machinery was ever involved. web-app does the same where one mixin applies
 * (`class EntityOrEntitySet extends EntitySetMixin(Entity)`) and keeps `mix().with()` for the
 * cases that compose several.
 *
 * The assertion supplies props and state: cove declares the returned constructor as
 * `new (props: never)`, which nothing can satisfy. The mixin contributes `toggleFullscreen` and a
 * `FullscreenHandlerComponent` getter, neither used here, and the `render()` it supplies is
 * overridden below.
 */
const MixedComponent = FullscreenComponentMixin(React.Component) as unknown as new (
    props: MaterialsDesignerProps,
) => React.Component<MaterialsDesignerProps, MaterialsDesignerState>;

class MaterialsDesigner extends MixedComponent {
    /** Attached to Allotment, so it holds its imperative handle rather than a DOM node. */
    containerRef: React.RefObject<AllotmentHandle>;

    /** Widths in px, one per pane. Mutated in place on drag rather than held in state. */
    paneSizes: number[];

    constructor(props: MaterialsDesignerProps) {
        super(props);
        this.state = {
            isVisibleItemsList: true,
            isVisibleSourceEditor: true,
            isVisibleThreeDEditorFullscreen: true,
            isVisibleJupyterLiteSessionDrawer: false,
            openDialog: null,
        };
        this.containerRef = React.createRef<AllotmentHandle>();
        // Read once: `defaultSizes` is consumed on mount, and `preferredSize` is read again only
        // when a hidden pane comes back. Re-reading storage on every render buys nothing.
        this.paneSizes = readStoredPaneSizes();
    }

    shouldComponentUpdate(nextProps: MaterialsDesignerProps, nextState: MaterialsDesignerState) {
        try {
            const [nextProps_, thisProps_, nextState_, thisState_] = [
                nextProps,
                this.props,
                nextState,
                this.state,
            ].map((value) => JSON.stringify(value));
            return !(nextProps_ === thisProps_) || !(nextState_ === thisState_);
        } catch (error) {
            // JSON.stringify calls material.toJSON(); schema failures must not white-screen the app.
            console.error("MaterialsDesigner.shouldComponentUpdate stringify failed", error);
            return true;
        }
    }

    onPanesResized = (sizes: number[]) => {
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

    onOpenDialog = (openDialog: SharedDialogName) => this.setState({ openDialog });

    onCloseDialog = () => this.setState({ openDialog: null });

    onAddFromDialog = (materials: MDMaterial | MDMaterial[], addAtIndex?: boolean) => {
        const { onAdd } = this.props;
        onAdd(materials, addAtIndex);
        this.onCloseDialog();
    };

    onSectionVisibilityToggle = (componentName: SectionName) => {
        const stateKey: VisibilityKey = `isVisible${componentName}`;
        if (stateKey in this.state) {
            // if only one grid item is visible, it should not be possible to hide it
            if (this.checkIfOnlyOneGridItemIsVisible() && this.state[stateKey]) return;
            // otherwise, toggle the visibility
            this.setState(
                { [stateKey]: !this.state[stateKey] } as Pick<
                    MaterialsDesignerState,
                    VisibilityKey
                >,
                () => {
                    // Trigger resize event to update the 3D viewer/editor size
                    window.dispatchEvent(new Event("resize"));
                },
            );
        }
    };

    render() {
        const { isVisibleItemsList, isVisibleSourceEditor, isVisibleThreeDEditorFullscreen } =
            this.state;
        const mainContainerHeightDirective = `calc(100vh - ${
            APP_BAR_HEIGHT + FOOTER_HEIGHT - 8
        }px)`; // 8px is the padding + borders

        const { mdState, defaultMaterialsSet = materialConfigs } = this.props;
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
                                defaultMaterialsSet={defaultMaterialsSet}
                                onSectionVisibilityToggle={this.onSectionVisibilityToggle}
                                onOpenDialog={this.onOpenDialog}
                                onItemClick={this.props.onItemClick}
                                isVisibleItemsList={isVisibleItemsList}
                                isVisibleSourceEditor={isVisibleSourceEditor}
                                isVisibleThreeDEditorFullscreen={isVisibleThreeDEditorFullscreen}
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
                                            onUpdate={(material: Material) => {
                                                // `fromMadeMaterial` spreads its second argument
                                                // over the config, so metadata lands as stray
                                                // top-level keys rather than under `metadata` -
                                                // which looks like it drops boundary conditions on
                                                // every 3D edit. Preserved exactly as it ships;
                                                // the 3D update path has no test to change it
                                                // behind. See plan/upcoming/bugfixes-2026-08-29.md.
                                                const newMaterial = MDMaterial.fromMadeMaterial(
                                                    material,
                                                    globalMaterial.metadata as Partial<MaterialSchema>,
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

                        {/* StandataImportDialog reads no modalId - it renders its own dialog. */}
                        <StandataImportDialog
                            show={this.state.openDialog === "standata"}
                            onSubmit={this.onAddFromDialog}
                            onClose={this.onCloseDialog}
                            defaultMaterialConfigs={defaultMaterialsSet}
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

export default MaterialsDesigner;
