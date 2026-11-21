import Widget from "./Widget";

/**
 * An operation panel, addressed by the operation it configures.
 *
 * v1 configured operations in modals with a bespoke id each; 2.0 uses one convention —
 * `#panel-<type>` with `panel-apply` / `panel-cancel` in the footer — so a panel is addressable
 * the day it exists rather than after someone adds a selector for it.
 */
const selectors = {
    apply: "[data-testid='panel-apply']",
    cancel: "[data-testid='panel-cancel']",
    forecast: ".md2-predict",
    matrixCell: (i: number, j: number) => `[data-tid="m${i}${j}"]`,
};

export class OperationPanelWidget extends Widget {
    selectors: typeof selectors;

    constructor(private type: string) {
        super(`#panel-${type}`);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return this.browser.waitForVisible(`#panel-${this.type}`);
    }

    forecast() {
        return this.browser.getElementText(this.selectors.forecast);
    }

    applyLabel() {
        return this.browser.getElementText(this.selectors.apply);
    }

    apply() {
        this.browser.click(this.selectors.apply);
    }

    cancel() {
        this.browser.click(this.selectors.cancel);
    }

    setMatrixDiagonal(value: string) {
        [1, 2, 3].forEach((n) =>
            this.browser.setInputValue(this.selectors.matrixCell(n, n), value, true),
        );
    }

    setField(tid: string, value: string) {
        this.browser.setInputValue(this.getWrappedSelector(`[data-tid="${tid}"]`), value, true);
    }
}

export default OperationPanelWidget;
