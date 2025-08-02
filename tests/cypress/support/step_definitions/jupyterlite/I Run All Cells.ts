import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I Run All Cells", () => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;
    jupyterLiteSession.waitForKernelIdleWithRestart();
    jupyterLiteSession.clickMenu("Run", "Run All Cells");

    jupyterLiteSession.waitForKernelBusy();
});
