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
        outDir: "build",
        rollupOptions: {
            // Two entries: the v1 app at index.html and the MD 2.0 shell at
            // v2.html. They share the domain layer and nothing else.
            input: {
                main: "index.html",
                v2: "v2.html",
            },
            output: {
                entryFileNames: "main.js", // Name the main output bundle as main.js
                chunkFileNames: "[name]-[hash].js", // Optional: Name for dynamic imports or shared chunks
                assetFileNames: "[name]-[hash].[ext]", // Optional: Name for assets like CSS or images
            },
        },
    },
});
