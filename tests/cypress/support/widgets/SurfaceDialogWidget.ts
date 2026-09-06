import { forApp } from "../app";
import Widget from "./Widget";

export interface SurfaceConfig {
    h?: number;
    k?: number;
    l?: number;
    thickness?: number;
    vacuumRatio?: number;
    vx?: number;
    vy?: number;
}

const selectors = {
    wrapper: forApp("#surfaceModal", "#panel-surface"),
    submitButton: forApp("#surfaceModal-submit-button", '[data-testid="panel-apply"]'),
    h: forApp('[data-tid="miller-h"] input', '[data-tid="miller-h"]'),
    k: forApp('[data-tid="miller-k"] input', '[data-tid="miller-k"]'),
    l: forApp('[data-tid="miller-l"] input', '[data-tid="miller-l"]'),
    thickness: forApp('[data-tid="thickness"] input', '[data-tid="thickness"]'),
    vacuumRatio: forApp('[data-tid="vacuum-ratio"] input', '[data-tid="vacuum-ratio"]'),
    vx: forApp('[data-tid="vx"] input', '[data-tid="vx"]'),
    vy: forApp('[data-tid="vy"] input', '[data-tid="vy"]'),
};

export default class SurfaceDialogWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    generateSurface({ h, k, l, thickness, vacuumRatio, vx, vy }: SurfaceConfig) {
        if (h) this.browser.setInputValue(this.selectors.h, h);
        if (k) this.browser.setInputValue(this.selectors.k, k);
        if (l) this.browser.setInputValue(this.selectors.l, l);
        if (thickness) this.browser.setInputValue(this.selectors.thickness, thickness);
        if (vacuumRatio) this.browser.setInputValue(this.selectors.vacuumRatio, vacuumRatio);
        if (vx) this.browser.setInputValue(this.selectors.vx, vx);
        if (vy) this.browser.setInputValue(this.selectors.vy, vy);
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}
