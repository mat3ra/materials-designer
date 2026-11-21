import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

interface BasisAndLatice {
    basis: string;
    lattice: string;
}

Given("I set material basis and lattice with the following data:", (table: DataTable) => {
    const { basis, lattice } = parseTable<BasisAndLatice>(table)[0];
    const { basisEditor, latticeEditor } = new MaterialDesignerPage().designerWidget.sourceEditor;

    // Either column on its own is useful: a scenario about the basis should not have to restate a
    // lattice it does not care about.
    if (basis) basisEditor.setBasis(basis);
    if (lattice) latticeEditor.setLattice(JSON.parse(lattice));
});
