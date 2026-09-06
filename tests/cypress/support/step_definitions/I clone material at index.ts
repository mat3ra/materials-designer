import { Given } from "@badeball/cypress-cucumber-preprocessor";

import { isV2 } from "../app";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

Given("I clone material at index {string}", (index: string) => {
    const { itemsList, headerMenu, commands } = new MaterialDesignerPage().designerWidget;
    itemsList.selectItemByIndex(parseInt(index, 10));
    // v1 reaches Clone as the fourth item of the Edit menu — the ordinal coupling that retiring
    // the menu bar breaks. 2.0 addresses the command by its id instead.
    if (isV2()) commands.run("material.clone");
    else headerMenu.selectMenuItemByNameAndItemNumber("Edit", 4);
});
