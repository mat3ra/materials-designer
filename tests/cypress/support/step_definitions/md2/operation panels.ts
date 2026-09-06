import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";
import OperationPanelWidget from "../../widgets/OperationPanelWidget";

/**
 * Steps for MD 2.0's modeless operation panels.
 *
 * They have no v1 counterpart — v1 configured operations in modals that covered the material being
 * configured — so the features using them are tagged `@parity_2_0` and run only against 2.0.
 */
const panel = (type: string) => new OperationPanelWidget(type);

When("I open the {string} operation panel", (type: string) => {
    new MaterialDesignerPage().designerWidget.commands.run(`op.${type}`);
    panel(type).waitForVisible();
});

When("I set the supercell matrix diagonal to {string}", (value: string) => {
    panel("supercell").setMatrixDiagonal(value);
});

When("I set {string} in the {string} operation panel to {string}", (field, type, value) => {
    panel(type).setField(field, value);
});

Then("I see the {string} operation panel forecasts {string}", (type: string, text: string) => {
    panel(type).browser.get(panel(type).selectors.forecast).should("contain.text", text);
});

/**
 * The Apply label carries how much history the change will re-run, which is the whole promise of
 * editing a past step: you are told the cost before you pay it.
 */
Then(
    "I see the apply button in the {string} operation panel says {string}",
    (type: string, text: string) => {
        panel(type).browser.get(panel(type).selectors.apply).should("contain.text", text);
    },
);

When("I apply the {string} operation panel", (type: string) => {
    panel(type).apply();
});

When("I cancel the {string} operation panel", (type: string) => {
    panel(type).cancel();
});

// "operation panel", not "panel": the region toggles own the shorter phrase, and two definitions
// matching one sentence is an error at run time rather than a merge conflict.
Then("I do not see the {string} operation panel", (type: string) => {
    cy.get(`#panel-${type}`).should("not.exist");
});
