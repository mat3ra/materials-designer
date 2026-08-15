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
    new MaterialDesignerPage().designerWidget.browser.get(selector).should("not.exist");
});
