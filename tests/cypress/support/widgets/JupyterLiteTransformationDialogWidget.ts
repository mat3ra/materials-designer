import Widget from "./Widget";

const selectors = {
    wrapper: "#jupyterlite-transformation-dialog",
    dialog: "div[role='dialog']",
    materialsInSelector: "[data-tid='materials-in-selector']",
    materialsSelectorItem: (materialName: string) =>
        `[data-tid='select-material']:contains("${materialName}")`,
    selectedMaterialChip: (materialName: string) =>
        `.MuiChip-root:contains("${materialName}") .MuiChip-deleteIcon`,
    materialsOutSelector: "[data-tid='materials-out-selector']",
    materialsOutSelectorItem: (index: number) =>
        `[data-tid='materials-out-selector']:nth-of-type(${index})`,
    submitButton: "#jupyterlite-transformation-dialog-submit-button",
    autocompletePopper: ".MuiAutocomplete-popper",
    // Scoped to the input control: the output list renders chips of its own, and an unscoped
    // match would clear the notebook's results along with the selection.
    selectedMaterials: "[data-tid='materials-in-selector'] .MuiChip-root",
    firstSelectedMaterialDelete:
        "[data-tid='materials-in-selector'] .MuiChip-root:first .MuiChip-deleteIcon",
};

export default class JupyterLiteTransformationDialog extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    removeMaterial(materialName: string) {
        this.browser.click(selectors.selectedMaterialChip(materialName));
    }

    selectMaterialByName(materialName: string) {
        this.browser.click(this.wrappedSelectors.materialsInSelector);
        this.browser.waitForVisible(selectors.autocompletePopper, "xl");
        this.browser.click(selectors.materialsSelectorItem(materialName));
    }

    verifyMaterialsOut(index: number) {
        this.browser.click(this.wrappedSelectors.materialsOutSelector);
        this.browser.waitForVisible(selectors.materialsOutSelectorItem(index), "xl");
    }

    submit() {
        this.browser.click(this.wrappedSelectors.submitButton, { force: true });
    }

    /**
     * Deselects all materials in the JupyterLite materials selector.
     *
     * Always removes the first chip and re-queries, because the labels carry the chip's position
     * ("0: Silicon FCC"): collecting the names up front and deleting them one by one worked for a
     * single chip and silently missed the rest.
     */
    deselectAllMaterials() {
        // Bounded, so a chip that refuses to go fails the step instead of hanging the run.
        const removeNext = (remaining: number) => {
            if (remaining === 0) return;
            cy.get("body").then(($body) => {
                if (!$body.find(this.wrappedSelectors.selectedMaterials).length) return;
                this.browser.click(this.wrappedSelectors.firstSelectedMaterialDelete);
                removeNext(remaining - 1);
            });
        };
        removeNext(20);
    }
}
