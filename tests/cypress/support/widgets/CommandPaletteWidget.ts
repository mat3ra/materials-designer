import Widget from "./Widget";

const selectors = {
    wrapper: ".command-palette",
    input: ".command-palette-input input",
    item: ".command-palette-item",
    itemByText: (text: string) => `.command-palette-item:contains("${text}")`,
};

export class CommandPaletteWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = selectors;
    }

    /** The palette is opened by a global shortcut, so the key goes to the document body. */
    openWithShortcut() {
        this.browser.get("body").type("{ctrl}k");
        this.browser.waitForVisible(selectors.input);
    }

    search(query: string) {
        // Clear first: a scenario that searches twice must not end up with both queries typed.
        this.browser.setInputValue(selectors.input, query, true);
    }

    getItemTexts() {
        return this.browser.getEachElementTexts(selectors.item);
    }

    runFirstItem() {
        this.browser.get(selectors.item).first().click();
    }

    runItemContaining(text: string) {
        this.browser.get(selectors.item).contains(text).click();
    }
}

export default CommandPaletteWidget;
