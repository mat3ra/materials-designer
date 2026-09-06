import { isV2 } from "../app";
import Widget from "./Widget";

const selectors = {
    wrapper: isV2() ? '[data-testid="panel-standard-library"]' : "#standata-import-dialog",
    dialog: "div[role='dialog']",
    materialsSelector: "[data-tid='materials-selector']",
    materialsSelectorItem: (materialName: string) =>
        `li[data-tid='select-material']:contains("${materialName}")`,
    submitButton: "#standata-import-dialog-submit-button",
};

export default class StandataDialogWidget extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    verifyStandataDialog() {
        this.browser.waitForVisible(this.wrappedSelectors.dialog);
    }

    openMaterialsDropdown() {
        this.browser.click(this.wrappedSelectors.materialsSelector);
    }

    selectMaterial(materialName: string) {
        this.browser.click(selectors.materialsSelectorItem(materialName));
    }

    submit() {
        this.browser.click(selectors.submitButton);
    }

    /**
     * 2.0's standard library is a searchable list rather than a dropdown with a submit: filtering
     * to an entry and clicking it *is* the import. Kept as one method because that is what the
     * step now means, rather than three where two would be no-ops.
     */
    pickFromLibrary(materialName: string) {
        this.browser.setInputValue('[data-testid="standata-search"]', materialName, true);
        this.browser.click(`[data-testid="standata-row"]:contains("${materialName}")`);
    }
}
