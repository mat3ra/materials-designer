/**
 * host.tsx against the transpiled package instead of the source tree.
 *
 * Everything is imported through `dist/exports.js`, which is the entry point named in
 * package.json — so this exercises the same resolution web-app performs, including the relative
 * stylesheet path that `copy-css` has to satisfy.
 */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import React from "react";
import ReactDOM from "react-dom";

// eslint-disable-next-line import/no-relative-packages
import { MaterialsDesignerContainer } from "../../../dist/exports";

JSONSchemasInterface.setSchemas(allSchemas as never);

ReactDOM.render(<MaterialsDesignerContainer />, document.getElementById("md-slot"), () => {
    (window as unknown as { MD_EMBED_READY: boolean }).MD_EMBED_READY = true;
});
