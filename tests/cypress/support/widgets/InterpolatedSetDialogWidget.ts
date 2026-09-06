import { forApp } from "../app";
import Widget from "./Widget";

const selectors = {
    wrapper: forApp("#interpolatedSetModal", "#panel-interpolated-set"),
    submitButton: forApp("#interpolatedSetModal-submit-button", '[data-testid="panel-apply"]'),
    intermediateImagesInput: forApp("input[type='number']", "#neb-count"),
};

export class InterpolatedSetDialogWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    setInterpolatedSetImagesCount(nImages: number) {
        this.browser.setInputValue(this.selectors.intermediateImagesInput, nImages);
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}
