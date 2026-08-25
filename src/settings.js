import { DarkMaterialUITheme } from "@mat3ra/cove/dist/theme";

export const theme = DarkMaterialUITheme;
// TEMPORARY [SOF-8034]: pinned to the jupyterlite#93 deploy preview, which builds its content from
// the api-examples SOF-8034 branch and installs the `made` pre-release wheel from made#297. The
// VITE_* path below only works where vite injects it -- consumers that bundle this package (web-app
// via rspack) get undefined and silently fall back to the default JupyterLite.
// Revert to the VITE_* lookup once made#297 and api-examples#361 merge.
export const JUPYTERLITE_ORIGIN_URL = "https://deploy-preview-93--mat3ra-jupyterlite.netlify.app";
