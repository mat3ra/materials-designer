import { DataTable, Then, When } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

/**
 * Steps that stand in for the JupyterLite frame.
 *
 * The 53 generated health-checks drive the real deployment, which means they need the network and
 * a warm kernel and so run weekly. Everything on the designer's side of the bridge — the frozen
 * selectors, the staging list, the sync-back rules — can be exercised without any of that, by
 * speaking the bridge protocol at the app the way the frame would. That is what these do, so a
 * regression in the notebook surface fails a pull request rather than a weekly run.
 */
const IFRAME = "iframe#jupyter-lite-iframe";
const IN_SELECTOR = "[data-tid='materials-in-selector']";
const OUT_SELECTOR = "[data-tid='materials-out-selector']";

Then("the notebook frame is loaded from {string}", (path: string) => {
    cy.get(IFRAME).should("have.attr", "src").and("include", `path=${path}`);
});

Then("I see {int} material(s) selected in MaterialsSelector", (count: number) => {
    cy.get(`${IN_SELECTOR} .MuiChip-root`).should("have.length", count);
});

Then("I see {int} material(s) staged in the output selector", (count: number) => {
    cy.get(`${OUT_SELECTOR} .MuiChip-root`).should("have.length", count);
});

When("the notebook produces materials", (table: DataTable) => {
    const names = parseTable<{ name: string }>(table).map((row) => row.name);

    // The structures are real ones taken from the session, so what comes back is something the
    // designer can actually build; only the names are the notebook's.
    BrowserManager.getBrowser().execute((win: any) => {
        const base = win.MDState.materials[0].toJSON();
        win.dispatchEvent(
            new win.MessageEvent("message", {
                origin: "https://jupyterlite.mat3ra.com",
                data: {
                    type: "from-iframe-to-host",
                    action: "set-data",
                    payload: { materials: names.map((name: string) => ({ ...base, name })) },
                },
            }),
        );
    });
});
