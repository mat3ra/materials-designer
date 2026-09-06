/**
 * Navigator — materials as a lineage tree.
 *
 * v1 showed a flat list, which collapses once a slab is derived from a bulk or
 * a combinatorial run emits a hundred children. Rows indent under the material
 * they came from, sets fold into a single folder row, and the modified dot is
 * revert-aware because it simply asks whether the log has steps beyond its
 * origin.
 */
import React, { useMemo, useState } from "react";

import { isModified, resolve } from "../core/replay";
import type { MaterialDoc, SessionState } from "../core/types";

export interface NavigatorProps {
    state: SessionState;
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    onFork: (id: string) => void;
    onNew: () => void;
    onRename: (id: string, name: string) => void;
    /** Opens the standard library panel. */
    onImportStandata?: () => void;
    /** Opens the file picker. */
    onImportFile?: () => void;
    /** Set by the `material.rename` command so the row opens straight into its field. */
    renamingId?: string | null;
    onRenamingIdChange?: (id: string | null) => void;
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

export function Navigator({
    state,
    onSelect,
    onRemove,
    onFork,
    onNew,
    onRename,
    onImportStandata,
    onImportFile,
    renamingId = null,
    onRenamingIdChange,
}: NavigatorProps) {
    const [filter, setFilter] = useState("");
    const [openSets, setOpenSets] = useState<Record<string, boolean>>({});
    const [addMenuOpen, setAddMenuOpen] = useState(false);
    const rows = useMemo(() => toRows(state.materials), [state.materials]);
    const query = filter.trim().toLowerCase();

    /**
     * A rename that changes nothing is not an edit.
     *
     * Clicking away from a row's name field must not deepen the history, or an undo would spend
     * itself walking back a no-op instead of removing the material the user actually added.
     */
    function commitRename(id: string, next: string, previous: string | undefined) {
        const trimmed = next.trim();
        if (trimmed && trimmed !== (previous ?? "")) onRename(id, trimmed);
        onRenamingIdChange?.(null);
    }

    // Filtering flattens through set folders: a search should find a member
    // even when its folder is closed.
    const visible = rows.filter(({ doc }) => {
        if (!query) return true;
        const { material, digest } = resolve(doc);
        return (
            (material.name ?? "").toLowerCase().includes(query) ||
            digest.formula.toLowerCase().includes(query)
        );
    });

    const toggleSet = (setId: string) =>
        setOpenSets((open) => ({ ...open, [setId]: !open[setId] }));

    function renderSetFolder(doc: MaterialDoc, depth: number, open: boolean) {
        const setId = doc.setId as string;
        const set = state.sets.find((s) => s.id === setId);
        const members = state.materials.filter((m) => m.setId === setId);
        const holdsActive = members.some((m) => m.id === state.activeId);
        return (
            <div
                key={`set-${setId}`}
                role="treeitem"
                aria-selected={holdsActive}
                aria-expanded={open}
                tabIndex={0}
                className="md2-trow md2-setrow"
                style={{ marginLeft: depth * 14 }}
                onClick={() => toggleSet(setId)}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") toggleSet(setId);
                }}
                data-testid="set-folder"
            >
                <span className="md2-twist">{open ? "▾" : "▸"}</span>
                <span className="md2-swatch" />
                <span className="md2-tname">{set?.label ?? "Set"}</span>
                <span className="md2-setcount">{members.length}</span>
            </div>
        );
    }

    function renderMaterial(doc: MaterialDoc, depth: number) {
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
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") onSelect(doc.id);
                }}
                data-testid="material-row"
            >
                <span className="md2-swatch" />
                {renamingId === doc.id ? (
                    <input
                        className="md2-tname-input"
                        // The row knows which material it is, so renaming the only row left by a
                        // filter renames that material rather than whichever happens to sit first.
                        defaultValue={material.name ?? ""}
                        aria-label={`Rename ${material.name}`}
                        data-testid="material-name-input"
                        ref={(node) => node?.focus()}
                        onClick={(event) => event.stopPropagation()}
                        onBlur={(event) => commitRename(doc.id, event.target.value, material.name)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                commitRename(doc.id, event.currentTarget.value, material.name);
                            }
                            if (event.key === "Escape") onRenamingIdChange?.(null);
                            event.stopPropagation();
                        }}
                    />
                ) : (
                    <span
                        className="md2-tname"
                        title={material.name}
                        onDoubleClick={(event) => {
                            event.stopPropagation();
                            onRenamingIdChange?.(doc.id);
                        }}
                    >
                        {material.name || "Untitled"}
                    </span>
                )}
                <span className="md2-tmeta">{digest.atomCount}</span>
                {isModified(doc) && (
                    <span
                        className="md2-mdot material-updated-dot"
                        title="Modified — clears if you revert to the origin"
                        data-testid="modified-dot"
                    />
                )}
                <span className="md2-rowacts">
                    <button
                        type="button"
                        title="Fork a sibling from this material"
                        data-testid="row-fork"
                        aria-label={`Fork ${material.name}`}
                        onClick={(event) => {
                            event.stopPropagation();
                            onFork(doc.id);
                        }}
                    >
                        ⑂
                    </button>
                    <button
                        type="button"
                        title="Remove (undoable)"
                        aria-label={`Remove ${material.name}`}
                        data-testid="row-remove"
                        onClick={(event) => {
                            event.stopPropagation();
                            onRemove(doc.id);
                        }}
                    >
                        ✕
                    </button>
                </span>
            </div>
        );
    }

    return (
        <div className="md2-nav materials-designer-items-list">
            <div className="md2-nav-head">
                <span className="md2-htitle">MATERIALS</span>
                <span className="md2-count materials-count" data-testid="materials-count">
                    {query && visible.length !== state.materials.length
                        ? `${visible.length} / ${state.materials.length}`
                        : state.materials.length}
                </span>
            </div>
            <div className="md2-nav-filter materials-filter">
                <input
                    value={filter}
                    placeholder="Filter by name or formula…"
                    aria-label="Filter materials"
                    onChange={(event) => setFilter(event.target.value)}
                />
                {filter && (
                    <button
                        type="button"
                        className="md2-filter-clear materials-filter-clear"
                        aria-label="Clear the filter"
                        title="Clear the filter"
                        onClick={() => setFilter("")}
                    >
                        ×
                    </button>
                )}
                <button
                    type="button"
                    className="md2-btn-new add-material-menu"
                    aria-haspopup="menu"
                    aria-expanded={addMenuOpen}
                    onClick={() => setAddMenuOpen((open) => !open)}
                    title="Add a material"
                >
                    + New
                </button>
                {addMenuOpen && (
                    <ul className="md2-addmenu" role="menu" aria-label="Add a material">
                        {[
                            { label: "New material", run: onNew },
                            { label: "Import from Standata", run: onImportStandata },
                            { label: "Import from file", run: onImportFile },
                        ].map(({ label, run }) => (
                            <li key={label} role="none">
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={() => {
                                        setAddMenuOpen(false);
                                        run?.();
                                    }}
                                >
                                    {label}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div className="md2-tree" role="tree">
                {visible.map(({ doc, depth }) => {
                    // A set always shows its folder row (on its first member),
                    // so an expanded set can be folded back up again; the
                    // members follow only while it is open.
                    if (doc.setId && !query) {
                        const members = state.materials.filter((m) => m.setId === doc.setId);
                        const isFirst = members[0]?.id === doc.id;
                        const open = Boolean(openSets[doc.setId]);
                        if (!open) return isFirst ? renderSetFolder(doc, depth, false) : null;
                        return (
                            <React.Fragment key={`set-member-${doc.id}`}>
                                {isFirst && renderSetFolder(doc, depth, true)}
                                {renderMaterial(doc, depth + 1)}
                            </React.Fragment>
                        );
                    }
                    return renderMaterial(doc, depth);
                })}
                {!visible.length && (
                    <div className="md2-empty materials-empty-state">
                        No matches · clear the filter
                    </div>
                )}
            </div>
        </div>
    );
}
