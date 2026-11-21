import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

import LayoutWidget from "../../widgets/LayoutWidget";

const layout = () => new LayoutWidget();

When("I collapse the {string} region from its header", (region: string) => {
    layout().collapse(region);
});

When("I expand the {string} region from its rail", (region: string) => {
    layout().collapse(region);
});

Then("I see the {string} region is collapsed", (region: string) => {
    layout().isCollapsed(region);
});

Then("I see the {string} region is expanded", (region: string) => {
    layout().isExpanded(region);
});

/**
 * Width, not a class name. "On small screens visibility" is a question about pixels: a region can
 * carry every correct attribute and still leave the 3D view too narrow to work in.
 */
Then("I see the {string} region is at least {int}px wide", (region: string, min: number) => {
    layout()
        .width(region)
        .should((width: number) => {
            expect(width).to.be.at.least(min);
        });
});

Then("I see the {string} region is at most {int}px wide", (region: string, max: number) => {
    layout()
        .width(region)
        .should((width: number) => {
            expect(width).to.be.at.most(max);
        });
});

When("I size the window to {int} by {int}", (width: number, height: number) => {
    cy.viewport(width, height);
});
