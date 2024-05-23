import { When } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

When("I remove material with index {string} from material designer items list", (index: string) => {
    new MaterialDesignerPage().designerWidget.itemsList.deleteMaterialByIndex(parseInt(index, 10));
});
