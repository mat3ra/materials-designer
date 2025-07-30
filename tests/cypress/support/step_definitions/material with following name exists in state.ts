import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { Made } from "@mat3ra/made";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";
import { shallowDeepAlmostEqual } from "@mat3ra/tede/src/js/cypress/utils";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

interface Params {
    name: string;
    index: number;
}

Given("material with following name exists in state", (table: DataTable) => {
    const config = parseTable<Params>(table)[0];

    BrowserManager.getBrowser()
        .execute((win) => {
            // @ts-ignore
            return win.MDState.materials.map((m: Made.Material) => m.toJSON());
        })
        .then((materials: Made.Material[]) => {
            const material = materials[config.index - 1];
            if (material.name !== config.name) {
                throw new Error(
                    `Expected material name to be ${config.name}, but got ${material.name}`,
                );
            }
        });
});
