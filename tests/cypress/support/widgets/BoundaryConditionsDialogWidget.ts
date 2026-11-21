import Widget from "./Widget";

const selectors = {
    wrapper: "#panel-boundary-conditions",
    submitButton: '[data-testid="panel-apply"]',
    type: 'select[data-tid="type"]',
    offset: '[data-tid="offset"]',
};

export interface BoundaryConditions {
    type: string;
    offset: number;
}

export default class BoundaryConditionsDialogWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    addBoundaryConditions({ type, offset }: BoundaryConditions) {
        const selectorType = this.selectors.type;
        this.browser.waitForVisible(selectorType);

        // A native select, so the choice is made on the element rather than by clicking a menu
        // item that MUI renders in a portal somewhere else on the page.
        cy.get(selectorType).select(type);

        this.browser.waitForVisible(this.selectors.offset);
        this.browser.setInputValue(this.selectors.offset, offset);
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}
