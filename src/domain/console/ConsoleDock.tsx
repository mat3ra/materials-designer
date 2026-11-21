/**
 * Console dock — one home for the code surfaces.
 *
 * v1 had three disconnected ones (a JupyterLite drawer, a notebook transformation dialog, and an
 * incoming Pyodide REPL). In 2.0 they are tabs of one dock: Script (the timeline as runnable
 * Python), Log (the operations themselves), and Notebook and REPL — both JupyterLite, both over
 * the same materials bridge.
 *
 * The dock has two heights. Script and Log are readouts and sit in the 190px strip; Notebook and
 * REPL are places you work, and take the centre column. Which one a tab wants is a property of the
 * tab, not a preference — nobody wants a notebook in a 190px window.
 */
import React from "react";

import type { MaterialDoc } from "../../core/types";
import { type AdoptOutputs, type NotebookInput, NotebookTab } from "./NotebookTab";
import { ReplTab } from "./ReplTab";

export type ConsoleTab = "script" | "log" | "notebook" | "repl";

/** Tabs that need the room. Used to pick the dock's height when a tab is opened. */
export const TALL_TABS: ConsoleTab[] = ["notebook", "repl"];

/** Tabs that bind the session's materials over the bridge, and so need them serialised. */
export const BRIDGED_TABS: ConsoleTab[] = ["notebook", "repl"];

const TAB_LABELS: Record<ConsoleTab, string> = {
    script: "⌁ Script",
    log: "☰ Log",
    notebook: "▤ Notebook",
    repl: "▷ REPL",
};

export interface ConsoleDockProps {
    doc: MaterialDoc;
    materialName: string;
    tab: ConsoleTab;
    open: boolean;
    onTabChange: (tab: ConsoleTab) => void;
    onOpenChange: (open: boolean) => void;
    /** Whether the dock currently has the window to itself. */
    maximised: boolean;
    onToggleMaximised: () => void;
    /** Every material the session holds, as the notebook needs to see them. */
    notebookInputs: NotebookInput[];
    activeMaterialId: string;
    onAddFromNotebook: AdoptOutputs;
    onError: (message: string) => void;
}

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

export function ConsoleDock({
    doc,
    materialName,
    tab,
    open,
    onTabChange,
    onOpenChange,
    maximised,
    onToggleMaximised,
    notebookInputs,
    activeMaterialId,
    onAddFromNotebook,
    onError,
}: ConsoleDockProps) {
    const tall = open && (maximised || TALL_TABS.includes(tab));

    return (
        <div
            className={`md2-console${open ? " md2-open" : ""}${tall ? " md2-console-tall" : ""}`}
            data-console-tab={open ? tab : "none"}
        >
            <div className="md2-console-tabs">
                <span className="md2-clabel">CONSOLE</span>
                {(Object.keys(TAB_LABELS) as ConsoleTab[]).map((name) => (
                    <button
                        type="button"
                        key={name}
                        className={`md2-ctab${tab === name && open ? " md2-on" : ""}`}
                        data-command={`console.${name}`}
                        onClick={() => {
                            onTabChange(name);
                            onOpenChange(true);
                        }}
                    >
                        {TAB_LABELS[name]}
                    </button>
                ))}
                <span className="md2-spacer" />
                {/* Maximise rather than move: a notebook needs more width than either side column
                    could give it, and relocating the dock would remount its frame and take a
                    running kernel with it. So everything else gets out of the way instead. */}
                <button
                    type="button"
                    className="md2-ctab"
                    data-command="console.maximise"
                    aria-pressed={maximised}
                    onClick={onToggleMaximised}
                    title={maximised ? "Restore the layout" : "Give the console the whole window"}
                    aria-label={maximised ? "Restore the layout" : "Maximise the console"}
                >
                    {maximised ? "⤡" : "⤢"}
                </button>
                <button
                    type="button"
                    className="md2-ctab"
                    onClick={() => onOpenChange(!open)}
                    aria-label={open ? "Collapse console" : "Expand console"}
                >
                    {open ? "▾" : "▴"}
                </button>
            </div>
            {open && (
                <div className={`md2-console-body${tall ? " md2-console-body-tall" : ""}`}>
                    {tab === "script" && (
                        <pre className="md2-code" data-testid="script-tab">
                            {logAsPython(doc, materialName)}
                        </pre>
                    )}
                    {tab === "log" && (
                        <pre className="md2-code" data-testid="log-tab">
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
                    {/* Mounted only while showing: unmounting reloads JupyterLite at its default
                        notebook, which is what re-opening the surface is expected to do. */}
                    {tab === "notebook" && (
                        <NotebookTab
                            inputs={notebookInputs}
                            activeId={activeMaterialId}
                            onAdd={onAddFromNotebook}
                            onError={onError}
                        />
                    )}
                    {tab === "repl" && (
                        <ReplTab
                            inputs={notebookInputs}
                            activeId={activeMaterialId}
                            onAdd={onAddFromNotebook}
                            onError={onError}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
