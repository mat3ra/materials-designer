import { Given } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";

Given("I see error alert {string}", (text: string) => {
    BrowserManager.getBrowser().assertTextWithRetry(".alert-error", text);
});
