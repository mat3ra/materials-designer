/* eslint-disable react/sort-comp */
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
// TODO: wave.js removed ThreejsEditorModal in favor of an in-viewer edit mode
// (InteractiveStructureEditorMixin); re-wire this menu to that once materials-designer
// adopts it. See https://github.com/mat3ra/wave.js/commit/751a7e3.
// import { ThreejsEditorModal } from "@mat3ra/wave.js";
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
// TODO: only used by the disabled Multi-Material 3D Editor menu item
// import ThreeDEditorIcon from "@mui/icons-material/ThreeDRotation";
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
import Tooltip from "@mui/material/Tooltip";
import setClass from "classnames";
import PropTypes from "prop-types";
import React from "react";

// TODO: only used by the disabled renderThreejsEditorModal below
// import { MDMaterial } from "../../MDMaterial";
import { BoundaryConditionsDialog } from "../3d_editor/advanced_geometry/BoundaryConditionsDialog";
import CombinatorialBasisDialog from "../3d_editor/advanced_geometry/CombinatorialBasisDialog";
import InterpolateBasesDialog from "../3d_editor/advanced_geometry/InterpolateBasesDialog";
import JupyterLiteTransformation from "../3d_editor/advanced_geometry/python_transformation/JupyterLiteTransformation";
import SupercellDialog from "../3d_editor/advanced_geometry/SupercellDialog";
import SurfaceDialog from "../3d_editor/advanced_geometry/SurfaceDialog";
import { ButtonActivatedMenuMaterialUI } from "../include/material-ui/ButtonActivatedMenu";
import { buildActions, isTypingTarget, matchesShortcut } from "./actions";
import CommandPalette from "./CommandPalette";
import ExportActionDialog from "./ExportActionDialog";
import QuickActionToolbar from "./QuickActionToolbar";

