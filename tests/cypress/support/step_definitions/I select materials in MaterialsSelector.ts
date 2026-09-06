import { DataTable, When } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface MaterialSelection {
    name: string;
    index: number;
}

When("I select materials in MaterialsSelector", (table: DataTable) => {
    const materials = parseTable<MaterialSelection>(table);
    const { jupyterLiteTransformationDialog } = new MaterialDesignerPage().designerWidget;

    // The surface opens with one material preselected. This step used to clear it by name,
    // assuming that was always "Silicon FCC" — true only while the default was the first material
    // in the list. Clearing whatever is there says what the step means and survives the default
    // becoming the material the user is actually looking at.
    jupyterLiteTransformationDialog.deselectAllMaterials();

    materials.forEach(({ name }) => {
        jupyterLiteTransformationDialog.selectMaterialByName(name);
    });
});
