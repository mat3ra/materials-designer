import { DarkMaterialUITheme } from "@exabyte-io/cove.js/dist/theme";

export const theme = DarkMaterialUITheme;

// get from https://github.com/Exabyte-io/jupyterlite/pull/N
const JUPYTERLITE_DEVELOPMENT_URL = "https://deploy-preview-N--mat3ra-jupyterlite.netlify.app";

export const ORIGIN_URL = import.meta.env.USE_JUPYTERLITE_DEV_URL
    ? JUPYTERLITE_DEVELOPMENT_URL
    : undefined;
