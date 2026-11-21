import Widget from "./Widget";

const selectors = {
    wrapper: '[data-testid="panel-standard-library"]',
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
        // The unwrapped constant: wrapping the wrapper in itself matches nothing.
        this.browser.waitForVisible(selectors.wrapper);
    }

    /*
     * The three below are v1's dropdown-then-submit flow. Their names are part of the published
     * widget API — web-app subclasses this — so they stay, but there is nothing left for them to
     * click: the library is a searchable list where filtering and clicking *is* the import. They
     * say so rather than timing out on a selector that no longer exists.
     */
    openMaterialsDropdown(): never {
        throw new Error("The standard library is a searchable list — use pickFromLibrary(name).");
    }

    selectMaterial(): never {
        throw new Error("The standard library is a searchable list — use pickFromLibrary(name).");
    }

    submit(): never {
        throw new Error("Picking an entry imports it — pickFromLibrary(name) needs no submit.");
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
