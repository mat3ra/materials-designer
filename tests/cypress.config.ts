/* eslint-disable import/no-extraneous-dependencies */
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";
import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { defineConfig } from "cypress";

const defaultBaseUrl = "http://localhost:3001";

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_BASE_URL || defaultBaseUrl,
        specPattern: "cypress/e2e/**/*.feature",
        // Reduce security to allow cross-origin JS execution in iframes
        chromeWebSecurity: false,
        // Due to https://github.com/cypress-io/cypress/issues/22040 in GitHub Actions
        // supportFile: false,
        retries: {
            // Configure retry attempts for `cypress run` (CI/headless mode)
            runMode: 1,
            // Configure retry attempts for `cypress open` (local development)
            openMode: 0,
        },
        async setupNodeEvents(
            on: Cypress.PluginEvents,
            config: Cypress.PluginConfigOptions,
        ): Promise<Cypress.PluginConfigOptions> {
            await addCucumberPreprocessorPlugin(on, config);

            // The 3D editor needs a WebGL context, and a headless container has no GPU. Software
            // rendering gives wave.js a real context to draw into; without it every spec that
            // touches the viewport fails on "Error creating WebGL context" before it can assert
            // anything.
            on("before:browser:launch", (browser, launchOptions) => {
                if (browser.family === "chromium" && browser.name !== "electron") {
                    launchOptions.args.push("--use-gl=swiftshader");
                    launchOptions.args.push("--enable-unsafe-swiftshader");
                    launchOptions.args.push("--disable-gpu-sandbox");
                }
                return launchOptions;
            });
            on(
                "file:preprocessor",
                createBundler({
                    plugins: [createEsbuildPlugin(config)],
                }),
            );
            return config;
        },
        viewportHeight: 800,
    },
});
