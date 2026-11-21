import { Given } from "@badeball/cypress-cucumber-preprocessor";

import { BasisTableWidget } from "../widgets/BasisTableWidget";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

const table = () => new BasisTableWidget();

Given("I show the basis as a table", () => {
    table().showTable();
});

Given("I show the basis as text", () => {
    table().showText();
});

Given("I see {string} sites in the basis table", (expected: string) => {
    table().assertRowCount(parseInt(expected, 10));
});

Given(
    "I set the {string} coordinate of site {string} to {string}",
    (axis: string, site: string, value: string) => {
        table().setCoordinate(parseInt(site, 10), axis, value);
    },
);

Given("I set the element of site {string} to {string}", (site: string, value: string) => {
    table().setElement(parseInt(site, 10), value);
});

Given("I untick the {string} constraint of site {string}", (axis: string, site: string) => {
    table().toggleConstraint(parseInt(site, 10), axis);
});

Given("I add a site to the basis table", () => {
    table().addSite();
});

Given("I remove site {string} from the basis table", (site: string) => {
    table().removeSite(parseInt(site, 10));
});

/**
 * Compares against the material's own XYZ rendering rather than the editor's DOM, so the check is
 * about what was stored and holds whichever view is on screen.
 */
Given("the basis text is", (expected: string) => {
    new MaterialDesignerPage().designerWidget.browser
        .execute((win) => {
            return win.MDState.materials[win.MDState.index].getBasisAsXyz();
        })
        .then((actual: string) => {
            const normalise = (text: string) =>
                text
                    .trim()
                    .split("\n")
                    .map((line) => line.trim().replace(/\s+/g, " "))
                    .join("\n");
            expect(normalise(actual)).to.eq(normalise(expected));
        });
});
