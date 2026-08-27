import { Given } from "@badeball/cypress-cucumber-preprocessor";

import { CommandPaletteWidget } from "../widgets/CommandPaletteWidget";
import MaterialDesignerPage from "../widgets/MaterialDesignerPage";

const palette = () => new CommandPaletteWidget();

Given("I open the command palette", () => {
    palette().openWithShortcut();
});

Given("I search the command palette for {string}", (query: string) => {
    palette().search(query);
});

Given("I see {string} in the command palette", (text: string) => {
    palette().browser.get(palette().selectors.item).contains(text).should("be.visible");
});

Given("I do not see {string} in the command palette", (text: string) => {
    palette()
        .browser.get(palette().selectors.wrapper)
        .contains(palette().selectors.item, text)
        .should("not.exist");
});

Given("I run {string} from the command palette", (text: string) => {
    palette().runItemContaining(text);
});

Given("I click the {string} quick action", (id: string) => {
    new MaterialDesignerPage().designerWidget.browser.click(`.quick-action-${id}`);
});

Given("I toggle the {string} panel", (name: string) => {
    new MaterialDesignerPage().designerWidget.browser.click(`.panel-toggle-${name}`);
});

Given("I see the {string} panel", (selector: string) => {
    new MaterialDesignerPage().designerWidget.browser.waitForVisible(selector);
});

Given("I do not see the {string} panel", (selector: string) => {
    // A hidden pane stays mounted at zero width rather than unmounting, so the 3D context and the
    // editor's state survive being toggled away. Cypress treats a zero-width element as not visible.
    new MaterialDesignerPage().designerWidget.browser.get(selector).should("not.be.visible");
});

/**
 * Availability of a control on the quick-action row. `disabled` is read off the attribute rather
 * than by clicking and asserting nothing happened: a control that looks live but does nothing is
 * the thing being guarded against.
 */
Given(
    "I see the {string} quick action is {string}",
    (id: string, state: "enabled" | "disabled") => {
        new MaterialDesignerPage().designerWidget.browser
            .get(`.quick-action-${id}`)
            .should(state === "disabled" ? "be.disabled" : "not.be.disabled");
    },
);

Given(
    "I see the {string} panel toggle is {string}",
    (name: string, state: "enabled" | "disabled") => {
        new MaterialDesignerPage().designerWidget.browser
            .get(`.panel-toggle-${name}`)
            .should(state === "disabled" ? "be.disabled" : "not.be.disabled");
    },
);
