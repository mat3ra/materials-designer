import Widget from "./Widget";

const selectors = {
    wrapper: ".basis-table",
    textViewToggle: ".basis-view-text",
    tableViewToggle: ".basis-view-table",
    row: ".basis-table-row",
    cell: (rowIndex: number, axis: string) =>
        `.basis-table-row:nth-of-type(${rowIndex}) .basis-cell-${axis} input`,
    elementCell: (rowIndex: number) =>
        `.basis-table-row:nth-of-type(${rowIndex}) .basis-cell-element input`,
    constraint: (rowIndex: number, axis: string) =>
        `.basis-table-row:nth-of-type(${rowIndex}) .basis-constraint-${axis} input`,
    addSite: ".basis-add-site",
    removeSite: (rowIndex: number) =>
        `.basis-table-row:nth-of-type(${rowIndex}) .basis-remove-site`,
};

export class BasisTableWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = selectors;
    }

    showTable() {
        this.browser.click(selectors.tableViewToggle);
        this.browser.waitForVisible(selectors.wrapper);
    }

    showText() {
        this.browser.click(selectors.textViewToggle);
    }

    assertRowCount(expected: number) {
        return this.browser.get(selectors.row).should("have.length", expected);
    }

    setCoordinate(rowIndex: number, axis: string, value: string) {
        this.browser.setInputValue(selectors.cell(rowIndex, axis), value, true);
        // The edit is committed on blur, which is also what stops the cell being reformatted
        // while it is being typed into.
        this.browser.get(selectors.cell(rowIndex, axis)).blur();
    }

    setElement(rowIndex: number, value: string) {
        this.browser.setInputValue(selectors.elementCell(rowIndex), value, true);
        this.browser.get(selectors.elementCell(rowIndex)).blur();
    }

    toggleConstraint(rowIndex: number, axis: string) {
        this.browser.click(selectors.constraint(rowIndex, axis));
    }

    addSite() {
        this.browser.click(selectors.addSite);
    }

    removeSite(rowIndex: number) {
        this.browser.click(selectors.removeSite(rowIndex));
    }
}

export default BasisTableWidget;
