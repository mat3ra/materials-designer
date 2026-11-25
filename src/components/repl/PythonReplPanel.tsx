import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import IframeToFromHostMessageHandler from "@mat3ra/cove/dist/other/iframe-messaging/IframeToFromHostMessageHandler";
import { Action } from "@mat3ra/esse/dist/js/types";
import Box from "@mui/material/Box";
import React, { useEffect, useRef } from "react";

import type { MDMaterial } from "../../MDMaterial";
import { PYODIDE_REPL_ORIGIN_URL } from "../../settings";
import { MADE_REPL_CONFIG } from "./madeReplConfig";
import type { MaterialsSyncPayload } from "./types";

const IFRAME_ID = "pyodide-repl-iframe";

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
    show: boolean;
    onHide: () => void;
    replOriginURL?: string;
    /** What the generic REPL page should install and run; see madeReplConfig. */
    replConfig?: object;
    containerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * The Python REPL drawer: an embedded pyodide-repl page (github.com/mat3ra/pyodide-repl), driven
 * over the same iframe data bridge as the JupyterLite session. That page is generic — everything
 * material-specific reaches it as configuration from here (see madeReplConfig), and this component
 * only answers `get-data` and routes the page's `set-data` payloads into the reducer.
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
    replConfig = MADE_REPL_CONFIG,
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
    const replConfigRef = useRef(replConfig);
    replConfigRef.current = replConfig;

    useEffect(() => {
        const messageHandler = new IframeToFromHostMessageHandler();
        messageHandler.init(replOriginURL, IFRAME_ID);
        // The page asks on load and before every run; the reply is this handler's return value.
        // `config` sets the generic REPL up (read once); `data` is this app's current state.
        messageHandler.addHandlers(Action.getData, [
            () => ({
                config: replConfigRef.current,
                data: {
                    materials: materialsRef.current.map((material) => material.toJSON()),
                    selectedIndex: activeIndexRef.current,
                },
            }),
        ]);
        // The page forwards whatever this app's own afterRunCode produced — see madeReplConfig.
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
