import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import IframeToFromHostMessageHandler from "@mat3ra/cove/dist/other/iframe-messaging/IframeToFromHostMessageHandler";
import { Action } from "@mat3ra/esse/dist/js/types";
import Box from "@mui/material/Box";
import React, { useEffect, useRef } from "react";

import type { MDMaterial } from "../../MDMaterial";
import { PYODIDE_REPL_ORIGIN_URL } from "../../settings";
import type { MaterialsSyncPayload } from "./types";

const IFRAME_ID = "pyodide-repl-iframe";

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
    show: boolean;
    onHide: () => void;
    replOriginURL?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * The Python REPL drawer: an embedded pyodide-repl page (github.com/mat3ra/pyodide-repl), driven
 * over the same iframe data bridge as the JupyterLite session. All Pyodide and Python concerns live
 * in that page; this component only answers `get-data` with the designer's materials and routes the
 * page's `set-data` sync payloads into the reducer.
 *
 * Stays mounted while hidden — the page's ~30 s Python environment survives closing the drawer.
 */
function PythonReplPanel({
    materials,
    activeIndex,
    onReplSync,
    show,
    onHide,
    replOriginURL = PYODIDE_REPL_ORIGIN_URL,
    containerRef,
}: PythonReplPanelProps) {
    // Refs, not handler re-registration: the designer's state changes every edit, and the bridge
    // handlers must always read the current value without being torn down mid-conversation.
    const materialsRef = useRef(materials);
    materialsRef.current = materials;
    const activeIndexRef = useRef(activeIndex);
    activeIndexRef.current = activeIndex;
    const onReplSyncRef = useRef(onReplSync);
    onReplSyncRef.current = onReplSync;

    useEffect(() => {
        const messageHandler = new IframeToFromHostMessageHandler();
        messageHandler.init(replOriginURL, IFRAME_ID);
        // The REPL asks before every run; the reply is this handler's return value.
        messageHandler.addHandlers(Action.getData, [
            () => ({
                materials: materialsRef.current.map((material) => material.toJSON()),
                selectedIndex: activeIndexRef.current,
            }),
        ]);
        // The REPL reports every public Material binding after every run, under its sync scope.
        messageHandler.addHandlers(Action.setData, [
            (payload: Partial<MaterialsSyncPayload>) => {
                if (typeof payload?.syncScope === "string" && Array.isArray(payload.entities)) {
                    onReplSyncRef.current(payload as MaterialsSyncPayload);
                }
            },
        ]);
        return () => messageHandler.destroy();
    }, [replOriginURL]);

    return (
        <Box sx={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide} containerRef={containerRef}>
                <iframe
                    id={IFRAME_ID}
                    title="Python REPL"
                    src={replOriginURL}
                    sandbox="allow-scripts allow-same-origin allow-downloads"
                    width="100%"
                    height="100%"
                    style={{ border: "none" }}
                />
            </ResizableDrawer>
        </Box>
    );
}

export default PythonReplPanel;
