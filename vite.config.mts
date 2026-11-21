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
    build: {
        // One entry again: index.html is the app. The two-input block that used to live here
        // existed only to keep v1 and /v2.html from colliding over the same chunk name.
        outDir: "build",
    },
});
