import { Given } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Given("I select {string} view of the crystal basis", (view: string) => {
    new MaterialDesignerPage().designerWidget.sourceEditor.basisEditor.selectView(view);
});
