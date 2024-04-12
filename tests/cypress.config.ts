/* eslint-disable import/no-extraneous-dependencies */
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { defineConfig } from "cypress";
import installLogsPrinter from "cypress-terminal-report/src/installLogsPrinter";

export default defineConfig({
    e2e: {
        specPattern: "cypress/e2e/**/*.feature",
        // Reduce security to allow cross-origin JS execution in iframes
        chromeWebSecurity: false,
        // experimentalMemoryManagement: true,
        // Due to https://github.com/cypress-io/cypress/issues/22040 in GitHub Actions
        // supportFile: false,
        async setupNodeEvents(
            on: Cypress.PluginEvents,
            config: Cypress.PluginConfigOptions,
        ): Promise<Cypress.PluginConfigOptions> {
            await addCucumberPreprocessorPlugin(on, config);
            on(
                "file:preprocessor",
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                }),
            );
            installLogsPrinter(on, {
                outputRoot: config.projectRoot + "/cypress/",
                // Used to trim the base path of specs and reduce nesting in the generated output directory.
                specRoot: "cypress/e2e",
                outputTarget: {
                    "logs|txt": "txt",
                },
                printLogsToConsole: "always",
                printLogsToFile: "always",
            });
            return config;
        },
        viewportHeight: 800,
    },
});
