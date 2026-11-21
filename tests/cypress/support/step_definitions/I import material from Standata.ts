import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I import material {string} from Standata", (name: string) => {
    new MaterialDesignerPage().designerWidget.standataDialog.pickFromLibrary(name);
});
