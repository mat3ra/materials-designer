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

// Budgets the REPL must stay inside. The environment install is a one-off cost paid behind a progress
// bar; the first run must not pay for imports the install should already have done.
const INSTALL_BUDGET_MS = Number(Cypress.env("REPL_INSTALL_BUDGET_MS") ?? 20_000);
const FIRST_RUN_BUDGET_MS = Number(Cypress.env("REPL_FIRST_RUN_BUDGET_MS") ?? 2_000);

Then("the Python REPL becomes ready within the install budget", () => {
    const startedAt = Date.now();
    // Record when each progress line first appears, so a failure names the phase that blew the budget.
    const timeline: string[] = [];
    const seen = new Set<string>();
    let elapsed = 0;
    const poll = setInterval(() => {
        (Cypress.$("#python-repl-output").text() || "").split("\n").forEach((line) => {
            const text = line.trim();
            if (text && !seen.has(text)) {
                seen.add(text);
                timeline.push(`${String(Date.now() - startedAt).padStart(6)}ms  ${text}`);
            }
        });
    }, 200);

    cy.get("#python-repl", { timeout: INSTALL_BUDGET_MS * 3 })
        .contains("Ready", { timeout: INSTALL_BUDGET_MS * 3 })
        .then(() => {
            elapsed = Date.now() - startedAt;
            clearInterval(poll);
        });
    // Its own command, so the timeline survives the assertion failing below.
    cy.then(() => {
        cy.writeFile(
            "cypress/repl-timeline.txt",
            `${timeline.join("\n")}\n${String(elapsed).padStart(6)}ms  READY\n`,
        );
    });
    cy.then(() => {
        expect(elapsed, `environment install took ${elapsed}ms`).to.be.lessThan(INSTALL_BUDGET_MS);
    });
});

Then("the first run completes immediately", () => {
    const startedAt = Date.now();
    cy.get("#python-repl", { timeout: FIRST_RUN_BUDGET_MS * 30 })
        .contains("Ready", { timeout: FIRST_RUN_BUDGET_MS * 30 })
        .then(() => {
            const elapsed = Date.now() - startedAt;
            cy.log(`first run: ${elapsed}ms (budget ${FIRST_RUN_BUDGET_MS}ms)`);
            expect(
                elapsed,
                `first run took ${elapsed}ms — imports leaked out of install`,
            ).to.be.lessThan(FIRST_RUN_BUDGET_MS);
        });
});
