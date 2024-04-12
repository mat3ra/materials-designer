import Widget from "./Widget";
// TODO: celanup eveyrthing
const selectors = {
    wrapper: "iframe#jupyter-lite-iframe",
    main: "#main",
    notebook: ".jp-Notebook",
    cellIn: `.jp-Cell-inputWrapper .jp-InputArea-editor`,
    menuItem: 'li[role="menuitem"]',
    runTab: 'li[role="menuitem"] > div:contains("Run")',
    runAllCells: 'li[role="menuitem"] > div:contains("Run All Cells")',
};

export default class JupyterLiteSession extends Widget {
    wrappedSelectors: typeof selectors;

    constructor() {
        super(selectors.wrapper);
        this.wrappedSelectors = this.getWrappedSelectors(selectors);
    }

    waitForVisible() {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main, { timeout: 360000 })
            .should("exist", { timeout: 10000 });
    }

    checkFileOpened(fileName: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.main)
            .find(`li[title*='${fileName}']`)
            .should("exist");
    }

    clickOnLink(link: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .contains(link)
            .scrollIntoView()
            .click();
    }

    setCodeInCell(cellIndex: number, code: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .find(selectors.cellIn)
            .eq(cellIndex)
            .find(".CodeMirror")
            .then((element) => {
                const codeMirrorInstance = element[0].CodeMirror;
                if (codeMirrorInstance) {
                    codeMirrorInstance.setValue(code);
                } else {
                    throw new Error("Unable to access CodeMirror instance.");
                }
            });
    }

    getCodeFromCell(cellIndex: number): Cypress.Chainable<string> {
        return cy
            .getIframeBody(selectors.wrapper)
            .find(selectors.notebook)
            .find(selectors.cellIn)
            .eq(cellIndex)
            .invoke("text");
    }

    clickMenuTab(tabName: string) {
        return cy
            .getIframeBody(selectors.wrapper)
            .contains(selectors.menuItem, tabName)
            .click()
            .then(($li) => {
                if ($li.find(".lm-Menu").length > 0) {
                    cy.contains(selectors.menuItem, tabName).should("be.visible").click();
                }
            });
    }

    // getKernelStatus() {
    //     return this.browser
    //         .iframe(selectors.wrapper, "lg")
    //         .getElementText("#jp-main-statusbar span")
    //         .contains(/Python \(Pyodide\)/)
    //         .invoke("text");
    // }

    getKernelStatus() {
        return cy
            .getIframeBody(selectors.wrapper)
            .find("#jp-main-statusbar span")
            .contains(/Python \(Pyodide\)/)
            .invoke("text");
    }

    // waitForKernelIdle(timeout = 120000) {
    //     return cy
    //         .getIframeBody(selectors.wrapper)
    //         .find(selectors.main)
    //         .find(".p-Widget", { timeout })
    //         .contains("Python (Pyodide) | Idle", { timeout })
    //         .should("exist", { timeout });
    // }

    waitForKernelIdleWithRestart(timeout = 120000, attempt = 1) {
        const maxAttempts = 3; // Max attempts to check for kernel idle status
        const restartTimeout = 8000; // Specific timeout to wait for restart action
        const checkInterval = 12000; // Interval between checks

        cy.getIframeBody(selectors.wrapper)
            .find(selectors.main, { timeout })
            .then(($main) => {
                cy.wait(checkInterval).then(() => {
                    const $status = $main.find(".p-Widget:contains('Python (Pyodide) | Idle')");
                    if ($status.length > 0) {
                        // If the kernel is idle, we are successful
                    } else if (attempt < maxAttempts) {
                        // If the kernel is not idle and we have attempts left, try to restart
                        cy.getIframeBody(selectors.wrapper)
                            .find('button[data-command="kernelmenu:restart"]', {
                                timeout: restartTimeout,
                            })
                            .click({ multiple: true, force: true })
                            .then(() => {
                                cy.get(".jp-Dialog-button.jp-mod-accept", {
                                    timeout: 2000,
                                }).click({ multiple: true, force: true });
                                // Wait a bit for the kernel to potentially restart
                                cy.wait(restartTimeout).then(() => {
                                    this.waitForKernelIdleWithRestart(
                                        timeout - (attempt * checkInterval + restartTimeout),
                                        attempt + 1,
                                    );
                                });
                            });
                    } else {
                        throw new Error("Kernel did not become idle after maximum attempts.");
                    }
                });
            });
    }
}
