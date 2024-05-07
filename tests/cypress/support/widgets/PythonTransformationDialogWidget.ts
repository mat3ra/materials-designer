import Widget from "./Widget";

const selectors = {
    wrapper: "#python-transformation-dialog",
    dialog: 'div[role="dialog"]',
    materialsInSelector: "[data-tid='materials-in-selector']",
    materialsSelectorItem: (index: number) => `[data-tid='select-material']:nth-of-type(${index})`,
    transformationSelector: "[data-tid='transformation-selector']",
    transformationSelectorItem: (title: string) => `li:contains("${title}")`,
    codeInput: (id = 0) => `#python-code-input-${id}`,
    pythonOutput: (id = 0, omitHashtag = false) => `${omitHashtag ? "" : "#"}python-output-${id}`,
    clearOutputButton: (id = 0) => `#clear-output-${id}`,
    runButton: `#run-button-all`,
    submitButton: `#python-transformation-dialog-submit-button`,
    cancelButton: `#python-transformation-dialog-cancel-button`,
};

export default class PythonTransformationDialogWidget extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    selectMaterial(index: number) {
        this.browser.click(selectors.materialsInSelector);
        this.browser.click(selectors.materialsSelectorItem(index));
    }

    selectTransformationByTitle(title: string) {
        this.browser.click(this.wrappedSelectors.transformationSelector);
        this.browser.click(selectors.transformationSelectorItem(title));
    }

    setCode(code: string, id = 0) {
        this.browser.setInputValue(selectors.codeInput(id), code, true, {
            parseSpecialCharSequences: false,
        });
    }

    getCode(id = 0): Cypress.Chainable<string> {
        const elementSelector = selectors.pythonOutput(id, true);
        return cy
            .get(`#${elementSelector} .cm-content`, { timeout: this.browser.settings.timeouts.sm })
            .then(($contentElement) => {
                if ($contentElement.length > 0 && $contentElement[0].cmView) {
                    return $contentElement[0].cmView.view.state.doc.toString();
                }
                return "";
            });
    }

    clearOutput(id = 0) {
        this.browser.click(this.wrappedSelectors.clearOutputButton(id));
    }

    runCode(id = 0) {
        this.browser.click(this.wrappedSelectors.runButton);
        cy.get(this.wrappedSelectors.pythonOutput(id), {
            timeout: this.browser.settings.timeouts.sm,
        })
            .should("exist")
            .scrollIntoView();
    }

    cancel() {
        this.browser.click(this.wrappedSelectors.cancelButton);
        this.browser.waitForDisappear(this.wrappedSelectors.dialog);
    }

    submit() {
        this.browser.click(this.wrappedSelectors.submitButton);
        this.browser.waitForDisappear(this.wrappedSelectors.dialog);
    }
}
