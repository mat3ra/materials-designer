import { CommandPaletteWidget } from "./CommandPaletteWidget";
import Widget from "./Widget";

/**
 * Runs a command by its id.
 *
 * MD 2.0 gives every action a stable id and renders it as `data-command`, so a spec asks for
 * "material.clone" rather than for the fourth item of the Edit menu. Ids survive the UI being
 * rearranged; ordinal positions do not.
 *
 * Not every command has a button of its own — most operations are reached through the Catalog or
 * the palette, which is the point of a registry. So when nothing on screen carries the id, this
 * falls back to the palette, exactly as a user would: it is the surface where every command can be
 * reached, and it renders each row with the same `data-command`.
 */
export class CommandsWidget extends Widget {
    constructor() {
        super("#materials-designer");
    }

    run(id: string) {
        const trigger = `[data-command="${id}"]`;
        return cy.get("body").then(($body) => {
            // Already on screen: the quick-action row, a panel toggle, a console tab.
            if ($body.find(`${trigger}:visible`).length) {
                return this.browser.click(trigger);
            }
            // Operations live in the Catalog, which is the surface a user would reach for.
            this.browser.click('[data-testid="open-catalog"]');
            return cy.get("body").then(($withCatalog) => {
                if ($withCatalog.find(`.md2-catalog ${trigger}`).length) {
                    return this.browser.click(`.md2-catalog ${trigger}`);
                }
                // Everything else — undo, reset, the view toggles — through the palette, which
                // lists the whole registry.
                this.browser.click('[data-testid="close-catalog"]');
                new CommandPaletteWidget().open();
                return this.browser.click(`.command-palette ${trigger}`);
            });
        });
    }

    isEnabled(id: string) {
        return this.browser.get(`[data-command="${id}"]`).should("not.be.disabled");
    }

    isDisabled(id: string) {
        return this.browser.get(`[data-command="${id}"]`).should("be.disabled");
    }
}

export default CommandsWidget;
