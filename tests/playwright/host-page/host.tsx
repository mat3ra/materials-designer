/**
 * Mounts the embedded container the way web-app does — as a component on a page that is not ours.
 * Nothing here styles the host; if the host's appearance moves, the embed did it.
 *
 * Deliberately importing no stylesheet of our own, not even wave.js's: both entry points
 * (`index.jsx` and `main-v2.tsx`) import it as page chrome and the container never has, in v1 or
 * in 2.0, so in web-app it arrives from the platform. Importing it here would move this page's
 * font and margin and be reported as a leak that the platform never sees.
 */
import JSONSchemasInterface from "@mat3ra/esse/dist/js/esse/JSONSchemasInterface";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import React from "react";
import ReactDOM from "react-dom";

import { MaterialsDesignerContainer } from "../../../src/embed/MaterialsDesignerContainer";

JSONSchemasInterface.setSchemas(allSchemas as never);

const slot = document.getElementById("md-slot");
ReactDOM.render(<MaterialsDesignerContainer />, slot, () => {
    (window as unknown as { MD_EMBED_READY: boolean }).MD_EMBED_READY = true;
});
