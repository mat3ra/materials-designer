import { Given } from "@badeball/cypress-cucumber-preprocessor";
import BrowserManager from "@mat3ra/tede/src/js/cypress/BrowserManager";

interface AtomicValue {
    id: number;
}

Given("atom with index {string} has no {string} value in state", (index: string, field: string) => {
    BrowserManager.getBrowser()
        .execute((win) => win.MDState.materials[win.MDState.index].toJSON())
        .then((material: { basis: Record<string, AtomicValue[]> }) => {
            const atomId = material.basis.elements[parseInt(index, 10) - 1].id;
            expect((material.basis[field] ?? []).map(({ id }) => id)).not.to.include(atomId);
        });
});
