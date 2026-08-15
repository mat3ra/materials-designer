import { Given } from "@badeball/cypress-cucumber-preprocessor";

import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

const itemsList = () => new MaterialDesignerPage().designerWidget.itemsList;

Given("I filter the materials list by {string}", (query: string) => {
    itemsList().filterBy(query);
});

Given("I clear the materials list filter", () => {
    itemsList().clearFilter();
});

Given("I see {string} materials in the list", (expected: string) => {
    itemsList().assertRowCount(parseInt(expected, 10));
});

Given("I see the materials count showing {string}", (expected: string) => {
    itemsList().getCountText().should("contain", expected);
});

Given("I see the empty state for the materials list", () => {
    itemsList().browser.waitForVisible(itemsList().selectors.emptyState);
});

Given("I select {string} from the add material menu", (itemText: string) => {
    itemsList().selectAddMenuItem(itemText);
});

Given("I undo the removal", () => {
    itemsList().undoRemove();
});
