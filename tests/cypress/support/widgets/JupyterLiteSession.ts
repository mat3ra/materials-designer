import { IframeBrowser } from "@mat3ra/tede/src/js/cypress/Browser";

import Widget from "./Widget";

// Selectors work for JL version https://github.com/Exabyte-io/jupyterlite/blob/7694a77e0a8cd495b0dbe1fb68cff3142fc5d32b/requirements.txt#L3
const SELECTORS = {
    iframe: "iframe#jupyter-lite-iframe",
    main: "#main",
    sidebar: {
        root: "#jp-left-stack",
        crumbs: ".jp-FileBrowser-crumbs",
        listing: ".jp-DirListing-content li",
        listingByIndex: (index: number) =>
            `#jp-left-stack .jp-DirListing-content li:nth-of-type(${index})`,
    },
    notebook: {
        root: ".jp-Notebook",
        cell: {
            input: ".jp-Cell .jp-InputArea-editor",
            link: ".jp-Cell .jp-InputArea a",
            byIndex: (index: number) =>
                `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-InputArea-editor .CodeMirror`,
            output: (index: number) =>
                `.jp-Notebook .jp-Cell:nth-child(${index}) .jp-OutputArea-output`,
            stdin: ".lm-Widget.p-Widget input.jp-Stdin-input",
            error: ".jp-Cell .ansi-red-fg",
            any: ".jp-Cell",
        },
    },
    menu: {
        tab: "#jp-MainMenu ul li",
        item: "#jp-mainmenu-run ul li",
    },
    kernel: {
        status: "#jp-bottom-panel #jp-main-statusbar div:nth-child(5) span",
        restart:
            '.jp-NotebookPanel:not(.p-mod-hidden) .jp-NotebookPanel-toolbar button[data-command="kernelmenu:restart"]',
    },
    dialog: ".jp-Dialog-button.jp-mod-accept",
    fileTab: ".lm-TabBar-tabLabel.p-TabBar-tabLabel",
};

