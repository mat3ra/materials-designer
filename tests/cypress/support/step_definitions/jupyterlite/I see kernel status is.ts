import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

When("I see kernel status is Idle", () => {
    const { jupyterLiteSession } = new MaterialDesignerPage().designerWidget;

    jupyterLiteSession.waitForKernelIdle();

    jupyterLiteSession.checkForErrorsAndScrollToFirst();
});
