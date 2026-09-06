import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

/**
 * The Console dock's tabs, addressed by the command each renders.
 *
 * v1 had three disconnected code surfaces — a drawer, a modal and an unfinished REPL — so there is
 * no v1 phrase for "open the notebook"; the existing `I open JupyterLite Transformation dialog`
 * stays as the platform knows it and lands on the same tab.
 */
When("I open the {string} console tab", (tab: string) => {
    new MaterialDesignerPage().designerWidget.commands.run(`console.${tab}`);
});

Then("I see the console frame {string}", (id: string) => {
    cy.get(`iframe#${id}`).should("exist");
});

Then("I do not see the console frame {string}", (id: string) => {
    cy.get(`iframe#${id}`).should("not.exist");
});
