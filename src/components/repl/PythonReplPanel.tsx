import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
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
 * Docks the REPL in cove's bottom drawer, like the JupyterLite session. Stays mounted (hidden) when
 * closed so the Pyodide session survives toggling.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer. Passing it positions the drawer absolutely
 * inside the MD container, leaving it stuck ~100px above the viewport bottom.
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
        <div style={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide}>
                <PythonRepl
                    materials={materials}
                    activeIndex={activeIndex}
                    onReplSync={onReplSync}
                    show={show}
                    wheelBaseUrl={wheelBaseUrl}
                />
            </ResizableDrawer>
        </div>
    );
}

export default PythonReplPanel;
