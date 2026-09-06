import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

/**
 * Session-level steps: what the app is showing, and what survives a reload.
 *
 * Autosave has no v1 counterpart — v1 lost the session on refresh — so these run only against 2.0.
 */
Then("I see the active material has {int} atoms", (count: number) => {
    cy.get('[data-testid="atom-count"]').should("have.text", `${count} atoms`);
});

Then("I see {int} materials in the list", (count: number) => {
    cy.get('[data-testid="material-row"]').should("have.length", count);
});

/** Where the autosaved session lives; `core/persist.ts` owns the key. */
const STORAGE_KEY = "md2.session.v1";

/**
 * Autosave is debounced, so a reload can outrun it — and the save chip cannot be the gate, because
 * it says "Saved · just now" for the save *before* the change as readily as the one after. Reading
 * what was actually written is both the reliable wait and the assertion the scenario is about.
 */
Then("I see the saved session has {int} step(s)", (count: number) => {
    cy.window().should((win) => {
        const raw = win.localStorage.getItem(STORAGE_KEY);
        expect(raw, "an autosaved session").to.be.a("string");
        const stored = JSON.parse(raw as string);
        expect(stored.materials[0].log).to.have.length(count);
    });
});

When("I reload the page", () => {
    cy.reload();
    cy.get('[data-testid="status-bar"]').should("be.visible");
});

Then("I see the restore notice", () => {
    cy.get('[data-testid="restore-notice"]').should("be.visible");
});

/**
 * Restoring silently would be worse than not restoring: the notice is the point, so keeping the
 * session is an explicit answer to it rather than something that happens by default.
 */
When("I keep the restored session", () => {
    cy.get('[data-testid="restore-notice"]').contains("button", "Keep it").click();
});

When("I start a fresh session", () => {
    cy.get('[data-testid="restore-notice"]').contains("button", "Start fresh").click();
});

/**
 * A set folder is one row standing for a batch. Counting folders rather than members is the
 * assertion that matters: the promise is that a hundred generated materials do not become a
 * hundred rows.
 */
Then("I see {int} set folder(s)", (count: number) => {
    if (count === 0) {
        cy.get('[data-testid="set-folder"]').should("not.exist");
        return;
    }
    cy.get('[data-testid="set-folder"]').should("have.length", count);
});

Then("I see the set folder holds {int} materials", (count: number) => {
    cy.get('[data-testid="set-folder"]').first().should("contain.text", String(count));
});
