import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface AtomValue {
    index: string;
    field: string;
    value: string;
}

Given("I set atom values in the crystal basis with the following data:", (table: DataTable) => {
    const { basisEditor } = new MaterialDesignerPage().designerWidget.sourceEditor;
    parseTable<AtomValue>(table).forEach(({ index, field, value }) => {
        basisEditor.setAtomValue(parseInt(index, 10), field, value);
    });
});
