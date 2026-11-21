import Widget from "./Widget";

const wrapper = ".materials-designer-items-list";

/** Rows are addressed by test id and position; everything else is a class name. */
const rows = `${wrapper} [data-testid="material-row"]`;

export class ItemsListWidget extends Widget {
    /*
     * `outside`, `nameInput`, `itemByIndex` and `iconButtonDelete` address a list this repository
     * no longer renders — v1's ul>div>li rows — and nothing here reads them any more. They stay,
     * with `getSelectorPerItem` below, because web-app subclasses this widget and may: removing
     * them is a contract change to agree with that repository, not a tidy-up to do in passing.
     */
    selectors = {
        outside: "#materials-designer",
        wrapper,
        nameInput: "input",
        itemByIndex: (index: number) => `ul>div:nth-of-type(${index}) li`,
        iconButtonDelete: ".icon-button-delete",
        count: `${wrapper} .materials-count`,
        filterInput: `${wrapper} .materials-filter input`,
        filterClear: `${wrapper} .materials-filter-clear`,
        rows,
        emptyState: `${wrapper} .materials-empty-state`,
        addMenuButton: `${wrapper} .add-material-menu`,
        // The add menu renders in a portal, so it is addressed outside the list wrapper.
        addMenuItem: (text: string) => `li:contains("${text}")`,
        undoRemove: ".undo-remove-material",
        updatedDot: `${wrapper} .material-updated-dot`,
    };

    constructor() {
        super(wrapper);
    }

    getCountText() {
        return this.browser.getElementText(this.selectors.count);
    }

    /**
     * Asserts the number of visible rows. Uses a length assertion rather than reading `.length`,
     * because `cy.get` fails outright on a selector that matches nothing - which is exactly the
     * case a filter matching no materials needs to check.
     */
    assertRowCount(expected: number) {
        return this.browser.get(this.selectors.rows).should("have.length", expected);
    }

    filterBy(query: string) {
        this.browser.setInputValue(this.selectors.filterInput, query, true);
    }

    clearFilter() {
        this.browser.clearInputValue(this.selectors.filterInput);
    }

    /** The "x" inside the field, which only exists while the filter has text. */
    clearFilterWithButton() {
        this.browser.click(this.selectors.filterClear);
    }

    openAddMenu() {
        this.browser.click(this.selectors.addMenuButton);
    }

    selectAddMenuItem(text: string) {
        this.openAddMenu();
        this.browser.get(this.selectors.addMenuItem(text)).click();
    }

    undoRemove() {
        // There is one history for every surface, so undoing a removal is the same action as
        // undoing anything else — no inline "undo" beside the list.
        this.browser.click('[data-command="edit.undo"]');
    }

    setItemName(itemIndex: number, name: string) {
        // The field opens on double-click and commits on Enter; there is no always-present input.
        this.browser
            .get(rows)
            .eq(itemIndex - 1)
            .find(".md2-tname")
            .dblclick();
        this.browser.get('[data-testid="material-name-input"]').clear().type(`${name}{enter}`);
    }

    getSelectorPerItem(itemIndex: number, selectorName: string) {
        return this.getWrappedSelector(`${this.selectors.itemByIndex(itemIndex)} ${selectorName}`);
    }

    selectItemByIndex(index: number) {
        return this.browser
            .get(rows)
            .eq(index - 1)
            .click();
    }

    deleteMaterialByIndex(index: number) {
        this.browser
            .get(rows)
            .eq(index - 1)
            .find('[data-testid="row-remove"]')
            .click({ force: true });
    }
}
