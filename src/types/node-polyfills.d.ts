/**
 * `vite-plugin-node-polyfills` makes a handful of Node builtins available in the browser bundle.
 * Only what this app actually imports is declared, rather than pulling in all of `@types/node`:
 * a browser app that can type-check `fs` or `child_process` is one refactor away from importing
 * something the polyfill does not provide.
 */
declare module "path" {
    export function extname(p: string): string;
    const path: { extname: typeof extname };
    export default path;
}
