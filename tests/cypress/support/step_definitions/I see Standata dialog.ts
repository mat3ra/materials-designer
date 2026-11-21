import { Then } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Then("I see Standata dialog", () => {
    // "Dialog" is the phrase other repositories know this by, and the phrase is frozen. What it
    // looks for is a panel beside the viewport: previewing a choice is impossible while a modal
    // covers the thing being previewed.
    new MaterialDesignerPage().designerWidget.browser.waitForVisible(
        '[data-testid="panel-standard-library"]',
    );
});
