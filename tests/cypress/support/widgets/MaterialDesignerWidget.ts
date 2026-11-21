import BoundaryConditionsDialogWidget, {
    BoundaryConditions,
} from "./BoundaryConditionsDialogWidget";
import DefaultImportModalDialogWidget from "./DefaultImportModalDialogWidget";
import HeaderMenuWidget from "./HeaderMenuWidget";
import { InterpolatedSetDialogWidget } from "./InterpolatedSetDialogWidget";
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
        this.commands.run("op.surface");
    }

    openSaveDialog() {
        this.commands.run("file.save");
    }

    createSurface(config: SurfaceConfig) {
        this.openSurfaceDialog();
        this.surfaceDialog.generateSurface(config);
        this.surfaceDialog.submit();
    }

    cloneCurrentMaterial() {
        this.commands.run("material.clone");
    }

    openSupercellDialog() {
        this.commands.run("op.supercell");
    }

    openUploadDialog() {
        // The import review, opened from the Create group of the command registry.
        this.commands.run("create.from-file");
    }

    openJupyterLiteTransformation() {
        // JupyterLite is a Console tab, addressed by the command that opens it.
        this.commands.run("console.notebook");
    }

    exit() {
        this.commands.run("file.exit");
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
        this.commands.run("op.boundary-conditions");
    }

    addBoundaryConditions(config: BoundaryConditions) {
        this.openBoundaryConditionsDialog();
        this.boundaryConditionsDialog.addBoundaryConditions(config);
        this.boundaryConditionsDialog.submit();
    }

    openInterpolateSetDialog() {
        this.commands.run("op.interpolated-set");
    }

    generateInterpolatedSet(nImages: number) {
        this.openInterpolateSetDialog();
        this.interpolatedSetDialog.setInterpolatedSetImagesCount(nImages);
        this.interpolatedSetDialog.submit();
    }

    /**
     * The phrase other repositories use is positional — v1's Edit menu was 1 undo, 2 redo,
     * 3 reset — and the phrase is frozen, so the position is translated to a name here. That
     * translation is the whole reason this method exists.
     */
    clickUndoRedoReset(index = 1) {
        this.commands.run(["edit.undo", "edit.redo", "edit.reset"][index - 1]);
    }

    toggleIsNonPeriodic() {
        this.commands.run("structure.toggle-periodicity");
    }

    clickDeleteAction(index: number) {
        this.itemsList.deleteMaterialByIndex(index);
    }
}
