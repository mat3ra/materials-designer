import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import Box from "@mui/material/Box";
import React, { useEffect } from "react";

import type { MDMaterial } from "../../MDMaterial";
import type { MaterialsSyncPayload } from "./materialsDataBridge";
import { replSession } from "./MaterialsReplSession";

const DEFAULT_CODE = `# materials_in = the designer's list, material = the selected one.
# Helpers and enums are pre-imported. Shift+Enter to run.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])`;

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
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
    useEffect(() => {
        if (wheelBaseUrl) replSession.setWheelBaseUrl(wheelBaseUrl);
    }, [wheelBaseUrl]);

    useEffect(() => {
        replSession.connect(
            () => materials,
            () => activeIndex,
            onReplSync,
        );
    }, [materials, activeIndex, onReplSync]);

    return (
        <Box sx={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide}>
                <CovePythonRepl session={replSession} show={show} defaultCode={DEFAULT_CODE} />
            </ResizableDrawer>
        </Box>
    );
}

export default PythonReplPanel;
