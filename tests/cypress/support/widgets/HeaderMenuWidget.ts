import Widget from "./Widget";

const selectors = {
    menuDialogItemByNumber: (name: string, number: number) =>
        `.button-activated-menu[data-name="${name}-menu"] li[role="menuitem"]:nth-of-type(${number})`,
    wrapper: ".materials-designer-header-menu",
};

export default class HeaderMenuWidget extends Widget {
    selectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.selectors = this.getWrappedSelectors(selectors);
    }

    openMenuDialog(menuName: string) {
        this.browser.clickOnText(menuName, this.selector);
    }

    selectMenuItem(menuName: string, itemNumber: number) {
        // Not using 'selectors' instead of 'this.selectors' because of the dialog location
        this.browser.click(selectors.menuDialogItemByNumber(menuName, itemNumber));
    }

    selectMenuItemByNameAndItemNumber(menuName: string, itemNumber: number) {
        this.openMenuDialog(menuName);
        this.selectMenuItem(menuName, itemNumber);
    }
}
