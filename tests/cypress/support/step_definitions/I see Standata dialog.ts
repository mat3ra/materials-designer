import { Then } from "@badeball/cypress-cucumber-preprocessor";

import { isV2 } from "../app";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Then("I see Standata dialog", () => {
    // 2.0 configures in a panel beside the viewport rather than a modal over it — previewing a
    // choice is impossible while a dialog covers the thing being previewed. The phrase stays as
    // other repositories know it; only what it looks for changes.
    if (isV2()) {
        new MaterialDesignerPage().designerWidget.browser.waitForVisible(
            '[data-testid="panel-standard-library"]',
        );
        return;
    }
    new MaterialDesignerPage().designerWidget.standataDialog.verifyStandataDialog();
});
