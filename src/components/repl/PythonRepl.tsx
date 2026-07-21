import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import CodeMirror, { type CodeMirrorProps } from "@mat3ra/cove/dist/other/codemirror";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { MDMaterial } from "../../MDMaterial";
import { theme } from "../../settings";
import { ExecutionStatus } from "../3d_editor/advanced_geometry/python_transformation/CodeExecutionControls";
import { makeReplCompletionSource } from "./completions";
import { type ReplError, type ReplSyncOperation, replSession } from "./PyodideReplSession";
import DEFAULT_CODE from "./python/generated/default_snippet";
import ReplConsole from "./ReplConsole";

interface PythonReplProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    /** Override where prebuilt wheels are served from (default same-origin `/repl-wheels`). */
    wheelBaseUrl?: string;
}

const STATUS_LABEL: Record<ExecutionStatus, string> = {
    [ExecutionStatus.Loading]: "Preparing Python environment…",
    [ExecutionStatus.Idle]: "Ready",
    [ExecutionStatus.Running]: "Running…",
    [ExecutionStatus.Ready]: "Ready",
    [ExecutionStatus.Error]: "Error",
};

/**
 * Layout-agnostic terminal-like Python REPL. Renders the loader + editor + output and delegates all
 * Pyodide work to the {@link replSession} singleton. On run it executes in the persistent namespace,
 * collects the Materials that changed, and hands them to `onReplSync` for the reducer to upsert.
 */
function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }: PythonReplProps) {
    const [status, setStatus] = useState<ExecutionStatus>(ExecutionStatus.Loading);
    const [code, setCode] = useState<string>(DEFAULT_CODE);
    const [output, setOutput] = useState<string>("");
    const [error, setError] = useState<ReplError | null>(null);
    // Keep latest materials for injection without re-binding callbacks.
    const materialsRef = useRef({ materials, activeIndex });
    materialsRef.current = { materials, activeIndex };

    // Stable Jedi-backed completion source: completes against the live namespace on each keystroke,
    // so it offers the user's variables/attributes as well as the pre-imported helpers (see completions.ts).
    const completionSource = useMemo(() => makeReplCompletionSource(replSession), []);

    const injectCurrentMaterials = useCallback(() => {
        const { materials: mats, activeIndex: idx } = materialsRef.current;
        if (!mats.length) return;
        // Inject in STABLE list order so `materials_in[0]` is always the first designer material.
        // Do NOT reorder active-first: after a run the active index moves to the REPL-created output,
        // which would otherwise feed that output back in as `materials_in[0]` on the next run
        // (e.g. build a supercell of the just-created defect). `material` still tracks the active one.
        replSession.injectMaterials(
            mats.map((m) => m.toJSON()),
            idx,
        );
    }, []);

    // Load Pyodide + bootstrap the environment the first time the panel is shown.
    useEffect(() => {
        if (!show) return undefined;
        let cancelled = false;
        (async () => {
            try {
                if (wheelBaseUrl) replSession.configure({ wheelBaseUrl });
                setOutput("");
                // Stream each bootstrap step into the output pane so the long first load is visibly
                // progressing (loading runtime → installing packages → importing helpers → ready).
                await replSession.load((message) => {
                    if (!cancelled) setOutput((prev) => `${prev}${message}\n`);
                });
                if (cancelled) return;
                injectCurrentMaterials();
                setStatus(ExecutionStatus.Idle);
            } catch (error) {
                if (cancelled) return;
                setStatus(ExecutionStatus.Error);
                showErrorAlert(error instanceof Error ? error.message : String(error));
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [show, wheelBaseUrl, injectCurrentMaterials]);

    // Refresh injected inputs whenever the active material changes while the panel is ready/open.
    useEffect(() => {
        if (show && replSession.isInitialized) injectCurrentMaterials();
    }, [show, activeIndex, injectCurrentMaterials]);

    const runCode = useCallback(async () => {
        if (!replSession.isInitialized || replSession.isRunning) return;
        setStatus(ExecutionStatus.Running);
        setError(null);
        try {
            // Reload inputs from the designer before every run so `materials_in` always reflects the
            // current stash (never stale REPL outputs) — re-running the same code is idempotent.
            injectCurrentMaterials();
            const { output: runOutput, ok, error: runError } = await replSession.execute(code);
            if (runOutput) setOutput((prev) => prev + runOutput);
            if (ok) {
                const operations = replSession.collectChangedMaterials();
                if (operations.length) onReplSync(operations);
                setStatus(ExecutionStatus.Ready);
            } else {
                setError(runError);
                setStatus(ExecutionStatus.Error);
            }
        } catch (err) {
            // Infra-level failure (not a user Python error, which the runner captures structurally).
            setStatus(ExecutionStatus.Error);
            showErrorAlert(err instanceof Error ? err.message : String(err));
        }
    }, [code, onReplSync, injectCurrentMaterials]);

    const isBusy = status === ExecutionStatus.Loading || status === ExecutionStatus.Running;

    return (
        <Box
            id="python-repl"
            sx={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
            // Capture phase so we intercept Shift/Cmd/Ctrl+Enter BEFORE CodeMirror inserts a newline.
            onKeyDownCapture={(event) => {
                if (event.key === "Enter" && (event.shiftKey || event.metaKey || event.ctrlKey)) {
                    event.preventDefault();
                    event.stopPropagation();
                    runCode();
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
                {status === ExecutionStatus.Loading && <CircularProgress size={16} />}
                <Chip
                    size="small"
                    variant="outlined"
                    color={status === ExecutionStatus.Error ? "error" : "default"}
                    label={STATUS_LABEL[status]}
                />
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
                    <IconByName name="actions.play" sx={{ ml: 0.5 }} />
                </Button>
            </Stack>
            <Box sx={{ flex: "1 1 auto", minHeight: 80, overflowY: "auto" }}>
                <CodeMirror
                    content={code}
                    updateContent={setCode}
                    options={{ lineNumbers: true }}
                    theme="dark"
                    language="python"
                    // cove.js types `completions` as non-nullable, but a CM6 source may return null.
                    completions={completionSource as CodeMirrorProps["completions"]}
                />
            </Box>
            <ReplConsole
                output={output}
                error={error}
                onClear={() => {
                    setOutput("");
                    setError(null);
                }}
            />
            {/* matplotlib target, per https://github.com/pyodide/matplotlib-pyodide */}
            <Box id="pyodide-plot-target-repl" />
        </Box>
    );
}

export default PythonRepl;
