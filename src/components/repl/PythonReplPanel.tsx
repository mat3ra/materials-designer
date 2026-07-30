import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import Box from "@mui/material/Box";
import React from "react";

import type { MDMaterial } from "../../MDMaterial";
import type { ReplSyncOperation } from "./MaterialsReplSession";
import PythonRepl from "./PythonRepl";

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
}

/**
 * Hidden with `display: none` rather than unmounted, so the ~30s Pyodide environment and the REPL's
 * persistent namespace survive the panel being toggled closed and open again.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer's own default. Passing it makes ResizableDrawer
 * position the paper absolutely against the MD container, which leaves it stuck ~100px above the
 * viewport bottom; without it the paper stays viewport-fixed at the bottom, which is what we want.
 */
function PythonReplPanel({
    materials,
    activeIndex,
    onReplSync,
    show,
    onHide,
    wheelBaseUrl,
}: PythonReplPanelProps) {
    return (
        <Box sx={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide}>
                <PythonRepl
                    materials={materials}
                    activeIndex={activeIndex}
                    onReplSync={onReplSync}
                    show={show}
                    wheelBaseUrl={wheelBaseUrl}
                />
            </ResizableDrawer>
        </Box>
    );
}

export default PythonReplPanel;
