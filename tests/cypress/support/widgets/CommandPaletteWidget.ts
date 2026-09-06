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

    /**
     * Open it without going through the keyboard.
     *
     * `cy.type` sends keys to whatever holds focus, and the registry ignores chords typed into a
     * field — correctly, since a shortcut must not fire while someone is typing. That makes the
     * chord the wrong tool for a step whose intent is "run this command", as opposed to the
     * keyboard specs, whose intent is the chord itself. Those keep using `openWithShortcut`.
     */
    open() {
        this.browser.execute((win: any) => {
            win.document.body.dispatchEvent(
                new win.KeyboardEvent("keydown", {
                    key: "k",
                    ctrlKey: true,
                    bubbles: true,
                    cancelable: true,
                }),
            );
        });
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
