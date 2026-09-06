import { When } from "@badeball/cypress-cucumber-preprocessor";

import { isV2 } from "../app";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I open Standata dialog", () => {
    const { designerWidget } = new MaterialDesignerPage();
    if (isV2()) {
        designerWidget.commands.run("create.standard-library");
        return;
    }
    designerWidget.headerMenu.selectMenuItemByNameAndItemNumber("Input/Output", 2);
});
