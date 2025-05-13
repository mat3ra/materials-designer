import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";
import { shallowDeepAlmostEqual } from "@mat3ra/tede/src/js/cypress/utils/index";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface Params {
    path: string;
    index: number;
}

Given("material with following data does not exist in state", (table: DataTable) => {
    const config = parseTable<Params>(table)[0];
    cy.readFile(`./cypress/fixtures/${config.path}`).then(() => {
        return BrowserManager.getBrowser()
            .execute((win) => {
                return win.MDState.materials.map((m) => m.toJSON());
            })
            .then((materials) => {
                shallowDeepAlmostEqual(undefined, materials[config.index - 1]);
            });
    });
});
