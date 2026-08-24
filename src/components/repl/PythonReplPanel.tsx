import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import CodeMirror from "@mat3ra/cove/dist/other/codemirror/CodeMirror";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useRef, useState } from "react";

import type { MDMaterial } from "../../MDMaterial";
import {
    type MaterialsSyncPayload,
    MATERIALS_PREAMBLE,
    pullMaterialsFromNamespace,
    pushMaterialsIntoNamespace,
} from "./materialsBinding";
import {
    type Pyodide,
    buildMaterialsReplEnvironment,
    loadPyodideRuntime,
    REPL_DEFAULT_WHEEL_BASE_URL,
} from "./pyodideEnvironment";

const DEFAULT_CODE = `# materials_in = the designer's list, material = the selected one.
# mat3ra.made.tools helpers are pre-imported. Shift+Enter to run.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])`;

const STATUS_LABEL = {
    loading: "Preparing Python environment…",
    ready: "Ready",
    running: "Running…",
    error: "Error",
} as const;

type ReplStatus = keyof typeof STATUS_LABEL;

interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
}

/**
 * The Python REPL drawer: editor, Run, plain text output. Stays mounted while hidden so the ~30 s
 * environment survives closing the panel; `show` only drives the drawer.
 *
 * TODO(repl-v3): the generic parts here (editor, run, output, status) graduate to cove as a
 * reusable PythonRepl; this file then keeps only the materials wiring. Completions arrive with
 * repl-v2. See agents/plan/repl-minimal-architecture.md §5.
 */
function PythonReplPanel({
    materials,
    activeIndex,
    onReplSync,
    show,
    onHide,
    wheelBaseUrl = REPL_DEFAULT_WHEEL_BASE_URL,
    containerRef,
}: PythonReplPanelProps) {
    const theme = useTheme();
    const [status, setStatus] = useState<ReplStatus>("loading");
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState("");
    const pyodideRef = useRef<Pyodide | null>(null);
    const environmentStartedRef = useRef(false);

    // Props change every designer edit; refs keep the run callback from going stale without
    // re-creating it (and the CodeMirror beneath it) on each render.
    const materialsRef = useRef(materials);
    materialsRef.current = materials;
    const activeIndexRef = useRef(activeIndex);
    activeIndexRef.current = activeIndex;
    const onReplSyncRef = useRef(onReplSync);
    onReplSyncRef.current = onReplSync;

    const appendOutput = useCallback((text: string) => {
        setOutput((previous) => `${previous}${text}\n`);
    }, []);

    const initializeEnvironment = useCallback(
        async (pyodide: Pyodide) => {
            // stdout/stderr -> output pane, per https://pyodide.org/en/stable/usage/streams.html
            pyodide.setStdout({ batched: appendOutput });
            pyodide.setStderr({ batched: appendOutput });
            try {
                await buildMaterialsReplEnvironment(pyodide, wheelBaseUrl, appendOutput);
                appendOutput("Preparing material namespace…");
                await pyodide.runPythonAsync(MATERIALS_PREAMBLE);
                pyodideRef.current = pyodide;
                appendOutput("Environment ready.");
                setStatus("ready");
            } catch (error) {
                appendOutput(String(error));
                setStatus("error");
            }
        },
        [appendOutput, wheelBaseUrl],
    );

    const runCode = useCallback(async () => {
        const pyodide = pyodideRef.current;
        if (!pyodide) return;
        setStatus("running");
        try {
            await pushMaterialsIntoNamespace(pyodide, materialsRef.current, activeIndexRef.current);
            const result = await pyodide.runPythonAsync(code);
            // Echo the value of a trailing expression, REPL-style.
            if (result !== undefined && result !== null) appendOutput(String(result));
            setStatus("ready");
        } catch (error) {
            // Pyodide formats the Python traceback into the error message.
            appendOutput(String(error));
            setStatus("error");
        } finally {
            // Sync even after a failed run: code that raised halfway may still have produced
            // materials worth keeping.
            try {
                onReplSyncRef.current(await pullMaterialsFromNamespace(pyodide));
            } catch (syncError) {
                appendOutput(String(syncError));
            }
        }
    }, [appendOutput, code]);

    // Bootstrap on first open only; the environment (and window.pyodide) then lives for the page.
    useEffect(() => {
        if (!show || environmentStartedRef.current) return;
        environmentStartedRef.current = true;
        appendOutput("Loading Pyodide runtime from CDN…");
        loadPyodideRuntime()
            .then(initializeEnvironment)
            .catch((error) => {
                appendOutput(String(error));
                setStatus("error");
            });
    }, [show, initializeEnvironment, appendOutput]);

    const isBusy = status === "loading" || status === "running";

    return (
        <Box sx={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide} containerRef={containerRef}>
                <Box
                    id="python-repl"
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        overflow: "hidden",
                    }}
                    // Capture phase so Shift/Cmd/Ctrl+Enter runs BEFORE CodeMirror inserts a newline.
                    onKeyDownCapture={(event) => {
                        if (
                            event.key === "Enter" &&
                            (event.shiftKey || event.metaKey || event.ctrlKey)
                        ) {
                            event.preventDefault();
                            event.stopPropagation();
                            if (!isBusy) runCode();
                        }
                    }}
                >
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ p: 1, borderBottom: `1px solid ${theme.palette.grey[800]}` }}
                    >
                        <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
                            Python REPL
                        </Typography>
                        {isBusy && <CircularProgress size={16} />}
                        <Typography
                            variant="caption"
                            color={status === "error" ? "error" : "text.secondary"}
                        >
                            {STATUS_LABEL[status]}
                        </Typography>
                        <Button
                            id="python-repl-run"
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={isBusy}
                            onClick={runCode}
                            title="Run (Shift+Enter)"
                        >
                            Run
                        </Button>
                    </Stack>
                    <Box sx={{ flex: "1 1 auto", minHeight: 80, overflowY: "auto" }}>
                        <CodeMirror
                            content={code}
                            updateContent={setCode}
                            options={{ lineNumbers: true }}
                            theme={theme.palette.mode}
                            language="python"
                        />
                    </Box>
                    <Box
                        id="python-repl-output"
                        sx={{
                            flex: "0 0 40%",
                            minHeight: 0,
                            overflowY: "auto",
                            px: 1,
                            py: 0.5,
                            borderTop: `1px solid ${theme.palette.grey[800]}`,
                            fontFamily: "monospace",
                            fontSize: "0.78rem",
                            lineHeight: 1.5,
                            whiteSpace: "pre-wrap",
                        }}
                    >
                        {output || "Output appears here."}
                    </Box>
                </Box>
            </ResizableDrawer>
        </Box>
    );
}

export default PythonReplPanel;
