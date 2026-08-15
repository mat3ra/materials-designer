import { DataTable, Given } from "@badeball/cypress-cucumber-preprocessor";
import { parseTable } from "@mat3ra/tede/src/js/cypress/utils/table";

import { StatusBarWidget } from "../widgets/StatusBarWidget";

interface Params {
    group: "selection" | "material" | "position";
    text: string;
}

const readers = {
    selection: (widget: StatusBarWidget) => widget.getSelectionText(),
    material: (widget: StatusBarWidget) => widget.getMaterialText(),
    position: (widget: StatusBarWidget) => widget.getPositionText(),
};

/**
 * Asserts a status bar group contains the given text. Substring rather than equality: the groups
 * render a label above the value, and the value itself grows as more facts become available.
 */
Given("I see status bar showing", (table: DataTable) => {
    const widget = new StatusBarWidget();
    parseTable<Params>(table).forEach(({ group, text }) => {
        const read = readers[group];
        if (!read) throw new Error(`Unknown status bar group "${group}"`);
        read(widget).should("contain", text);
    });
});