export enum kernelStatus {
    Idle = "Idle",
    Busy = "Busy",
}

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof SELECTORS;
    private delayForJupyterKernelRestart: string;
    private timeoutForJupyterKernelWait: string;

    private iframeAnchor: IframeBrowser;

    constructor(extraConfig: any) {
        super(SELECTORS.iframe);
        this.wrappedSelectors = this.getWrappedSelectors(SELECTORS);
        this.iframeAnchor = this.browser.iframe(SELECTORS.iframe, Widget.TimeoutType.lg);
        this.delayForJupyterKernelRestart =
            extraConfig?.delayForJupyterKernelRestart || Widget.TimeoutType.md;
        this.timeoutForJupyterKernelWait =
            extraConfig?.timeoutForJupyterKernelWait || Widget.TimeoutType.xl;
        this.iframeAnchor = this.browser.iframe(SELECTORS.iframe, Widget.TimeoutType.md);
    }

    waitForVisible() {
        return this.iframeAnchor.waitForVisible(SELECTORS.main, Widget.TimeoutType.lg);
    }

    doubleclickEntryInSidebar(sidebarEntry: string) {
        this.iframeAnchor.waitForExist(SELECTORS.sidebar.listing);
        this.iframeAnchor.doubleClickOnText(sidebarEntry, SELECTORS.sidebar.listing, {
            force: true,
        });
    }

    assertPathInSidebar(path: string) {
        this.browser.retry(() => {
            const value = this.getPathInSidebar();
            return value.then((text: string) => {
                return text === path;
            });
        }, true);
    }

    getPathInSidebar() {
        this.iframeAnchor.waitForVisible(SELECTORS.sidebar.crumbs);
        this.iframeAnchor
            .getElementText(SELECTORS.sidebar.crumbs)
            .then((text: string) => console.log(text));
        return this.iframeAnchor.getElementText(SELECTORS.sidebar.crumbs);
    }

    checkEntryPresentInSidebar(sidebarEntry: string) {
        this.iframeAnchor.waitForVisible(SELECTORS.sidebar.listing);
        return this.iframeAnchor.get(SELECTORS.sidebar.listing).contains(sidebarEntry);
    }

    checkFileOpened(fileName: string) {
        return this.iframeAnchor.get(SELECTORS.fileTab).contains(fileName);
    }

    clickLinkInNotebookByItsTextContent(link: string) {
        this.iframeAnchor.waitForVisible(SELECTORS.notebook.root);
        this.iframeAnchor.clickOnText(link, SELECTORS.notebook.cell.link);
    }

    getOrSetCodeInCell(cellIndex: number, sourceCode = "") {
        const cellSelector = SELECTORS.notebook.cell.byIndex(cellIndex);
        this.iframeAnchor.waitForExist(cellSelector);

        return this.browser.execute((win: any) => {
            const iframe = win.document.querySelector(SELECTORS.iframe) as any;
            const selector = SELECTORS.notebook.cell.byIndex(cellIndex);
            const cell = iframe?.contentWindow?.document.body.querySelector(selector) as any;
            const codeMirrorInstance = cell?.CodeMirror;
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

    getOutputFromCell(cellIndex: number) {
        const outputSelector = SELECTORS.notebook.cell.output(cellIndex);
        this.iframeAnchor.waitForExist(outputSelector);
        return this.iframeAnchor.getElementText(outputSelector);
    }

    clickMenu(tabName: string, subItemName?: string) {
        this.iframeAnchor.clickOnText(tabName, SELECTORS.menu.tab);
        if (subItemName) {
            this.iframeAnchor.clickOnText(subItemName, SELECTORS.menu.item);
        }
    }

    isKernelInStatus(status: kernelStatus) {
        return this.iframeAnchor.getElementText(SELECTORS.kernel.status).then((text: string) => {
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
        this.iframeAnchor.click(SELECTORS.kernel.restart);
        this.iframeAnchor.waitForVisible(SELECTORS.dialog, Widget.TimeoutType.md);
        this.iframeAnchor.click(SELECTORS.dialog);
    }

    waitForKernelInStatusWithCallback(status: kernelStatus, callback?: () => void) {
        this.browser.retry(
            () => {
                return this.isKernelInStatus(status).then((isInStatus: boolean) => {
                    if (!isInStatus && callback) {
                        callback();
                    }
                    return isInStatus;
                });
            },
            true,
            this.delayForJupyterKernelRestart,
            this.timeoutForJupyterKernelWait,
        );
    }

    waitForKernelIdleWithRestart() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle, () => {
            this.restartKernel();
        });
    }

    waitForKernelIdle() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Idle);
    }

    waitForKernelBusy() {
        this.waitForKernelInStatusWithCallback(kernelStatus.Busy);
    }

    enterTextIntoInput(text: string) {
        this.iframeAnchor.setInputValue(SELECTORS.notebook.cell.stdin, text, true, {
            parseSpecialCharSequences: false,
        });

        this.iframeAnchor.get(SELECTORS.notebook.cell.stdin).type("{enter}");
    }

    /**
     * Formats cell text for error reporting with smart truncation
     * Shows first 300 and last 300 characters if text is longer than 600 chars
     */
    private formatCellTextForDisplay(fullText: string): string {
        const charactersToShow = 600;

        if (fullText.length <= charactersToShow) {
            return fullText;
        }

        const firstPart = fullText.substring(0, charactersToShow / 2);
        const lastPart = fullText.substring(fullText.length - charactersToShow / 2);
        const truncatedCount = fullText.length - charactersToShow;

        return `${firstPart}\n...[truncated ${truncatedCount} characters]...\n${lastPart}`;
    }

    /**
     * Checks for error cells and scrolls to the first one found for visibility
     * Logs error information but does NOT fail the test - continues execution
     */
    checkForErrorsAndScrollToFirst() {
        return this.browser
            .execute((win: any) => {
                try {
                    const iframe = win.document.querySelector(SELECTORS.iframe) as any;
                    if (!iframe?.contentWindow?.document) {
                        return { hasError: false };
                    }

                    const iframeDoc = iframe.contentWindow.document;
                    const errorElements = iframeDoc.querySelectorAll(SELECTORS.notebook.cell.error);

                    if (errorElements.length > 0) {
                        const firstErrorCell = errorElements[0].closest(
                            SELECTORS.notebook.cell.any,
                        ) as any;

                        const firstErrorText = errorElements[0].textContent?.trim() || "";
                        const fullCellText = firstErrorCell?.textContent?.trim() || "";

                        if (firstErrorCell) {
                            firstErrorCell.scrollIntoView({
                                behavior: "auto",
                                block: "center",
                                inline: "nearest",
                            });
                        }

                        return {
                            hasError: true,
                            errorCount: errorElements.length,
                            firstErrorText,
                            cellText: fullCellText,
                        };
                    }

                    return { hasError: false };
                } catch (error) {
                    return { hasError: false, error };
                }
            })
            .then((result: any) => {
                if (result.hasError) {
                    const formattedCellText = this.formatCellTextForDisplay(result.cellText || "");

                    console.log(`🔴 Error detected: ${result.firstErrorText || "Unknown error"}`);
                    console.log(
                        `Cell content:\n${formattedCellText || "Unable to extract cell content"}`,
                    );
                }
            });
    }
}
