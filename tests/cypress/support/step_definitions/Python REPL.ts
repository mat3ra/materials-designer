import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

When("I open the Python REPL", () => {
    cy.contains("button", "View").click();
    cy.contains('li[role="menuitem"]', "Python REPL").click();
});

Then("the Python REPL becomes ready", () => {
    cy.get("#python-repl", { timeout: 180_000 }).contains("Ready", { timeout: 180_000 });
});

When("I run the Python REPL code", () => {
    cy.get("#python-repl-run").should("be.enabled").click();
});

const expectSingleScopedMaterial = () => {
    cy.get("#python-repl", { timeout: 180_000 }).contains("Ready", { timeout: 180_000 });
    cy.window({ timeout: 180_000 }).should((window) => {
        // @ts-ignore Materials Designer exposes its state for Cypress assertions.
        const { materials } = window.MDState;
        expect(materials).to.have.length(2);
        expect(materials[1].syncScope).to.equal("python-repl");
    });
};

Then("the Python REPL adds a scoped material", expectSingleScopedMaterial);
Then("the Python REPL replaces its scoped material", expectSingleScopedMaterial);

Then("the derived material does not inherit the source material id", () => {
    cy.window().should((window) => {
        // @ts-ignore Materials Designer exposes its state for Cypress assertions.
        const [source, derived] = window.MDState.materials;
        // A derived material carrying its source's id would overwrite that source on the next
        // sync instead of appearing alongside it.
        expect(derived._id, "derived material id").to.not.equal(source._id);
    });
});

Then("the selected material survives the sync", () => {
    cy.window().should((window) => {
        // @ts-ignore Materials Designer exposes its state for Cypress assertions.
        const { materials, index } = window.MDState;
        // Replacing the scope must not move the user's selection out from under them.
        expect(materials[index].syncScope, "selected material scope").to.equal("python-repl");
    });
});
