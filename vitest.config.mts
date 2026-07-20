import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { defineConfig } from "vitest/config";

// Unit tests for pure logic (reducers, session). Uses jsdom so MUI/cove.js/made imports resolve as
// in the app. The heavy, opt-in Pyodide integration test is excluded here — run it via `test:pyodide`.
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: { plugins: ["@emotion/babel-plugin"] },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname),
    },
    test: {
        environment: "jsdom",
        globals: true,
        include: ["src/**/*.test.{ts,tsx}"],
        exclude: ["node_modules/**", "dist/**", "build/**", "**/*.pyodide.*"],
    },
});
