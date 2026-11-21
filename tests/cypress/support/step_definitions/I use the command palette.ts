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
/**
 * A word this does not recognise has to fail loudly.
 *
 * Both of these steps took the state as a string and fell through to "enabled" for anything that
 * was not "disabled", so `is "enabldd"` asserted nothing while reading as though it asserted
 * something. Cucumber hands over whatever the feature file says; the TypeScript union is a comment.
 */
function unknownState(state: string): never {
    throw new Error(`Unknown state "${state}" — expected one of: enabled, disabled, on, off.`);
}

Given("I see the {string} quick action is {string}", (id: string, state: string) => {
    const action = new MaterialDesignerPage().designerWidget.browser.get(`.quick-action-${id}`);
    if (state !== "enabled" && state !== "disabled") unknownState(state);
    action.should(state === "disabled" ? "be.disabled" : "not.be.disabled");
});

Given("I see the {string} panel toggle is {string}", (name: string, state: string) => {
    const toggle = new MaterialDesignerPage().designerWidget.browser.get(`.panel-toggle-${name}`);
    // Two facts, two attributes: whether it can be pressed, and whether it is.
    if (state === "on" || state === "off") {
        toggle.should("have.attr", "aria-pressed", state === "on" ? "true" : "false");
        return;
    }
    if (state !== "enabled" && state !== "disabled") unknownState(state);
    toggle.should(state === "disabled" ? "be.disabled" : "not.be.disabled");
});
