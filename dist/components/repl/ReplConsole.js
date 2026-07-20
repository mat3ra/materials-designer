import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import IconByName from "@exabyte-io/cove.js/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, useRef, useState } from "react";
import { theme } from "../../settings";
const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
/** Jupyter/nbformat-style error: bold `ename: evalue`, with the cleaned traceback collapsible below. */
function ErrorBlock({ error }) {
    return (_jsxs(Box, { sx: {
            mt: 1,
            p: 1,
            borderLeft: `3px solid ${theme.palette.error.main}`,
            background: "rgba(244, 67, 54, 0.08)",
        }, children: [_jsxs(Box, { component: "div", sx: { color: theme.palette.error.main, fontWeight: 700, whiteSpace: "pre-wrap" }, children: [error.ename, ": ", error.evalue] }), error.traceback && (_jsxs(Box, { component: "details", open: true, sx: {
                    mt: 0.5,
                    "& summary": {
                        cursor: "pointer",
                        color: theme.palette.text.secondary,
                        fontSize: "0.72rem",
                    },
                }, children: [_jsx(Box, { component: "summary", children: "Traceback" }), _jsx(Box, { component: "pre", sx: {
                            m: 0,
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            color: theme.palette.error.light,
                        }, children: error.traceback })] }))] }));
}
/**
 * Output console for the REPL: stdout scrollback plus — when the last run failed — a Jupyter/nbformat
 * style error block (bold `ename: evalue` headline + collapsible traceback).
 *
 * Deliberately layout-agnostic and resize-free: it fills whatever height its parent gives it (flex)
 * and only owns its own collapsed/expanded state. Sizing/splitting is the parent's job today and the
 * mosaic tile's job next — so nothing here becomes redundant when the tiling layout lands.
 */
function ReplConsole({ output, error, onClear }) {
    const [open, setOpen] = useState(true);
    const bodyRef = useRef(null);
    // Auto-scroll to the newest line whenever output or the error changes.
    useEffect(() => {
        const body = bodyRef.current;
        if (open && body)
            body.scrollTop = body.scrollHeight;
    }, [output, error, open]);
    const border = `1px solid ${theme.palette.grey[800]}`;
    const hasContent = Boolean(output) || Boolean(error);
    return (_jsxs(Box, { sx: {
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            // Take a share of the panel when open; shrink to just the header bar when collapsed.
            flex: open ? "1 1 40%" : "0 0 auto",
            borderTop: border,
        }, children: [_jsxs(Stack, { direction: "row", alignItems: "center", spacing: 0.5, sx: { px: 1, py: 0.25 }, children: [_jsx(IconButton, { size: "small", onClick: () => setOpen((v) => !v), sx: { p: 0.25 }, children: _jsx(IconByName, { name: open ? "actions.collapse" : "actions.expand" }) }), _jsxs(Typography, { variant: "caption", sx: { flexGrow: 1, color: theme.palette.text.secondary }, children: ["Console", error && (_jsxs(Box, { component: "span", sx: { color: theme.palette.error.main, ml: 1 }, children: ["\u25CF ", error.ename] }))] }), _jsx(Button, { size: "small", color: "secondary", disabled: !hasContent, onClick: onClear, children: "Clear" })] }), open && (_jsxs(Box, { ref: bodyRef, id: "python-repl-output", sx: {
                    flex: "1 1 auto",
                    minHeight: 0,
                    overflowY: "auto",
                    px: 1,
                    pb: 1,
                    fontFamily: MONO,
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                }, children: [output && (_jsx(Box, { component: "pre", sx: { m: 0, whiteSpace: "pre-wrap" }, children: output })), error && _jsx(ErrorBlock, { error: error }), !hasContent && (_jsx(Typography, { variant: "caption", sx: { color: theme.palette.text.disabled }, children: "Output and errors appear here." }))] }))] }));
}
export default ReplConsole;
