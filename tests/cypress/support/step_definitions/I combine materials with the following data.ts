import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import { CombineOffset } from "../widgets/CombineMaterialsDialogWidget";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface CombineRow extends CombineOffset {
    /** 1-based index in the materials list, matching the other material steps. */
    index: number;
}

Given("I open the combine materials dialog", () => {
    new MaterialDesignerPage().designerWidget.openCombineMaterialsDialog();
});

Given("I add the following materials to the combination:", (table: DataTable) => {
    const { combineMaterialsDialog } = new MaterialDesignerPage().designerWidget;
    parseTable<CombineRow>(table).forEach(({ index, x, y, z }) => {
        combineMaterialsDialog.addGuest(index, { x, y, z });
    });
});

Given("I name the combined material {string}", (name: string) => {
    new MaterialDesignerPage().designerWidget.combineMaterialsDialog.setName(name);
});

Given("I submit the combine materials dialog", () => {
    const page = new MaterialDesignerPage();
    page.designerWidget.combineMaterialsDialog.submit();
    page.designerWidget.waitForLoaderToDisappear();
});
