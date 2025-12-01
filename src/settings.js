import { DarkMaterialUITheme } from "@exabyte-io/cove.js/dist/theme";

export const theme = DarkMaterialUITheme;
const JUPYTERLITE_DEVELOPMENT_URL = process.env.VITE_JUPYTERLITE_DEVELOPMENT_URL;
export const JUPYTERLITE_ORIGIN_URL =
    process.env.VITE_USE_JUPYTERLITE_DEV_URL === "true" ? JUPYTERLITE_DEVELOPMENT_URL : undefined; // if not set, will use the default URL
