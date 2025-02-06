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
    },
    server: {
        port: 3001,
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
