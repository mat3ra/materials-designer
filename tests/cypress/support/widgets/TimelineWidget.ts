import Widget from "./Widget";

/**
 * The Timeline — MD 2.0's history, as re-editable operation chips.
 *
 * There is no v1 counterpart: v1 had two undo stacks and no visible history, which is the thing
 * 2.0 replaces. So this widget is 2.0-only, and the specs that use it are tagged accordingly.
 */
const selectors = {
    wrapper: "[data-region='timeline']",
    chip: "[data-testid='timeline-chip']",
    stale: "[data-testid='stale-chip']",
    editStep: "[data-testid='edit-step']",
};

export class TimelineWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    steps() {
        return this.browser.get(this.selectors.chip);
    }

    /** Chips are addressed by position because that is what a step *is* — a place in a history. */
    editStep(index: number) {
        this.browser
            .get(this.selectors.chip)
            .eq(index - 1)
            .find(selectors.editStep)
            .click({ force: true });
    }

    stepText(index: number) {
        return this.browser
            .get(this.selectors.chip)
            .eq(index - 1)
            .invoke("text");
    }

    staleCount() {
        return cy.get("body").then(($body) => $body.find(this.selectors.stale).length);
    }
}

export default TimelineWidget;
