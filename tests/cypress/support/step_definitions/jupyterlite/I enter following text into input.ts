import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../../widgets/MaterialDesignerPage";

interface TextInput {
    text: string;
}

When("I enter following text into input", (table: DataTable) => {
    const [{ text }] = parseTable<TextInput>(table);
    new MaterialDesignerPage().designerWidget.jupyterLiteSession.enterTextIntoInput(text);
});
