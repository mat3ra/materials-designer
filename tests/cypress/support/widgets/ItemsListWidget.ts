import Widget from "./Widget";

const wrapper = ".materials-designer-items-list";

export class ItemsListWidget extends Widget {
    selectors = {
        outside: "#materials-designer",
        wrapper,
        nameInput: "input",
        itemByIndex: (index: number) => `ul>div:nth-of-type(${index}) li`,
        iconButtonDelete: ".icon-button-delete",
        count: `${wrapper} .materials-count`,
        filterInput: `${wrapper} .materials-filter input`,
        rows: `${wrapper} ul>div`,
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

    openAddMenu() {
        this.browser.click(this.selectors.addMenuButton);
    }

    selectAddMenuItem(text: string) {
        this.openAddMenu();
        this.browser.get(this.selectors.addMenuItem(text)).click();
    }

    undoRemove() {
        this.browser.click(this.selectors.undoRemove);
    }

    setItemName(itemIndex: number, name: string) {
        const selector = this.getSelectorPerItem(itemIndex, this.selectors.nameInput);
        this.browser.waitForValue(selector);
        this.selectItemByIndex(itemIndex);
        this.browser.setInputValue(selector, name);
        // Click outside of the input field to save the value
        this.browser.click(this.selectors.outside);
    }

    getSelectorPerItem(itemIndex: number, selectorName: string) {
        return this.getWrappedSelector(`${this.selectors.itemByIndex(itemIndex)} ${selectorName}`);
    }

    selectItemByIndex(index: number) {
        return this.browser.click(this.getSelectorPerItem(index, ""));
    }

    deleteMaterialByIndex(index: number) {
        this.browser.click(this.getSelectorPerItem(index, this.selectors.iconButtonDelete));
    }
}
