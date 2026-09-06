import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I open JupyterLite Transformation dialog", () => {
    new MaterialDesignerPage().designerWidget.openJupyterLiteTransformation();
});
