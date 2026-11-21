import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I open Standata dialog", () => {
    new MaterialDesignerPage().designerWidget.commands.run("create.standard-library");
});
