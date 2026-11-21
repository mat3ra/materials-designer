import Widget from "./Widget";

const selectors = {
    wrapper: "#materials-designer-status-bar",
    material: "#materials-designer-status-bar .status-material",
    position: "#materials-designer-status-bar .status-position",
};

export class StatusBarWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = selectors;
    }

    getMaterialText() {
        return this.browser.getElementText(this.selectors.material);
    }

    getPositionText() {
        return this.browser.getElementText(this.selectors.position);
    }
}

export default StatusBarWidget;
