import { forApp } from "../app";
import Widget from "./Widget";

/**
 * v1 configured a supercell in a modal; 2.0 does it in a panel beside the viewport, so you can
 * watch the cell grow while you type. Both are addressed here: the widget's method names are the
 * contract other repositories depend on, and the selectors underneath them are not.
 */
const selectors = {
    wrapper: forApp("#supercellModal", "#panel-supercell"),
    submitButton: forApp("#supercellModal-submit-button", '[data-testid="panel-apply"]'),
    matrixElementByIndices: (i: number, j: number) =>
        forApp(`div.m${i + 1}${j + 1} input`, `[data-tid="m${i + 1}${j + 1}"]`),
};

export class SupercellDialogWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    /**
     * @param supercellMatrixAsString {String} Scaling matrix in the following format: '1 0 0, 0 1 0, 0 0 1'
     */
    generateSupercell(supercellMatrixAsString: string) {
        const scalingMatrix = supercellMatrixAsString
            .split(",")
            .map((row) => row.trim().split(" ").map(parseFloat));
        scalingMatrix.forEach((scalingVector, i) => {
            scalingVector.forEach((scalingNumber, j) => {
                this.browser.setInputValue(
                    this.selectors.matrixElementByIndices(i, j),
                    scalingNumber,
                );
            });
        });
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}
