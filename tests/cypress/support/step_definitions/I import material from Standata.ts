import { When } from "@badeball/cypress-cucumber-preprocessor";

import { isV2 } from "../app";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I import material {string} from Standata", (name: string) => {
    const { standataDialog } = new MaterialDesignerPage().designerWidget;
    if (isV2()) {
        standataDialog.pickFromLibrary(name);
        return;
    }
    standataDialog.openMaterialsDropdown();
    standataDialog.selectMaterial(name);
    standataDialog.submit();
});