class HeaderMenuToolbar extends React.Component {
    constructor(config) {
        super(config);
        this.state = {
            showSupercellDialog: false,
            showSurfaceDialog: false,
            showExportMaterialsDialog: false,
            showCombinatorialDialog: false,
            showInterpolateDialog: false,
            // TODO: unused while renderThreejsEditorModal is disabled, see comment
            // at the top of this file
            // showThreejsEditorModal: false,
            showBoundaryConditionsDialog: false,
            showJupyterLiteTransformation: false,
            showCommandPalette: false,
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleShortcut);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleShortcut);
    }

    /** Opens a dialog owned by this component, by state key. */
    openLocalDialog = (stateKey) => this.setState({ [stateKey]: true });

    get actions() {
        const { onUndo, onRedo, onClone, onOpenDialog, canUndo, canRedo } = this.props;
        return buildActions({
            onUndo,
            onRedo,
            onClone,
            onOpenDialog,
            onUseConventionalCell: this._handleConventionalCellSelect,
            openLocalDialog: this.openLocalDialog,
            canUndo,
            canRedo,
        });
    }

    handleShortcut = (event) => {
        if (matchesShortcut(event, "Mod+K")) {
            event.preventDefault();
            this.setState((state) => ({ showCommandPalette: !state.showCommandPalette }));
            return;
        }
        // Everything below would otherwise steal keys from the basis editor and name fields,
        // which have their own undo stacks.
        if (isTypingTarget(event.target)) return;
        const action = this.actions.find(({ shortcut }) => matchesShortcut(event, shortcut));
        if (!action) return;
        // Swallow the key even when the action is unavailable: Mod+Z with an empty history should
        // do nothing here, not fall through to the browser's own undo.
        event.preventDefault();
        if (action.disabled) return;
        action.run();
    };

    _handleConventionalCellSelect = () => {
        const {
            onUpdate,
            mdState: { materials, index },
        } = this.props;
        const newMaterial = materials[index].getACopyWithConventionalCell();
        return onUpdate(newMaterial, index);
    };

    renderIOMenu() {
        const { openSaveActionDialog, onExit, openImportModal } = this.props;
        return (
            <ButtonActivatedMenuMaterialUI title="Input/Output">
                <MenuItem disabled={!openImportModal} onClick={this.renderImportModal}>
                    <ListItemIcon>
                        <AddCircleIcon />
                    </ListItemIcon>
                    Import
                </MenuItem>
                <MenuItem onClick={() => this.props.onOpenDialog("standata")}>
                    <ListItemIcon>
                        <AddCircleIcon />
                    </ListItemIcon>
                    Import from Standata
                </MenuItem>
                <MenuItem onClick={() => this.props.onOpenDialog("upload")}>
                    <ListItemIcon>
                        <IconByName name="actions.upload" />
                    </ListItemIcon>
                    Upload from Disk
                </MenuItem>
                <MenuItem onClick={() => this.setState({ showExportMaterialsDialog: true })}>
                    <ListItemIcon>
                        <GetAppIcon />
                    </ListItemIcon>
                    Export
                </MenuItem>
                <MenuItem disabled={!openSaveActionDialog} onClick={this.renderSaveActionDialog}>
                    <ListItemIcon>
                        <SaveIcon />
                    </ListItemIcon>
                    Save
                </MenuItem>
                <MenuItem disabled={!onExit} onClick={onExit}>
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    Exit
                </MenuItem>
            </ButtonActivatedMenuMaterialUI>
        );
    }

    renderEditMenu() {
        const { onUndo, onRedo, onReset, onClone, onToggleIsNonPeriodic, canUndo, canRedo } =
            this.props;
        return (
            <ButtonActivatedMenuMaterialUI title="Edit">
                <MenuItem disabled={!canUndo} onClick={onUndo}>
                    <ListItemIcon>
                        <UndoIcon />
                    </ListItemIcon>
                    Undo
                </MenuItem>
                <MenuItem disabled={!canRedo} onClick={onRedo}>
                    <ListItemIcon>
                        <RedoIcon />
                    </ListItemIcon>
                    Redo
                </MenuItem>
                <MenuItem onClick={onReset}>
                    <ListItemIcon>
                        <CloseIcon />
                    </ListItemIcon>
                    Reset
                </MenuItem>
                <Divider />
                <MenuItem onClick={onClone}>
                    <ListItemIcon>
                        <CloneIcon />
                    </ListItemIcon>
                    Clone
                </MenuItem>
                <Divider />
                <MenuItem onClick={this._handleConventionalCellSelect}>
                    <ListItemIcon>
                        <ConventionalCellIcon />
                    </ListItemIcon>
                    Use Conventional Cell
                </MenuItem>
                <MenuItem onClick={onToggleIsNonPeriodic}>
                    <ListItemIcon>
                        <DeviceHubIcon />
                    </ListItemIcon>
                    Toggle &#34;isNonPeriodic&#34;
                </MenuItem>
            </ButtonActivatedMenuMaterialUI>
        );
    }

    renderViewMenu() {
        const {
            onSectionVisibilityToggle,
            isVisibleItemsList,
            isVisibleSourceEditor,
            isVisibleThreeDEditorFullscreen,
        } = this.props;
        return (
            <ButtonActivatedMenuMaterialUI title="View">
                {/* TODO: disabled until this menu is re-wired to wave.js's in-viewer
                    edit mode (see import comment above)
                <MenuItem onClick={() => this.setState({ showThreejsEditorModal: true })}>
                    <ListItemIcon>
                        <ThreeDEditorIcon />
                    </ListItemIcon>
                    Multi-Material 3D Editor
                </MenuItem>
                */}
                <Divider />
                <MenuItem onClick={() => onSectionVisibilityToggle("ItemsList")}>
                    <ListItemIcon>
                        {isVisibleItemsList ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </ListItemIcon>
                    Sidebar
                </MenuItem>
                <MenuItem onClick={() => onSectionVisibilityToggle("SourceEditor")}>
                    <ListItemIcon>
                        {isVisibleSourceEditor ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </ListItemIcon>
                    Source Editor
                </MenuItem>
                <MenuItem onClick={() => onSectionVisibilityToggle("ThreeDEditorFullscreen")}>
                    <ListItemIcon>
                        {isVisibleThreeDEditorFullscreen ? (
                            <VisibilityOffIcon />
                        ) : (
                            <VisibilityIcon />
                        )}
                    </ListItemIcon>
                    3D Viewer/Editor
                </MenuItem>
                <MenuItem onClick={() => onSectionVisibilityToggle("JupyterLiteSessionDrawer")}>
                    <ListItemIcon>
                        <Terminal />
                    </ListItemIcon>
                    JupyterLite Session
                </MenuItem>
            </ButtonActivatedMenuMaterialUI>
        );
    }

    renderAdvancedMenu() {
        return (
            <ButtonActivatedMenuMaterialUI title="Advanced">
                <MenuItem onClick={() => this.setState({ showSupercellDialog: true })}>
                    <ListItemIcon>
                        <SupercellIcon />
                    </ListItemIcon>
                    Supercell
                </MenuItem>
                <MenuItem onClick={() => this.setState({ showCombinatorialDialog: true })}>
                    <ListItemIcon>
                        <CombinatorialSetIcon />
                    </ListItemIcon>
                    Combinatorial set
                </MenuItem>
                <MenuItem onClick={() => this.setState({ showInterpolateDialog: true })}>
                    <ListItemIcon>
                        <InterpolatedSetIcon />
                    </ListItemIcon>
                    Interpolated set
                </MenuItem>
                <MenuItem onClick={() => this.setState({ showSurfaceDialog: true })}>
                    <ListItemIcon>
                        <SlabIcon />
                    </ListItemIcon>
                    Surface / slab
                </MenuItem>
                <MenuItem onClick={() => this.setState({ showBoundaryConditionsDialog: true })}>
                    <ListItemIcon>
                        <BoundaryConditionsIcon />
                    </ListItemIcon>
                    Boundary Conditions
                </MenuItem>
                {/* Hiding the below items until implemented */}
                {false && (
                    <MenuItem>
                        <ListItemIcon>
                            <PolymerIcon />
                        </ListItemIcon>
                        Polymer
                    </MenuItem>
                )}
                {false && (
                    <MenuItem>
                        <ListItemIcon>
                            <NanotubeIcon />
                        </ListItemIcon>
                        Nanotube
                    </MenuItem>
                )}
                <MenuItem
                    onClick={() =>
                        this.setState((state) => ({
                            showJupyterLiteTransformation: !state.showJupyterLiteTransformation,
                        }))
                    }
                >
                    <ListItemIcon>
                        <Terminal />
                    </ListItemIcon>
                    JupyterLite Transformation
                </MenuItem>
            </ButtonActivatedMenuMaterialUI>
        );
    }

    openPageByURL = (url) => {
        window.open(url, "_blank");
    };

    renderHelpMenu() {
        return (
            <ButtonActivatedMenuMaterialUI title="Help">
                <MenuItem
                    onClick={() =>
                        this.openPageByURL("https://docs.mat3ra.com/materials-designer/overview/")
                    }
                >
                    <ListItemIcon>
                        <HelpIcon />
                    </ListItemIcon>
                    Documentation
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        this.openPageByURL("https://docs.mat3ra.com/tutorials/materials/overview/")
                    }
                >
                    <ListItemIcon>
                        <AssignmentIcon />
                    </ListItemIcon>
                    Tutorials
                </MenuItem>
            </ButtonActivatedMenuMaterialUI>
        );
    }

    renderSpinner() {
        const { mdState } = this.props;
        return (
            <Stack spacing={2} direction="row" justifyContent="end" sx={{ flex: 1 }}>
                {mdState.isLoading ? (
                    <Tooltip title="Working…">
                        <CircularProgress color="warning" size={30} />
                    </Tooltip>
                ) : (
                    <Tooltip title="All changes applied">
                        <CheckIcon color="success" size={50} />
                    </Tooltip>
                )}
            </Stack>
        );
    }

    renderImportModal = () => {
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

    renderSaveActionDialog = () => {
        const { openSaveActionDialog, mdState } = this.props;

        return openSaveActionDialog ? openSaveActionDialog(mdState) : null;
    };

    // TODO: disabled until this is re-wired to wave.js's in-viewer edit mode (see
    // import comment at the top of this file)
    // renderThreejsEditorModal() {
    //     const {
    //         onAdd,
    //         mdState: { materials, index },
    //     } = this.props;
    //     const { showThreejsEditorModal } = this.state;
    //     return (
    //         <ThreejsEditorModal
    //             show={showThreejsEditorModal}
    //             onHide={(material) => {
    //                 this.setState({ showThreejsEditorModal: !showThreejsEditorModal });
    //                 if (material) {
    //                     const newMaterial = MDMaterial.fromMadeMaterial(
    //                         material,
    //                         materials[index].metadata,
    //                     );
    //                     onAdd(newMaterial);
    //                 }
    //             }}
    //             materials={materials}
    //             modalId="threejs-editor"
    //         />
    //     );
    // }

    render() {
        const {
            showSupercellDialog,
            showSurfaceDialog,
            showBoundaryConditionsDialog,
            showCombinatorialDialog,
            showExportMaterialsDialog,
            showInterpolateDialog,
            showJupyterLiteTransformation,
            showCommandPalette,
        } = this.state;
        const {
            children,
            className,
            mdState: { materials, index },
            onAdd,
            onExport,
            onGenerateSupercell,
            onGenerateSurface,
            onSetBoundaryConditions,
            maxCombinatorialBasesCount,
            defaultMaterialsSet,
            onItemClick,
            onSectionVisibilityToggle,
            isVisibleItemsList,
            isVisibleSourceEditor,
            isVisibleThreeDEditorFullscreen,
        } = this.props;

        const material = materials[index];

        // TODO: renderThreejsEditorModal disabled, see comment at the top of this file
        // if (showThreejsEditorModal) return this.renderThreejsEditorModal();

        return (
            <>
                <Toolbar
                    variant="dense"
                    className={setClass(className, "materials-designer-header-menu")}
                >
                    {children}
                    {this.renderIOMenu()}
                    {this.renderEditMenu()}
                    {this.renderViewMenu()}
                    {this.renderAdvancedMenu()}
                    {this.renderHelpMenu()}
                    {this.renderSpinner()}
                </Toolbar>

                <QuickActionToolbar
                    actions={this.actions}
                    onOpenPalette={() => this.setState({ showCommandPalette: true })}
                    onSectionVisibilityToggle={onSectionVisibilityToggle}
                    visibilityByName={{
                        ItemsList: isVisibleItemsList,
                        SourceEditor: isVisibleSourceEditor,
                        ThreeDEditorFullscreen: isVisibleThreeDEditorFullscreen,
                    }}
                />

                <CommandPalette
                    open={showCommandPalette}
                    onClose={() => this.setState({ showCommandPalette: false })}
                    actions={this.actions}
                    materials={materials}
                    standataConfigs={defaultMaterialsSet}
                    onGoToMaterial={onItemClick}
                    onImportStandata={(config) => onAdd([new MDMaterial(config)])}
                />

                <SupercellDialog
                    isOpen={showSupercellDialog}
                    modalId="supercellModal"
                    backdropColor="dark"
                    onSubmit={onGenerateSupercell}
                    onHide={() => this.setState({ showSupercellDialog: false })}
                />

                <SurfaceDialog
                    isOpen={showSurfaceDialog}
                    modalId="surfaceModal"
                    backdropColor="dark"
                    onSubmit={onGenerateSurface}
                    onHide={() => this.setState({ showSurfaceDialog: false })}
                />

                <BoundaryConditionsDialog
                    isOpen={showBoundaryConditionsDialog}
                    modalId="BoundaryConditionsModal"
                    backdropColor="dark"
                    material={material}
                    onSubmit={onSetBoundaryConditions}
                    onHide={() => this.setState({ showBoundaryConditionsDialog: false })}
                />

                <ExportActionDialog
                    isOpen={showExportMaterialsDialog}
                    modalId="ExportActionsModal"
                    onHide={() => this.setState({ showExportMaterialsDialog: false })}
                    onSubmit={onExport}
                />

                {/* The Standata and upload dialogs are owned by MaterialsDesigner: the materials
                    list opens them too, from its "add material" menu. */}

                <CombinatorialBasisDialog
                    title="Generate Combinatorial Set"
                    modalId="combinatorialSetModal"
                    isOpen={showCombinatorialDialog}
                    maxCombinatorialBasesCount={maxCombinatorialBasesCount}
                    backdropColor="dark"
                    material={material}
                    onHide={() => this.setState({ showCombinatorialDialog: false })}
                    onSubmit={(...args) => {
                        onAdd(...args);
                        this.setState({ showCombinatorialDialog: false });
                    }}
                />

                <InterpolateBasesDialog
                    title="Generate Interpolated Set"
                    modalId="interpolatedSetModal"
                    isOpen={showInterpolateDialog}
                    backdropColor="dark"
                    material={material}
                    material2={materials[index + 1 === materials.length ? 0 : index + 1]}
                    onHide={() => this.setState({ showInterpolateDialog: false })}
                    onSubmit={(...args) => {
                        onAdd(...args);
                        this.setState({ showInterpolateDialog: false });
                    }}
                />

                <JupyterLiteTransformation
                    title="JupyterLite Transformation"
                    show={showJupyterLiteTransformation}
                    materials={materials}
                    onHide={() => this.setState({ showJupyterLiteTransformation: false })}
                    onMaterialsUpdate={(...args) => {
                        onAdd(...args);
                        this.setState({ showJupyterLiteTransformation: false });
                    }}
                />
            </>
        );
    }
}

HeaderMenuToolbar.propTypes = {
    mdState: PropTypes.shape({
        index: PropTypes.number,
        isLoading: PropTypes.bool,
        materials: PropTypes.arrayOf(PropTypes.object),
        updatedIndices: PropTypes.arrayOf(PropTypes.number),
    }).isRequired,

    className: PropTypes.string,

    maxCombinatorialBasesCount: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    defaultMaterialsSet: PropTypes.array.isRequired,

    onUpdate: PropTypes.func.isRequired,
    onUndo: PropTypes.func.isRequired,
    onRedo: PropTypes.func.isRequired,
    canUndo: PropTypes.bool,
    canRedo: PropTypes.bool,
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
    /** Opens a dialog owned by MaterialsDesigner: "standata" or "upload". */
    onOpenDialog: PropTypes.func.isRequired,
    /** Selects a material by index, used by the command palette's "go to" entries. */
    onItemClick: PropTypes.func.isRequired,
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
    maxCombinatorialBasesCount: 10,
    openSaveActionDialog: null,
    children: null,
    onExit: undefined,
    openImportModal: undefined,
    closeImportModal: undefined,
    // Undefined reads as "available": embedders that do not track history keep working controls.
    canUndo: true,
    canRedo: true,
};

export default HeaderMenuToolbar;
