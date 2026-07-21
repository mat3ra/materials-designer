import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import React, { useEffect, useRef, useState } from "react";

import { theme } from "../../settings";
import type { ReplError } from "./PyodideReplSession";

interface ReplConsoleProps {
    /** Accumulated stdout + system log lines (scrollback). */
    output: string;
    /** Structured Python error from the last run, or null. Rendered Jupyter-style. */
    error: ReplError | null;
    /** Clear scrollback + error. */
    onClear: () => void;
}

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

/** Jupyter/nbformat-style error: bold `ename: evalue`, with the cleaned traceback collapsible below. */
function ErrorBlock({ error }: { error: ReplError }) {
    return (
        <Box
            sx={{
                mt: 1,
                p: 1,
                borderLeft: `3px solid ${theme.palette.error.main}`,
                background: "rgba(244, 67, 54, 0.08)",
            }}
        >
            <Box
                component="div"
                sx={{ color: theme.palette.error.main, fontWeight: 700, whiteSpace: "pre-wrap" }}
            >
                {error.ename}: {error.evalue}
            </Box>
            {error.traceback && (
                <Box
                    component="details"
                    open
                    sx={{
                        mt: 0.5,
                        "& summary": {
                            cursor: "pointer",
                            color: theme.palette.text.secondary,
                            fontSize: "0.72rem",
                        },
                    }}
                >
                    <Box component="summary">Traceback</Box>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            mt: 0.5,
                            whiteSpace: "pre-wrap",
                            color: theme.palette.error.light,
                        }}
                    >
                        {error.traceback}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

/**
 * Output console for the REPL: stdout scrollback plus — when the last run failed — a Jupyter/nbformat
 * style error block (bold `ename: evalue` headline + collapsible traceback).
 *
 * Deliberately layout-agnostic and resize-free: it fills whatever height its parent gives it (flex)
 * and only owns its own collapsed/expanded state. Sizing/splitting is the parent's job today and the
 * mosaic tile's job next — so nothing here becomes redundant when the tiling layout lands.
 */
function ReplConsole({ output, error, onClear }: ReplConsoleProps) {
    const [open, setOpen] = useState(true);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to the newest line whenever output or the error changes.
    useEffect(() => {
        const body = bodyRef.current;
        if (open && body) body.scrollTop = body.scrollHeight;
    }, [output, error, open]);

    const border = `1px solid ${theme.palette.grey[800]}`;
    const hasContent = Boolean(output) || Boolean(error);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                // Take a share of the panel when open; shrink to just the header bar when collapsed.
                flex: open ? "1 1 40%" : "0 0 auto",
                borderTop: border,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1, py: 0.25 }}>
                <IconButton size="small" onClick={() => setOpen((v) => !v)} sx={{ p: 0.25 }}>
                    <IconByName name={open ? "actions.collapse" : "actions.expand"} />
                </IconButton>
                <Typography
                    variant="caption"
                    sx={{ flexGrow: 1, color: theme.palette.text.secondary }}
                >
                    Console
                    {error && (
                        <Box component="span" sx={{ color: theme.palette.error.main, ml: 1 }}>
                            ● {error.ename}
                        </Box>
                    )}
                </Typography>
                <Button size="small" color="secondary" disabled={!hasContent} onClick={onClear}>
                    Clear
                </Button>
            </Stack>
            {open && (
                <Box
                    ref={bodyRef}
                    id="python-repl-output"
                    sx={{
                        flex: "1 1 auto",
                        minHeight: 0,
                        overflowY: "auto",
                        px: 1,
                        pb: 1,
                        fontFamily: MONO,
                        fontSize: "0.78rem",
                        lineHeight: 1.5,
                    }}
                >
                    {output && (
                        <Box component="pre" sx={{ m: 0, whiteSpace: "pre-wrap" }}>
                            {output}
                        </Box>
                    )}
                    {error && <ErrorBlock error={error} />}
                    {!hasContent && (
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                            Output and errors appear here.
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
}

export default ReplConsole;
