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

When("I run the {string} command", (id: string) => {
    new MaterialDesignerPage().designerWidget.commands.run(id);
});

/**
 * Element identity, stamped and checked.
 *
 * A kernel lives in the frame; React re-creating that element would silently discard it. Asserting
 * the frame is still *present* would pass either way, so the stamp is the only thing that actually
 * distinguishes "kept" from "rebuilt and reloaded".
 *
 * Whichever bridged frame is mounted — only one ever is — so the same two phrases cover the
 * notebook and the REPL.
 */
const BRIDGED_FRAME = "iframe#jupyter-lite-iframe, iframe#python-repl-iframe";

When("I mark the console frame", () => {
    cy.get(BRIDGED_FRAME).then(($frame) => {
        ($frame[0] as unknown as Record<string, unknown>).__mdKernelMark = "kept";
    });
});

Then("I see the console frame is the same element", () => {
    cy.get(BRIDGED_FRAME).should(($frame) => {
        expect(($frame[0] as unknown as Record<string, unknown>).__mdKernelMark).to.equal("kept");
    });
});

/**
 * A code result is not a fork. Notebook and REPL output used to land under the first input as a
 * child row; which materials went in is provenance the chip already prints, not lineage.
 */
Then("I see material {string} at the top level of the list", (name: string) => {
    cy.get('[data-testid="material-row"]')
        .contains(".md2-tname", name)
        .closest(".md2-trow")
        .should("have.attr", "data-depth", "0");
});

/** Both code surfaces stage what they produce behind the same button. */
When("I add what the console produced to the session", () => {
    cy.get('[data-testid="console-add-to-session"]').should("not.be.disabled").click();
});
