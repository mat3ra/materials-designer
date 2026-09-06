import Widget from "./Widget";

/**
 * Runs a command by its id.
 *
 * MD 2.0 gives every action a stable id and renders it as `data-command`, so a spec asks for
 * "material.clone" rather than for the fourth item of the Edit menu. Ids survive the UI being
 * rearranged; ordinal positions do not.
 */
export class CommandsWidget extends Widget {
    constructor() {
        super("#materials-designer");
    }

    run(id: string) {
        return this.browser.click(`[data-command="${id}"]`);
    }

    isEnabled(id: string) {
        return this.browser.get(`[data-command="${id}"]`).should("not.be.disabled");
    }

    isDisabled(id: string) {
        return this.browser.get(`[data-command="${id}"]`).should("be.disabled");
    }
}

export default CommandsWidget;
