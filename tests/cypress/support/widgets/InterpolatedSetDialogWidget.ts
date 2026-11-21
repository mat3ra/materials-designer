import Widget from "./Widget";

const selectors = {
    wrapper: "#panel-interpolated-set",
    submitButton: '[data-testid="panel-apply"]',
    intermediateImagesInput: "#neb-count",
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
