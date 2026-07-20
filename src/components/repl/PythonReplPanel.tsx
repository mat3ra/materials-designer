import Paper from "@mui/material/Paper";
import React from "react";

import type { MDMaterial } from "../../MDMaterial";
import { theme } from "../../settings";
import type { ReplSyncOperation } from "./PyodideReplSession";
import PythonRepl from "./PythonRepl";

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    wheelBaseUrl?: string;
}

/**
 * Placement wrapper for {@link PythonRepl}. Phase 1 docks it as a bottom panel so the 3D viewer
 * stays visible above while typing. Follow-up (Track A): a draggable splitter + a viewer↔middle
 * relocation toggle; Track B replaces this with a react-mosaic tile — neither touches PythonRepl.
 */
function PythonReplPanel({
    materials,
    activeIndex,
    onReplSync,
    show,
    wheelBaseUrl,
}: PythonReplPanelProps) {
    if (!show) return null;
    return (
        <Paper
            id="python-repl-panel"
            square
            sx={{
                height: 320,
                borderTop: `2px solid ${theme.palette.grey[800]}`,
            }}
        >
            <PythonRepl
                materials={materials}
                activeIndex={activeIndex}
                onReplSync={onReplSync}
                show={show}
                wheelBaseUrl={wheelBaseUrl}
            />
        </Paper>
    );
}

export default PythonReplPanel;
