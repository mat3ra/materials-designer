/**
 * The basis, as text or as a table.
 *
 * v1 offered only XYZ text, which is unreadable past a handful of sites and gives constraints
 * nowhere to live. The table adds a per-site view with constraint checkboxes; both write through
 * the same `set-basis` operation, so the views cannot drift apart and the history records one kind
 * of step however the edit was made.
 */
import CodeMirror from "@mat3ra/cove/dist/other/codemirror/CodeMirror";
import React, { useEffect, useMemo, useState } from "react";

import { type BasisSite, emptySite, parseBasisXyz, serializeBasisXyz } from "./basis";

export interface BasisEditorProps {
    /** The material's basis as made.js renders it. */
    xyz: string;
    units: "crystal" | "cartesian";
    theme: "dark" | "light";
    onCommit: (xyz: string) => void;
}

type View = "text" | "table";

const AXES = ["x", "y", "z"] as const;

/**
 * A cell that lets you finish typing.
 *
 * Committing on every keystroke means the value is round-tripped through made.js and reformatted
 * mid-word: typing "0.4" becomes "0.000000" after the first character and nonsense after the
 * second. The cell keeps its own text while focused and writes through on blur, taking whatever
 * the material says whenever it is not being edited.
 */
/** A value worth writing through: something made.js can parse, or an element symbol. */
function isCommittable(value: string): boolean {
    const trimmed = value.trim();
    if (!trimmed) return false;
    return Number.isFinite(Number(trimmed)) || /^[A-Za-z]{1,3}$/.test(trimmed);
}

function CellInput({
    value,
    label,
    className,
    onCommit,
}: {
    value: string;
    label: string;
    className?: string;
    onCommit: (value: string) => void;
}) {
    const [draft, setDraft] = useState(value);
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (!editing) setDraft(value);
    }, [value, editing]);

    return (
        <input
            className={className}
            // Always render the draft. Showing the prop while unfocused looks equivalent, but a
            // driver that types before its focus event lands would then be fighting a controlled
            // value, and the keystrokes would be discarded.
            value={draft}
            aria-label={label}
            // Focus only marks the cell as being edited. Re-seeding the draft here would undo
            // characters typed before the focus event arrived, which is exactly what happens when
            // a test clears and types in one go — blur would then commit the original value back.
            onFocus={() => setEditing(true)}
            onChange={(event) => {
                const next = event.target.value;
                setDraft(next);
                // Commit as soon as the value is usable rather than waiting for blur. Blur is not
                // guaranteed — a driver may set a value and read the result without ever moving
                // focus — and successive commits coalesce into one history step anyway. A
                // half-typed value like "0." or "-" is held back rather than written through,
                // since made.js would reject it.
                if (isCommittable(next)) onCommit(next);
            }}
            onBlur={() => {
                setEditing(false);
                if (draft !== value) onCommit(draft);
            }}
            onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
            }}
        />
    );
}

export function BasisEditor({ xyz, units, theme, onCommit }: BasisEditorProps) {
    const [view, setView] = useState<View>("text");
    const [draft, setDraft] = useState(xyz);
    const sites = useMemo(() => parseBasisXyz(draft), [draft]);

    // The material is the source of truth: when it changes underneath — an undo, a transform, a
    // different material selected — the editor follows rather than holding a stale draft.
    useEffect(() => setDraft(xyz), [xyz]);

    function commitSites(next: BasisSite[]) {
        const text = serializeBasisXyz(next);
        setDraft(text);
        onCommit(text);
    }

    function updateSite(index: number, patch: Partial<BasisSite>) {
        commitSites(sites.map((site, i) => (i === index ? { ...site, ...patch } : site)));
    }

    return (
        <div className="md2-basis" data-testid="basis-editor">
            <div className="md2-basis-head">
                <span className="md2-slabel">
                    BASIS <span className="md2-unit">{units}</span>
                </span>
                <div className="md2-seg md2-basis-views">
                    <button
                        type="button"
                        className={`basis-view-text${view === "text" ? " md2-on" : ""}`}
                        onClick={() => setView("text")}
                    >
                        Text
                    </button>
                    <button
                        type="button"
                        className={`basis-view-table${view === "table" ? " md2-on" : ""}`}
                        onClick={() => setView("table")}
                    >
                        Table
                    </button>
                </div>
            </div>

            {view === "text" ? (
                // The id is part of the test contract: specs read and write this editor through
                // CodeMirror's own view, addressed by #basis-xyz.
                <div id="basis-xyz" className="md2-basis-text">
                    <CodeMirror
                        content={draft}
                        updateContent={(content: string) => {
                            setDraft(content);
                            onCommit(content);
                        }}
                        language="python"
                        theme={theme}
                        options={{ lineNumbers: false, foldGutter: false }}
                    />
                </div>
            ) : (
                <table className="basis-table md2-basis-table">
                    <thead>
                        <tr>
                            <th>Element</th>
                            {AXES.map((axis) => (
                                <th key={axis}>{axis}</th>
                            ))}
                            <th title="Movement allowed along each axis">Free</th>
                            <th aria-label="Remove" />
                        </tr>
                    </thead>
                    <tbody>
                        {sites.map((site, index) => (
                            // A site's identity is its row: two sites of the same element at the
                            // same coordinates are still two different sites.
                            // eslint-disable-next-line react/no-array-index-key
                            <tr className="basis-table-row" key={index}>
                                <td className="basis-cell-element">
                                    <CellInput
                                        value={site.element}
                                        label={`Element of site ${index + 1}`}
                                        onCommit={(element) => updateSite(index, { element })}
                                    />
                                </td>
                                {AXES.map((axis) => (
                                    <td key={axis} className={`basis-cell-${axis}`}>
                                        <CellInput
                                            value={site[axis]}
                                            label={`${axis} of site ${index + 1}`}
                                            onCommit={(next) => updateSite(index, { [axis]: next })}
                                        />
                                    </td>
                                ))}
                                <td className="md2-basis-constraints">
                                    {AXES.map((axis, axisIndex) => (
                                        <span key={axis} className={`basis-constraint-${axis}`}>
                                            <input
                                                type="checkbox"
                                                checked={site.constraints[axisIndex]}
                                                aria-label={`${axis} free on site ${index + 1}`}
                                                onChange={() => {
                                                    const constraints = [...site.constraints] as [
                                                        boolean,
                                                        boolean,
                                                        boolean,
                                                    ];
                                                    constraints[axisIndex] =
                                                        !constraints[axisIndex];
                                                    updateSite(index, { constraints });
                                                }}
                                            />
                                        </span>
                                    ))}
                                </td>
                                <td>
                                    <button
                                        type="button"
                                        className="basis-remove-site"
                                        aria-label={`Remove site ${index + 1}`}
                                        title="Remove this site"
                                        disabled={sites.length === 1}
                                        onClick={() =>
                                            commitSites(sites.filter((_, i) => i !== index))
                                        }
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {view === "table" && (
                <button
                    type="button"
                    className="basis-add-site md2-btn"
                    onClick={() =>
                        commitSites([...sites, emptySite(sites[sites.length - 1]?.element)])
                    }
                >
                    + Add site
                </button>
            )}
        </div>
    );
}
