import Widget from "./Widget";

/** Cartesian offset in angstrom applied to one guest material, relative to the host origin. */
export interface CombineOffset {
    x?: number;
    y?: number;
    z?: number;
}

const wrapper = "#combineMaterialsModal";

/** Static selectors only: the parameterized ones are built through `getWrappedSelector` below. */
const selectors = {
    wrapper,
    submitButton: "#combineMaterialsModal-submit-button",
    host: '[data-tid="combine-host"] input',
    name: '[data-tid="combine-name"] input',
};

export class CombineMaterialsDialogWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    getGuestToggleSelector(guestIndex: number) {
        return this.getWrappedSelector(`[data-tid="combine-guest-toggle-${guestIndex}"] input`);
    }

    getOffsetSelector(axis: string, guestIndex: number) {
        return this.getWrappedSelector(`[data-tid="combine-offset-${axis}-${guestIndex}"] input`);
    }

    /**
     * Adds the material at `index` (1-based, as in the other material steps) to the combination
     * and places it at `offset`.
     */
    addGuest(index: number, { x, y, z }: CombineOffset) {
        const guestIndex = index - 1;
        this.browser.click(this.getGuestToggleSelector(guestIndex));
        if (x !== undefined) this.browser.setInputValue(this.getOffsetSelector("x", guestIndex), x);
        if (y !== undefined) this.browser.setInputValue(this.getOffsetSelector("y", guestIndex), y);
        if (z !== undefined) this.browser.setInputValue(this.getOffsetSelector("z", guestIndex), z);
    }

    setName(name: string) {
        this.browser.setInputValue(this.selectors.name, name);
    }

    submit() {
        this.browser.click(this.selectors.submitButton);
    }
}

export default CombineMaterialsDialogWidget;
