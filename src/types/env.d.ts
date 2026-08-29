/**
 * Vite's `define` substitutes exactly these two expressions at build time - see the `define` block
 * in vite.config.mts. There is no `process` object in the browser, so only these two lookups are
 * declared: anything else spelled `process.env.*` would type-check here and then be `undefined` at
 * runtime. Add a key here and to vite.config.mts together, or not at all.
 */
declare const process: {
    env: {
        VITE_JUPYTERLITE_DEVELOPMENT_URL?: string;
        VITE_USE_JUPYTERLITE_DEV_URL?: string;
    };
};
