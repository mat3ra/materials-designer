import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react({
            jsxImportSource: "@emotion/react",
            babel: {
                plugins: ["@emotion/babel-plugin"],
            },
        }),
        nodePolyfills(),
    ],
    define: {
        __dirname: JSON.stringify(__dirname), // fix for node.js modules in client bundle
        "process.env.VITE_JUPYTERLITE_DEVELOPMENT_URL": JSON.stringify(
            process.env.VITE_JUPYTERLITE_DEVELOPMENT_URL,
        ),
        "process.env.VITE_USE_JUPYTERLITE_DEV_URL": JSON.stringify(
            process.env.VITE_USE_JUPYTERLITE_DEV_URL,
        ),
    },
    server: {
        port: 3001,
    },

    // Specs live under tests/, which is its own npm project with its own node_modules — so Vite's
    // resolution finds the Cypress suite's older @mat3ra packages before the root ones and the specs
    // silently test against the wrong library version. Pin every @mat3ra import to the root install.
    resolve: {
        alias: [
            {
                find: /^@mat3ra\//,
                replacement: `${resolve(__dirname, "node_modules/@mat3ra")}/`,
            },
        ],
    },

    // Two vitest projects rather than two config files: the fast suite runs on every commit, while the
    // real-Pyodide suite builds a WASM CPython environment and takes minutes. The `*.pyodide.test.ts`
    // suffix is what routes a file between them — select with `npm run test:unit` / `test:pyodide`.
    //
    // Specs live in tests/vitest/ (beside tests/cypress/) so src/ holds only shipped source. `include`
    // is scoped to that directory rather than using vitest's default glob, which would also sweep up
    // the Cypress specs next door.
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["tests/vitest/**/*.test.ts"],
                    exclude: ["**/*.pyodide.test.ts"],
                    setupFiles: ["tests/vitest/setup.ts"],
                },
            },
            {
                resolve: {
                    alias: [
                        {
                            find: /^@mat3ra\//,
                            replacement: `${resolve(__dirname, "node_modules/@mat3ra")}/`,
                        },
                    ],
                },
                // Deliberately NOT `extends: true`: inheriting the app's plugins brings in
                // nodePolyfills(), which swaps Node builtins for browser shims and then fails to
                // resolve under a real Node run ("Directory import .../punycode/ is not supported").
                // This suite talks to Node APIs and the pyodide npm package directly, so it wants the
                // plain esbuild + JSON handling Vite gives it out of the box.
                test: {
                    name: "pyodide",
                    include: ["tests/vitest/**/*.pyodide.test.ts"],
                    setupFiles: ["tests/vitest/setup.ts"],
                    // One Pyodide interpreter per process is the supported shape (PyodideSession
                    // enforces it), so these files must never run concurrently. Timeouts live in the
                    // test file itself, next to the code that needs them.
                    fileParallelism: false,
                },
            },
        ],
    },
    build: {
        outDir: "build",
        rollupOptions: {
            output: {
                entryFileNames: "main.js", // Name the main output bundle as main.js
                chunkFileNames: "[name]-[hash].js", // Optional: Name for dynamic imports or shared chunks
                assetFileNames: "[name]-[hash].[ext]", // Optional: Name for assets like CSS or images
            },
        },
    },
});
