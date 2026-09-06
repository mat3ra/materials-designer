import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

import TimelineWidget from "../../widgets/TimelineWidget";

/**
 * Steps for the Timeline — the material's derivation as re-editable chips.
 *
 * Steps are addressed by position because that is what a step is: a place in a history. Unlike a
 * menu ordinal, the position is the thing being asserted about, not an accident of layout.
 */
const timeline = () => new TimelineWidget();

Then("I see the timeline has {int} step(s)", (count: number) => {
    timeline().steps().should("have.length", count);
});

Then("I see timeline step {int} reports {string}", (index: number, text: string) => {
    timeline()
        .stepText(index)
        .should((actual: string) => {
            expect(actual.replace(/\s+/g, " ")).to.contain(text);
        });
});

Then("I see no steps are marked stale", () => {
    timeline()
        .staleCount()
        .should((count: number) => {
            expect(count).to.equal(0);
        });
});

When("I edit timeline step {int}", (index: number) => {
    timeline().editStep(index);
});
