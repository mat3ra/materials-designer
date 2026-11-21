import { Given } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";

/** Cypress key syntax: "ctrl+shift+z" becomes "{ctrl}{shift}z". */
function toCypressKeys(combination: string) {
    const parts = combination.split("+");
    const key = parts.pop();
    return `${parts.map((modifier) => `{${modifier}}`).join("")}${key}`;
}

Given("I press {string} outside any text field", (combination: string) => {
    // The shortcut handler listens on window; the body is the plainest non-typing target there is.
    BrowserManager.getBrowser().get("body").type(toCypressKeys(combination));
});

Given("I press {string} inside the materials filter", (combination: string) => {
    BrowserManager.getBrowser()
        .get(".materials-filter input")
        .type(toCypressKeys(combination));
});
