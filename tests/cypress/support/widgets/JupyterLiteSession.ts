import { IframeBrowser } from "@mat3ra/tede/src/js/cypress/Browser";

import Widget from "./Widget";

const menuTabSelectorMap: Record<string, string> = {
    File: "#jp-MainMenu ul li:nth-child(1) div:nth-child(2)",
    Edit: "#jp-MainMenu ul li:nth-child(2) div:nth-child(2)",
    View: "#jp-MainMenu ul li:nth-child(3) div:nth-child(2)",
    Run: "#jp-MainMenu ul li:nth-child(4) div:nth-child(2)",
    Kernel: "#jp-MainMenu ul li:nth-child(5) div:nth-child(2)",
    Tabs: "#jp-MainMenu ul li:nth-child(6) div:nth-child(2)",
    Settings: "#jp-MainMenu ul li:nth-child(7) div:nth-child(2)",
    Help: "#jp-MainMenu ul li:nth-child(8) div:nth-child(2)",
};

const menuItemSelectorMap: Record<string, string> = {
    "Run All Cells": `#jp-mainmenu-run ul li:nth-child(12)`,
    "Restart Kernel": "#jp-mainmenu-kernel ul li:nth-child(3)",
    "Restart Kernel and Clear All Outputs": "#jp-mainmenu-kernel ul li:nth-child(4)",
};

const selectors = {
    iframe: "iframe#jupyter-lite-iframe",
    wrapper: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell .jp-InputArea-editor`,
    cellInIndex: (index: number) =>
        `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
    menuTab: (tabName: string) => menuTabSelectorMap[tabName],
    menuItem: (name: string) => menuItemSelectorMap[name],
    kernelStatusSpan: "#jp-bottom-panel #jp-main-statusbar div:nth-child(5) span",
    restartKernel:
        '.jp-NotebookPanel:not(.p-mod-hidden) .jp-NotebookPanel-toolbar button[data-command="kernelmenu:restart"]',
    dialogAccept: ".jp-Dialog-button.jp-mod-accept",
    fileSelectorByFileName: (fileName: string) => `li[title*='${fileName}']`,
};

export enum kernelStatus {
    Idle = "Idle",
    Busy = "Busy",
}

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    private iframeAnchor: IframeBrowser;

    constructor() {
        super(selectors.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
        this.iframeAnchor = this.browser.iframe(selectors.iframe, Widget.TimeoutType.md);
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(selectors.wrapper, Widget.TimeoutType.md);
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.waitForVisible(selectors.fileSelectorByFileName(fileName));
    }

    clickLinkInNotebookByItsTextContent(link: string) {
        this.iframeAnchor.waitForVisible(selectors.notebook);
        this.iframeAnchor.clickOnText(link, selectors.notebook);
    }

    // If `code` is passed - assuming `set`, otherwise - `get`
    getOrSetCodeInCell(cellIndex: number, sourceCode = "") {
        const cellSelector = selectors.cellInIndex(cellIndex);
        this.iframeAnchor.waitForExist(cellSelector);

        return this.browser.execute((win) => {
            // @ts-ignore
            const iframe = win.document.querySelector(selectors.iframe);
            const selector = selectors.cellInIndex(cellIndex);
            const cell = iframe.contentWindow.document.body.querySelector(selector);
            const codeMirrorInstance = cell.CodeMirror;
            if (!codeMirrorInstance) {
                throw new Error("Unable to access CodeMirror instance.");
            }
            return sourceCode
                ? codeMirrorInstance.setValue(sourceCode)
                : codeMirrorInstance.getValue();
        });
    }

    setCodeInCell(cellIndex: number, code: string) {
        return this.getOrSetCodeInCell(cellIndex, code);
    }

    getCodeFromCell(cellIndex: number) {
        return this.getOrSetCodeInCell(cellIndex);
    }

    clickMenu(tabName: string, subItemName?: string) {
        this.iframeAnchor.waitForVisible(selectors.menuTab(tabName));
        this.iframeAnchor.click(selectors.menuTab(tabName));
        if (subItemName) {
            this.iframeAnchor.waitForVisible(selectors.menuItem(subItemName));
            this.iframeAnchor.click(selectors.menuItem(subItemName), { force: true });
        }
    }

    isKernelInStatus(status: kernelStatus) {
        return this.iframeAnchor.getElementText(selectors.kernelStatusSpan).then((text: string) => {
            return text.includes(status);
        });
    }

    isKernelIdle() {
        return this.isKernelInStatus(kernelStatus.Idle);
    }

    isKernelBusy() {
        return this.isKernelInStatus(kernelStatus.Busy);
    }

    restartKernel() {
        this.iframeAnchor.click(selectors.restartKernel);
        this.iframeAnchor.waitForVisible(selectors.dialogAccept, Widget.TimeoutType.md);
        this.iframeAnchor.click(selectors.dialogAccept);
    }

    waitForKernelInStatusWithCallback(status: kernelStatus, callback: () => void) {
        this.browser.retry(
            () => {
                return this.isKernelInStatus(status).then((isInStatus: boolean) => {
                    if (!isInStatus) {
                        callback();
                    }
                    return isInStatus;
                });
            },
            true,
            Widget.TimeoutType.md,
            Widget.TimeoutType.xl,
        );
    }

    waitForKernelIdleWithRestart() {
        // We need to wait some time to allow kernel to start on its own, if there's an issue, we restart and wait for some time again.
        // Times are empirically determined. Usually takes 12-15 seconds for kernel to start.
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle, () => {
            this.restartKernel();
        });
    }

    waitForKernelIdle() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle, () => {});
    }

    waitForKernelBusy() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Busy, () => {});
    }
}
