/**
 * Timeline — the operation log made visible.
 *
 * This is the spine's UI: each chip is one recorded operation, carrying its
 * engine badge, parameter digest and result delta. Clicking a step reverts to
 * it (itself an undoable change), which is what replaces v1's Reset.
 */
import React from "react";

import type { MaterialDoc } from "../core/types";

export interface TimelineProps {
    doc: MaterialDoc;
    onRevertTo: (step: number) => void;
    onFork: (step: number) => void;
    /** Re-open a step's panel, pre-filled — the parametric half of the design. */
    onEditStep: (step: number) => void;
    /** Operation types that have a panel to edit them with. */
    editableTypes: Set<string>;
    editingStep?: number | null;
}

const ENGINE_LABEL: Record<string, string> = {
    native: "NATIVE",
    manual: "MANUAL",
    notebook: "NOTEBOOK",
    repl: "REPL",
    ai: "AI",
};

export function Timeline({
    doc,
    onRevertTo,
    onFork,
    onEditStep,
    editableTypes,
    editingStep,
}: TimelineProps) {
    return (
        <div className="md2-timeline">
            <div className="md2-tl-head">
                <span className="md2-htitle">TIMELINE</span>
                <span className="md2-count">{doc.log.length}</span>
            </div>
            <div className="md2-tl-body">
                <div className="md2-tl-rail" />
                {doc.log.map((op, index) => {
                    const previous = index > 0 ? doc.log[index - 1].result?.atomCount : undefined;
                    const current = op.result?.atomCount;
                    const changed =
                        previous !== undefined && current !== undefined && previous !== current;
                    const stale = op.status === "stale" || op.disabled;
                    const classes = [
                        "md2-chip",
                        index === 0 ? "md2-origin" : "",
                        stale ? "md2-stale" : "",
                        editingStep === index ? "md2-editing" : "",
                    ]
                        .filter(Boolean)
                        .join(" ");
                    return (
                        <div key={op.id} className={classes} data-testid="timeline-chip">
                            <div className="md2-chip-line">
                                <span className="md2-chip-title">{op.label}</span>
                                <span className={`md2-badge md2-badge-${op.engine}`}>
                                    {ENGINE_LABEL[op.engine] ?? op.engine}
                                </span>
                            </div>
                            {op.digest && <div className="md2-chip-params">{op.digest}</div>}
                            {changed && (
                                <div className="md2-chip-delta">
                                    {previous} → {current} atoms
                                </div>
                            )}
                            {stale && (
                                <div className="md2-chip-stale" data-testid="stale-chip">
                                    ⚠ skipped — an upstream edit invalidated this step
                                </div>
                            )}
                            <div className="md2-chip-acts">
                                {index > 0 && editableTypes.has(op.type) && (
                                    <button
                                        type="button"
                                        onClick={() => onEditStep(index)}
                                        title="Edit this step and replay the ones after it"
                                        data-testid="edit-step"
                                    >
                                        ✎ edit
                                    </button>
                                )}
                                {index < doc.log.length - 1 && (
                                    <button
                                        type="button"
                                        onClick={() => onRevertTo(index)}
                                        title="Revert to this step (undoable)"
                                    >
                                        ⟲ revert here
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={() => onFork(index + 1)}
                                    title="Fork a new material from this step"
                                >
                                    ⑂ fork
                                </button>
                            </div>
                        </div>
                    );
                })}
                <div className="md2-tl-now">NOW</div>
            </div>
        </div>
    );
}
