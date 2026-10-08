import { DarkMaterialUITheme } from "@mat3ra/cove/dist/theme";

export const theme = DarkMaterialUITheme;
const JUPYTERLITE_DEVELOPMENT_URL = process.env.VITE_JUPYTERLITE_DEVELOPMENT_URL;
// The embedded Python REPL page (github.com/mat3ra/pyodide-repl). Point the env var at a local
// `vite preview` or a PR's deploy preview during development.
export const PYODIDE_REPL_ORIGIN_URL =
    process.env.VITE_PYODIDE_REPL_URL || "https://pyodide-repl.mat3ra.com";
export const JUPYTERLITE_ORIGIN_URL =
    process.env.VITE_USE_JUPYTERLITE_DEV_URL === "true" ? JUPYTERLITE_DEVELOPMENT_URL : undefined; // if not set, will use the default URL
