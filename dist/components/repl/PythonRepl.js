import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import { showErrorAlert } from "@exabyte-io/cove.js/dist/other/alerts";
import CodeMirror from "@exabyte-io/cove.js/dist/other/codemirror";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { theme } from "../../settings";
import { ExecutionStatus } from "../3d_editor/advanced_geometry/python_transformation/CodeExecutionControls";
import { makeReplCompletionSource } from "./completions";
import { replSession } from "./PyodideReplSession";
import ReplConsole from "./ReplConsole";
const DEFAULT_CODE = `# Materials from the designer are available as \`materials_in\` and \`material\`.
# All mat3ra.made.tools helpers are pre-imported — start typing (e.g. "create_") to autocomplete.
# Any Material you create or reassign is synced back into the list and viewer.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])
`;
const STATUS_LABEL = {
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
function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }) {
    const [status, setStatus] = useState(ExecutionStatus.Loading);
    const [code, setCode] = useState(DEFAULT_CODE);
    const [output, setOutput] = useState("");
    const [error, setError] = useState(null);
    // Keep latest materials for injection without re-binding callbacks.
    const materialsRef = useRef({ materials, activeIndex });
    materialsRef.current = { materials, activeIndex };
    // Stable Jedi-backed completion source: completes against the live namespace on each keystroke,
    // so it offers the user's variables/attributes as well as the pre-imported helpers (see completions.ts).
    const completionSource = useMemo(() => makeReplCompletionSource(replSession), []);
    const injectCurrentMaterials = useCallback(() => {
        const { materials: mats, activeIndex: idx } = materialsRef.current;
        if (!mats.length)
            return;
        // Inject in STABLE list order so `materials_in[0]` is always the first designer material.
        // Do NOT reorder active-first: after a run the active index moves to the REPL-created output,
        // which would otherwise feed that output back in as `materials_in[0]` on the next run
        // (e.g. build a supercell of the just-created defect). `material` still tracks the active one.
        replSession.injectMaterials(mats.map((m) => m.toJSON()), idx);
    }, []);
    // Load Pyodide + bootstrap the environment the first time the panel is shown.
    useEffect(() => {
        if (!show)
            return undefined;
        let cancelled = false;
        (async () => {
            try {
                if (wheelBaseUrl)
                    replSession.configure({ wheelBaseUrl });
                setOutput("");
                // Stream each bootstrap step into the output pane so the long first load is visibly
                // progressing (loading runtime → installing packages → importing helpers → ready).
                await replSession.load((message) => {
                    if (!cancelled)
                        setOutput((prev) => `${prev}${message}\n`);
                });
                if (cancelled)
                    return;
                injectCurrentMaterials();
                setStatus(ExecutionStatus.Idle);
            }
            catch (error) {
                if (cancelled)
                    return;
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
        if (show && replSession.isInitialized)
            injectCurrentMaterials();
    }, [show, activeIndex, injectCurrentMaterials]);
    const runCode = useCallback(async () => {
        if (!replSession.isInitialized || replSession.isRunning)
            return;
        setStatus(ExecutionStatus.Running);
        setError(null);
        try {
            // Reload inputs from the designer before every run so `materials_in` always reflects the
            // current stash (never stale REPL outputs) — re-running the same code is idempotent.
            injectCurrentMaterials();
            const { output: runOutput, ok, error: runError } = await replSession.execute(code);
            if (runOutput)
                setOutput((prev) => prev + runOutput);
            if (ok) {
                const operations = replSession.collectChangedMaterials();
                if (operations.length)
                    onReplSync(operations);
                setStatus(ExecutionStatus.Ready);
            }
            else {
                setError(runError);
                setStatus(ExecutionStatus.Error);
            }
        }
        catch (err) {
            // Infra-level failure (not a user Python error, which the runner captures structurally).
            setStatus(ExecutionStatus.Error);
            showErrorAlert(err instanceof Error ? err.message : String(err));
        }
    }, [code, onReplSync, injectCurrentMaterials]);
    const isBusy = status === ExecutionStatus.Loading || status === ExecutionStatus.Running;
    return (_jsxs(Box, { id: "python-repl", sx: { display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }, 
        // Capture phase so we intercept Shift/Cmd/Ctrl+Enter BEFORE CodeMirror inserts a newline.
        onKeyDownCapture: (event) => {
            if (event.key === "Enter" && (event.shiftKey || event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                event.stopPropagation();
                runCode();
            }
        }, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 1, sx: { p: 1, borderBottom: `1px solid ${theme.palette.grey[800]}` }, children: [_jsx(Typography, { variant: "subtitle2", sx: { flexGrow: 1 }, children: "Python REPL" }), status === ExecutionStatus.Loading && _jsx(CircularProgress, { size: 16 }), _jsx(Chip, { size: "small", variant: "outlined", color: status === ExecutionStatus.Error ? "error" : "default", label: STATUS_LABEL[status] }), _jsxs(Button, { id: "python-repl-run", size: "small", variant: "contained", color: "success", disabled: isBusy, onClick: runCode, title: "Run (Shift+Enter)", children: ["Run", _jsx(IconByName, { name: "actions.play", sx: { ml: 0.5 } })] })] }), _jsx(Box, { sx: { flex: "1 1 auto", minHeight: 80, overflowY: "auto" }, children: _jsx(CodeMirror, { content: code, updateContent: setCode, options: { lineNumbers: true }, theme: "dark", language: "python", 
                    // cove.js types `completions` as non-nullable, but a CM6 source may return null.
                    completions: completionSource }) }), _jsx(ReplConsole, { output: output, error: error, onClear: () => {
                    setOutput("");
                    setError(null);
                } }), _jsx(Box, { id: "pyodide-plot-target-repl" })] }));
}
export default PythonRepl;
