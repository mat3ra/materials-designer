import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { Made } from "@mat3ra/made";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";
import { shallowDeepAlmostEqual } from "@mat3ra/tede/src/js/cypress/utils";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import { getMaterialFromStandata } from "../utils/standata";

interface Params {
    path?: string;
    standata?: string;
    index: number;
}

Given("material with following data exists in state", (table: DataTable) => {
    const config = parseTable<Params>(table)[0];

    const assertMaterialExists = (material: object) => {
        BrowserManager.getBrowser()
            .execute((win) => {
                // Note that the actual type of m is MDMaterial in the `map` below, not Made.Material
                // Using Made.Material here to avoid dependency on the MDMaterial class
                // @ts-ignore
                return win.MDState.materials.map((m: Made.Material) => m.toJSON());
            })
            .then((materials: Made.Material[]) => {
                // TODO: fix toJSON() method in made.js to return basis.elements and basis.coordinates array with index starting from 1
                shallowDeepAlmostEqual(material, materials[config.index - 1]);
            });
    };

    if (config.standata) {
        const materialName = config.standata;
        cy.wrap(getMaterialFromStandata(materialName)).then(assertMaterialExists);
    } else if (config.path) {
        cy.readFile(`./cypress/fixtures/${config.path}`).then(assertMaterialExists);
    } else {
        throw new Error("No valid material source specified in the data table.");
    }
});
