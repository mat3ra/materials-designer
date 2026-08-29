// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************
// Import commands.js using ES2015 syntax:
import "./commands";

/**
 * "ResizeObserver loop completed with undelivered notifications" is a benign browser notice: it
 * means the observer rescheduled work to the next frame, not that anything failed. wave.js sizes
 * its canvas with a ResizeObserver, so toggling a panel reliably produces one. Cypress fails a test
 * on any uncaught exception, so this single message is filtered out - by exact text, to keep every
 * other application error failing as it should.
 */
Cypress.on("uncaught:exception", (err) => {
    if (err.message.includes("ResizeObserver loop")) return false;
    return undefined;
});
