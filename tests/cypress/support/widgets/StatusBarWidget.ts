import Widget from "./Widget";

const selectors = {
    wrapper: "#materials-designer-status-bar",
    selection: "#materials-designer-status-bar .status-selection",
    material: "#materials-designer-status-bar .status-material",
    position: "#materials-designer-status-bar .status-position",
};

export class StatusBarWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = selectors;
    }

    getSelectionText() {
        return this.browser.getElementText(this.selectors.selection);
    }

    getMaterialText() {
        return this.browser.getElementText(this.selectors.material);
    }

    getPositionText() {
        return this.browser.getElementText(this.selectors.position);
    }
}

export default StatusBarWidget;
