import { forApp, isV2 } from "../app";
import Widget from "./Widget";

const selectors = {
    wrapper: forApp("#BoundaryConditionsModal", "#panel-boundary-conditions"),
    submitButton: forApp("#BoundaryConditionsModal-submit-button", '[data-testid="panel-apply"]'),
    type: forApp('.MuiFormControl-root[data-tid="type"]', 'select[data-tid="type"]'),
    offset: forApp('[data-tid="offset"] input', '[data-tid="offset"]'),
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

        if (isV2()) {
            // A native select, so the choice is made on the element rather than by clicking a
            // menu item that MUI renders in a portal somewhere else on the page.
            cy.get(selectorType).select(type);
        } else {
            this.browser.click(selectorType);
            const menuItemSelector = `li[data-value="${type}"]`;
            this.browser.waitForVisible(menuItemSelector);
            this.browser.click(menuItemSelector);
        }

        this.browser.waitForVisible(this.selectors.offset);
        this.browser.setInputValue(this.selectors.offset, offset);
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}
