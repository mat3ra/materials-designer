/**
 * Standalone entry for MD 2.0.
 *
 * Mirrors src/index.jsx: ESSE schemas must be registered before any Material
 * toJSON()/clone() call. (A host embedding the app registers its own extended
 * set, which is why this lives in the entry point and not in a shared module.)
 */
// Roboto is self-hosted so standalone MD sets type identically to the platform,
// which loads the same family. See plan/ux-redesign/DESIGN-LANGUAGE.md.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@mat3ra/wave.js/dist/stylesheets/main.css";
import "./styles/md2.css";

import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import React from "react";
import ReactDOM from "react-dom";

import { App } from "./domain/MaterialsDesigner";

JSONSchemasInterface.setSchemas(allSchemas as never);

ReactDOM.render(<App />, document.getElementById("root"));
