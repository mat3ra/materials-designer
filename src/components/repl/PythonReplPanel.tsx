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
