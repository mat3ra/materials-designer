/**
 * Console dock — one home for the code surfaces.
 *
 * v1 had three disconnected ones (a JupyterLite drawer, a notebook
 * transformation dialog, and an incoming Pyodide REPL). In 2.0 they are tabs of
 * one dock; the MVP ships the Script tab live (the timeline as runnable Python)
 * and marks the rest as not-yet-wired rather than faking them.
 */
import React, { useState } from "react";

import type { MaterialDoc } from "../state/types";

export interface ConsoleDockProps {
    doc: MaterialDoc;
    materialName: string;
}

type Tab = "script" | "log" | "repl" | "notebook";

/** Render the operation log as a runnable script — provenance you can re-execute. */
export function logAsPython(doc: MaterialDoc, materialName: string): string {
    const lines = [
        "# Generated from the Materials Designer operation log.",
        "from mat3ra.made.tools import build",
        "",
        `# material: ${materialName}`,
    ];
    doc.log.forEach((op, index) => {
        const params = JSON.stringify(op.params, (key, value) =>
            key === "basis" || key === "config" ? "…" : value,
        );
        lines.push(`# step ${index + 1}: ${op.label}${op.digest ? ` — ${op.digest}` : ""}`);
        lines.push(`material = apply("${op.type}", material, ${params})`);
    });
    return lines.join("\n");
}

export function ConsoleDock({ doc, materialName }: ConsoleDockProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<Tab>("script");

    return (
        <div className={`md2-console${open ? " md2-open" : ""}`}>
            <div className="md2-console-tabs">
                <span className="md2-clabel">CONSOLE</span>
                {(["script", "log", "repl", "notebook"] as Tab[]).map((name) => (
                    <button
                        type="button"
                        key={name}
                        className={`md2-ctab${tab === name && open ? " md2-on" : ""}`}
                        onClick={() => {
                            setTab(name);
                            setOpen(true);
                        }}
                    >
                        {name === "script" && "⌁ Script"}
                        {name === "log" && "☰ Log"}
                        {name === "repl" && "▷ REPL"}
                        {name === "notebook" && "📓 Notebook"}
                    </button>
                ))}
                <span className="md2-spacer" />
                <button
                    type="button"
                    className="md2-ctab"
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? "Collapse console" : "Expand console"}
                >
                    {open ? "▾" : "▴"}
                </button>
            </div>
            {open && (
                <div className="md2-console-body">
                    {tab === "script" && (
                        <pre className="md2-code" data-testid="script-tab">
                            {logAsPython(doc, materialName)}
                        </pre>
                    )}
                    {tab === "log" && (
                        <pre className="md2-code">
                            {doc.log
                                .map(
                                    (op, i) =>
                                        `${i + 1}. ${op.label} [${op.engine}/${op.source}] ${
                                            op.digest ?? ""
                                        }  -> ${op.result?.atomCount ?? "?"} atoms`,
                                )
                                .join("\n")}
                        </pre>
                    )}
                    {(tab === "repl" || tab === "notebook") && (
                        <div className="md2-console-stub">
                            <b>Not wired in the MVP.</b>
                            <p>
                                The {tab === "repl" ? "Pyodide REPL" : "JupyterLite notebook"}{" "}
                                surface exists in the codebase already
                                {tab === "repl"
                                    ? " (PR #294) and binds materials in and out"
                                    : " (the v1 drawer)"}
                                . Docking it here is Phase 2 work: results sync back as operations
                                tagged with the {tab} engine, so they land in the Timeline like
                                everything else.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
