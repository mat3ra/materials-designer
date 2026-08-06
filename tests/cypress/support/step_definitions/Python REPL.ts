import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When("I open the Python REPL", () => {
    cy.contains("button", "View").click();
    cy.contains('li[role="menuitem"]', "Python REPL").click();
});

Then("the Python REPL becomes ready", () => {
    cy.get("#python-repl", { timeout: 180_000 }).contains("Ready", { timeout: 180_000 });
});

Then("the REPL requirements show the AX made profile", () => {
    cy.get("#python-repl").contains('[role="tab"]', "Requirements").click();
    cy.get("#python-repl").contains("mat3ra-notebooks-utils");
    cy.get("#python-repl").contains("made");
    cy.get("#python-repl").contains('[role="tab"]', "Console").click();
});

When("I run the Python REPL code", () => {
    cy.get("#python-repl-run").should("be.enabled").click();
});

Then("the Python REPL adds a scoped material", () => {
    cy.get("#python-repl", { timeout: 180_000 }).contains("Ready", { timeout: 180_000 });
    cy.window({ timeout: 180_000 }).should((window) => {
        // @ts-ignore Materials Designer exposes its state for Cypress assertions.
        const { materials } = window.MDState;
        expect(materials).to.have.length(2);
        expect(materials[1].syncScope).to.equal("python-repl");
    });
});

Then("the Python REPL replaces its scoped material", () => {
    cy.get("#python-repl", { timeout: 180_000 }).contains("Ready", { timeout: 180_000 });
    cy.window({ timeout: 180_000 }).should((window) => {
        // @ts-ignore Materials Designer exposes its state for Cypress assertions.
        const { materials } = window.MDState;
        expect(materials).to.have.length(2);
        expect(materials[1].syncScope).to.equal("python-repl");
    });
});
