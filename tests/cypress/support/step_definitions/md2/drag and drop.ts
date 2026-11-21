import { Then, When } from "@badeball/cypress-cucumber-preprocessor";

const APP = ".md2-app";

/**
 * A drag in flight reports `Files` in `dataTransfer.types` before anything is dropped — that is
 * what the handler keys on, and what has to be faked here, because a browser will not synthesise
 * an OS drag.
 */
function dragEvent(type: string, files: File[] = []) {
    return cy.get(APP).then(($app) => {
        const transfer = new DataTransfer();
        files.forEach((file) => transfer.items.add(file));
        if (!files.length) Object.defineProperty(transfer, "types", { value: ["Files"] });
        $app[0].dispatchEvent(
            new DragEvent(type, { bubbles: true, cancelable: true, dataTransfer: transfer }),
        );
    });
}

When("I drag files over the window", () => {
    dragEvent("dragenter");
    dragEvent("dragover");
});

When("I drag away from the window", () => {
    dragEvent("dragleave");
});

When("I drop the file {string} on the window", (filename: string) => {
    cy.fixture(filename, "utf8").then((contents: unknown) => {
        const text = typeof contents === "string" ? contents : JSON.stringify(contents);
        dragEvent("drop", [new File([text], filename, { type: "application/json" })]);
    });
});

Then("I see the drop overlay", () => {
    cy.get('[data-testid="dropzone"]').should("be.visible");
});

Then("I do not see the drop overlay", () => {
    cy.get('[data-testid="dropzone"]').should("not.exist");
});
