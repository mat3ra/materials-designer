/**
 * Standalone entry.
 *
 * ESSE schemas must be registered before any Material `toJSON()`/`clone()` call, which is why this
 * lives in the entry point rather than a shared module: a host embedding the app registers its own
 * extended set and must not have ours imposed on it.
 *
 * The page stylesheet is imported here and nowhere else. `src/embed` loads only md2.css, so a host
 * gets the app without getting our reset, our root sizing or our page background — see
 * plan/cutover/TEST-HOOKS.md, *The stylesheet must not touch the host*.
 */
// Roboto is self-hosted so standalone MD sets type identically to the platform,
// which loads the same family. See plan/ux-redesign/DESIGN-LANGUAGE.md.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@mat3ra/wave.js/dist/stylesheets/main.css";
import "./styles/page.css";
import "./styles/md2.css";

import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import React from "react";
import ReactDOM from "react-dom";

import { MaterialsDesigner } from "./domain/MaterialsDesigner";

JSONSchemasInterface.setSchemas(allSchemas as never);

ReactDOM.render(<MaterialsDesigner />, document.getElementById("root"));
