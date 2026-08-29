/**
 * Navigator — materials as a lineage tree.
 *
 * v1 showed a flat list, which collapses once a slab is derived from a bulk or
 * a combinatorial run emits a hundred children. Rows indent under the material
 * they came from, and the modified dot is revert-aware because it simply asks
 * whether the log has steps beyond its origin.
 */
import React, { useMemo, useState } from "react";

import { isModified, resolve } from "../state/replay";
import type { MaterialDoc, SessionState } from "../state/types";

export interface NavigatorProps {
    state: SessionState;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    onFork: (id: string) => void;
    onNew: () => void;
}

interface Row {
    doc: MaterialDoc;
    depth: number;
}

/** Depth-first walk so children sit under their parent, roots in insertion order. */
function toRows(materials: MaterialDoc[]): Row[] {
    const byParent = new Map<string | undefined, MaterialDoc[]>();
    materials.forEach((doc) => {
        const key =
            doc.parentId && materials.some((m) => m.id === doc.parentId) ? doc.parentId : undefined;
        byParent.set(key, [...(byParent.get(key) ?? []), doc]);
    });
    const rows: Row[] = [];
    const visit = (parent: string | undefined, depth: number) => {
        (byParent.get(parent) ?? []).forEach((doc) => {
            rows.push({ doc, depth });
            visit(doc.id, depth + 1);
        });
    };
    visit(undefined, 0);
    return rows;
}

export function Navigator({ state, onSelect, onRemove, onFork, onNew }: NavigatorProps) {
    const [filter, setFilter] = useState("");
    const rows = useMemo(() => toRows(state.materials), [state.materials]);
    const query = filter.trim().toLowerCase();

    const visible = rows.filter(({ doc }) => {
        if (!query) return true;
        const { material, digest } = resolve(doc);
        return (
            (material.name ?? "").toLowerCase().includes(query) ||
            digest.formula.toLowerCase().includes(query)
        );
    });

    return (
        <div className="md2-nav">
            <div className="md2-nav-head">
                <span className="md2-htitle">MATERIALS</span>
                <span className="md2-count">{state.materials.length}</span>
            </div>
            <div className="md2-nav-filter">
                <input
                    value={filter}
                    placeholder="Filter by name or formula…"
                    aria-label="Filter materials"
                    onChange={(e) => setFilter(e.target.value)}
                />
                <button type="button" className="md2-btn-new" onClick={onNew} title="New material">
                    + New
                </button>
            </div>
            <div className="md2-tree" role="tree">
                {visible.map(({ doc, depth }) => {
                    const { material, digest } = resolve(doc);
                    const active = doc.id === state.activeId;
                    return (
                        <div
                            key={doc.id}
                            role="treeitem"
                            aria-selected={active}
                            tabIndex={0}
                            className={`md2-trow${active ? " md2-active" : ""}`}
                            style={{ marginLeft: depth * 14 }}
                            onClick={() => onSelect(doc.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") onSelect(doc.id);
                            }}
                            data-testid="material-row"
                        >
                            <span className="md2-swatch" />
                            <span className="md2-tname" title={material.name}>
                                {material.name || "Untitled"}
                            </span>
                            <span className="md2-tmeta">{digest.atomCount}</span>
                            {isModified(doc) && (
                                <span
                                    className="md2-mdot"
                                    title="Modified — clears if you revert to the origin"
                                    data-testid="modified-dot"
                                />
                            )}
                            <span className="md2-rowacts">
                                <button
                                    type="button"
                                    title="Fork a sibling from this material"
                                    aria-label={`Fork ${material.name}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onFork(doc.id);
                                    }}
                                >
                                    ⑂
                                </button>
                                <button
                                    type="button"
                                    title="Remove (undoable)"
                                    aria-label={`Remove ${material.name}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(doc.id);
                                    }}
                                >
                                    ✕
                                </button>
                            </span>
                        </div>
                    );
                })}
                {!visible.length && <div className="md2-empty">No matches · clear the filter</div>}
            </div>
        </div>
    );
}
