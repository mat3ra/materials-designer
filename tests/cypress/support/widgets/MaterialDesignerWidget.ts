import BoundaryConditionsDialogWidget, {
    BoundaryConditions,
} from "./BoundaryConditionsDialogWidget";
import DefaultImportModalDialogWidget from "./DefaultImportModalDialogWidget";
import HeaderMenuWidget from "./HeaderMenuWidget";
import { InterpolatedSetDialogWidget } from "./InterpolatedSetDialogWidget";
import { isV2 } from "../app";
import { CommandsWidget } from "./CommandsWidget";
import { ItemsListWidget } from "./ItemsListWidget";
import JupyterLiteSession from "./JupyterLiteSession";
import JupyterLiteTransformationDialogWidget from "./JupyterLiteTransformationDialogWidget";
import { SourceEditorWidget } from "./SourceEditorWidget";
import StandataDialogWidget from "./StandataDialogWidget";
import { SupercellDialogWidget } from "./SupercellDialogWidget";
import SurfaceDialogWidget, { SurfaceConfig } from "./SurfaceDialogWidget";
import { ThreeJSEditorWidget } from "./ThreeJSEditorWidget";
import Widget from "./Widget";

export default class MaterialDesignerWidget extends Widget {
    headerMenu: HeaderMenuWidget;

    surfaceDialog: SurfaceDialogWidget;

    itemsList: ItemsListWidget;

    /** Runs actions by their stable command id (MD 2.0). */
    commands: CommandsWidget;

    sourceEditor: SourceEditorWidget;

    threeJSEditorWidget: ThreeJSEditorWidget;

    supercellDialog: SupercellDialogWidget;

    boundaryConditionsDialog: BoundaryConditionsDialogWidget;

    interpolatedSetDialog: InterpolatedSetDialogWidget;

    defaultImportModalDialog: DefaultImportModalDialogWidget;

    jupyterLiteTransformationDialog: JupyterLiteTransformationDialogWidget;

    jupyterLiteSession: JupyterLiteSession;

    standataDialog: StandataDialogWidget;

    constructor(selector: string) {
        super(selector);
        this.itemsList = new ItemsListWidget();
        this.commands = new CommandsWidget();
        this.headerMenu = new HeaderMenuWidget();
        this.sourceEditor = new SourceEditorWidget();
        this.surfaceDialog = new SurfaceDialogWidget();
        this.threeJSEditorWidget = new ThreeJSEditorWidget();
        this.supercellDialog = new SupercellDialogWidget();
        this.boundaryConditionsDialog = new BoundaryConditionsDialogWidget();
        this.interpolatedSetDialog = new InterpolatedSetDialogWidget();
        this.defaultImportModalDialog = new DefaultImportModalDialogWidget();
        this.jupyterLiteTransformationDialog = new JupyterLiteTransformationDialogWidget();
        this.jupyterLiteSession = new JupyterLiteSession();
        this.standataDialog = new StandataDialogWidget();
    }

    openSurfaceDialog() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Advanced", 4);
    }

    openSaveDialog() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Input/Output", 5);
    }

    createSurface(config: SurfaceConfig) {
        this.openSurfaceDialog();
        this.surfaceDialog.generateSurface(config);
        this.surfaceDialog.submit();
    }

    cloneCurrentMaterial() {
        // v1 reaches Clone as the fourth item of the Edit menu. 2.0 has no menu bar, so the
        // command is addressed by its id — the same action, found by name instead of by position.
        if (isV2()) {
            this.commands.run("material.clone");
            return;
        }
        this.headerMenu.selectMenuItemByNameAndItemNumber("Edit", 4);
    }

    openSupercellDialog() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Advanced", 1);
    }

    openUploadDialog() {
        // v1 reaches Upload from Disk as the third item of Input/Output; 2.0 opens the same
        // review from the Create group of the command registry.
        if (isV2()) {
            this.commands.run("create.from-file");
            return;
        }
        this.headerMenu.selectMenuItemByNameAndItemNumber("Input/Output", 3);
    }

    openJupyterLiteTransformation() {
        // v1 reaches JupyterLite as the sixth item of the Advanced menu. In 2.0 it is a console
        // tab, addressed by the command id it renders — the same surface, found by name rather
        // than by counting menu entries.
        if (isV2()) {
            this.commands.run("console.notebook");
            return;
        }
        this.headerMenu.selectMenuItemByNameAndItemNumber("Advanced", 6);
    }

    exit() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Input/Output", 6);
    }

    generateSupercell(supercellMatrixAsString: string) {
        this.openSupercellDialog();
        this.supercellDialog.generateSupercell(supercellMatrixAsString);
        this.supercellDialog.submit();
    }

    /*
     * @summary Sets material parameters in UI
     * @params config.name {String} Material name
     * @params config.basis {String} Basis as string (text)
     * @params config.lattice {String} Lattice as JSON string
     * @params config.supercell {String} Supercell configuration as an array string
     */
    _setMaterialParametersFromConfig(materialCSSIndex, { name, basis, lattice, supercell }) {
        this.itemsList.selectItemByIndex(materialCSSIndex);
        if (name) this.itemsList.setItemName(materialCSSIndex, name);
        if (lattice) this.sourceEditor.latticeEditor.setLattice(JSON.parse(lattice));
        if (basis) this.sourceEditor.basisEditor.setBasis(basis);
        if (supercell) this.generateSupercell(supercell);
    }

    createMultipleMaterials(configs) {
        // eslint-disable-next-line no-unused-vars
        configs.forEach(() => this.cloneCurrentMaterial());
        this.itemsList.deleteMaterialByIndex(1);

        configs.forEach((config, index) => {
            const itemCSSIndex = index + 1;
            this._setMaterialParametersFromConfig(itemCSSIndex, config);
        });
    }

    openBoundaryConditionsDialog() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Advanced", 5);
    }

    addBoundaryConditions(config: BoundaryConditions) {
        this.openBoundaryConditionsDialog();
        this.boundaryConditionsDialog.addBoundaryConditions(config);
        this.boundaryConditionsDialog.submit();
    }

    openInterpolateSetDialog() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Advanced", 3);
    }

    generateInterpolatedSet(nImages: number) {
        this.openInterpolateSetDialog();
        this.interpolatedSetDialog.setInterpolatedSetImagesCount(nImages);
        this.interpolatedSetDialog.submit();
    }

    clickUndoRedoReset(index = 1) {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Edit", index);
    }

    toggleIsNonPeriodic() {
        this.headerMenu.selectMenuItemByNameAndItemNumber("Edit", 6);
    }

    clickDeleteAction(index: number) {
        this.itemsList.deleteMaterialByIndex(index);
    }
}
