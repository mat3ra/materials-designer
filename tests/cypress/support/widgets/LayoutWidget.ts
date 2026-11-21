import Widget from "./Widget";

/**
 * The shell's regions, and how much room each one is taking.
 *
 * MD 2.0 only. v1 had one fixed arrangement, so there is nothing here to be at parity with; these
 * specs exist because a reviewer found the arrangement cramped and the fix needs holding in place.
 */
const selectors = {
    wrapper: "#materials-designer",
    region: (name: string) => `[data-region="${name}"]`,
    collapseToggle: (name: string) => `[data-collapse="${name}"]`,
};

export class LayoutWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = selectors;
    }

    collapse(region: string) {
        this.browser.click(selectors.collapseToggle(region));
    }

    /**
     * Width in CSS pixels. The assertion that matters for "on small screens visibility" is a
     * number, not a class: a region can carry every right attribute and still be squeezing the
     * viewport to nothing.
     */
    width(region: string) {
        return cy.get(selectors.region(region)).then(($el) => $el[0].getBoundingClientRect().width);
    }

    isCollapsed(region: string) {
        return cy.get(selectors.region(region)).should("have.attr", "data-collapsed", "true");
    }

    isExpanded(region: string) {
        return cy.get(selectors.region(region)).should("have.attr", "data-collapsed", "false");
    }
}

export default LayoutWidget;
