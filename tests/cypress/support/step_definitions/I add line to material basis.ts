import { Given } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Given("I add line {string} to material basis", (line: string) => {
    new MaterialDesignerPage().designerWidget.sourceEditor.basisEditor.addBasisLine(line);
});
