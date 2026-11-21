import { Given } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";

/**
 * The "updated" flag lives in `MDState.updatedIndices` and drives the marker on the list row.
 * Asserting on the state rather than the styling keeps the check about behaviour, not appearance.
 */
function getUpdatedIndices() {
    return BrowserManager.getBrowser().execute((win) => {
        return win.MDState.updatedIndices;
    });
}

Given("material with index {string} is marked as updated", (index: string) => {
    getUpdatedIndices().should("include", parseInt(index, 10) - 1);
});

Given("material with index {string} is not marked as updated", (index: string) => {
    getUpdatedIndices().should("not.include", parseInt(index, 10) - 1);
});
