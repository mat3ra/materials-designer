/**
 * Runtime configuration, read once from the build-time environment.
 *
 * v1 kept this in `settings.js` and let `JUPYTERLITE_ORIGIN_URL` be `undefined`, relying on a
 * `defaultProps` further down to substitute the production origin. That worked only because the
 * consumer happened to be a class component; anything else received `undefined` and silently
 * failed the bridge's origin check. Here the default is applied at the source, so every consumer
 * gets a real origin.
 */
const JUPYTERLITE_PRODUCTION_ORIGIN = "https://jupyterlite.mat3ra.com";

// Vite substitutes these two expressions at build time (see `define` in vite.config.mts), so
// they are string literals in the bundle and `process` itself is never referenced at runtime.
declare const process: { env: Record<string, string | undefined> };

const developmentOrigin = process.env.VITE_JUPYTERLITE_DEVELOPMENT_URL;
const useDevelopmentOrigin = process.env.VITE_USE_JUPYTERLITE_DEV_URL === "true";

export const JUPYTERLITE_ORIGIN_URL: string =
    (useDevelopmentOrigin ? developmentOrigin : undefined) || JUPYTERLITE_PRODUCTION_ORIGIN;

/** The notebook the Console opens on. Configurable because its content lives in api-examples. */
export const DEFAULT_NOTEBOOK_PATH = "made/Introduction.ipynb";
