import { Given } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Given("I clone material at index {string}", (index: string) => {
    const { itemsList, commands } = new MaterialDesignerPage().designerWidget;
    itemsList.selectItemByIndex(parseInt(index, 10));
    // Addressed by command id. v1 reached Clone as the fourth item of the Edit menu; that ordinal
    // coupling is what retiring the menu bar broke, and what a command id cannot break again.
    commands.run("material.clone");
});
