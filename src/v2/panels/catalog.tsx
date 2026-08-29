/**
 * Catalog-lite — the MVP shape of "one Catalog, many engines".
 *
 * Every way to create or transform a structure is one card in one searchable
 * list; the engine (native / notebook / code) is a badge, not a different door.
 * The MVP ships the three native operations that have panels; the notebook and
 * code cards are listed but disabled, so the catalog tells the truth about what
 * exists instead of hiding it behind a menu that is not there yet.
 */
import React, { useMemo } from "react";

import type { PanelEngine } from "./shared";
import { PANEL_META } from "./shared";

export interface CatalogEntry {
    type: string;
    title: string;
    icon: string;
    description: string;
    engine: PanelEngine;
    /** Present on a card that cannot be picked; shown on the card itself. */
    disabledReason?: string;
}

const NOT_YET = "Not in the MVP";

export const CATALOG: CatalogEntry[] = [
    {
        type: "import-file",
        title: "From file",
        icon: "⇪",
        description: "Import JSON or POSCAR from disk — or drop files anywhere on the window.",
        engine: "native",
    },
    {
        type: "standard-library",
        title: "Standard library",
        icon: "◈",
        description: "Start from one of the 74 curated Standata materials.",
        engine: "native",
    },
    {
        type: "combinatorial-set",
        title: "Combinatorial set",
        icon: "⋈",
        description:
            "One template, many materials: Si/Ge substitutions or Si/vac vacancies, emitted as a set.",
        engine: "native",
    },
    {
        type: "supercell",
        title: PANEL_META.supercell.title,
        icon: PANEL_META.supercell.icon,
        description: "Repeat the cell by an integer 3×3 scaling matrix.",
        engine: "native",
    },
    {
        type: "surface",
        title: PANEL_META.surface.title,
        icon: PANEL_META.surface.icon,
        description:
            "Cut a surface slab from a bulk crystal: Miller (h k l), thickness in layers, vacuum.",
        engine: "native",
    },
    {
        type: "boundary-conditions",
        title: PANEL_META["boundary-conditions"].title,
        icon: PANEL_META["boundary-conditions"].icon,
        description:
            "How the cell terminates — periodic, or a slab between vacuum and metal — with an offset in Å.",
        engine: "native",
    },
    {
        type: "interface-zsl",
        title: "Interface (ZSL)",
        icon: "≣",
        description: "Match two slabs into a strain-minimized interface (Zur–McGill).",
        engine: "notebook",
        disabledReason: NOT_YET,
    },
    {
        type: "passivation",
        title: "Passivate slab surface",
        icon: "⌇",
        description: "Terminate dangling bonds on a slab with hydrogen or hydroxyl groups.",
        engine: "notebook",
        disabledReason: NOT_YET,
    },
    {
        type: "grain-boundary",
        title: "Grain boundary",
        icon: "◫",
        description: "Tilt or twist boundary between two grains of the same crystal.",
        engine: "notebook",
        disabledReason: NOT_YET,
    },
    {
        type: "point-defect",
        title: "Point defect",
        icon: "○",
        description: "Vacancies, substitutions and interstitials at selected sites.",
        engine: "notebook",
        disabledReason: NOT_YET,
    },
    {
        type: "python-snippet",
        title: "Python snippet",
        icon: "▷",
        description: "Run a saved snippet in the Console with the session's materials bound.",
        engine: "code",
        disabledReason: NOT_YET,
    },
];

/** Every whitespace-separated term must appear in the title or description. */
export function filterCatalog(query: string, entries: CatalogEntry[] = CATALOG): CatalogEntry[] {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return entries;
    return entries.filter((entry) => {
        const haystack = `${entry.title} ${entry.description}`.toLowerCase();
        return terms.every((term) => haystack.indexOf(term) !== -1);
    });
}

export interface CatalogLiteProps {
    query: string;
    onPick: (type: string) => void;
    onQueryChange: (query: string) => void;
    onClose: () => void;
}

export function CatalogLite({
    query,
    onPick,
    onQueryChange,
    onClose,
}: CatalogLiteProps): JSX.Element {
    const results = useMemo(() => filterCatalog(query), [query]);
    return (
        <section className="md2-catalog" aria-label="Operation catalog">
            <div className="md2-catalog-head">
                <input
                    className="md2-field"
                    type="search"
                    value={query}
                    placeholder="Search operations…"
                    aria-label="Search operations"
                    onChange={(event) => onQueryChange(event.target.value)}
                />
                <span className="md2-hint">{`${results.length} of ${CATALOG.length}`}</span>
                <button type="button" className="md2-btn" onClick={onClose}>
                    Close
                </button>
            </div>

            <div className="md2-catalog-list">
                {results.map((entry) => (
                    <button
                        key={entry.type}
                        type="button"
                        className="md2-catalog-card"
                        disabled={Boolean(entry.disabledReason)}
                        onClick={() => onPick(entry.type)}
                    >
                        <span className="md2-icon" aria-hidden="true">
                            {entry.icon}
                        </span>
                        <span className="md2-catalog-title">{entry.title}</span>
                        <span className="md2-badge" data-engine={entry.engine}>
                            {entry.engine.toUpperCase()}
                        </span>
                        <span className="md2-catalog-desc">{entry.description}</span>
                        {entry.disabledReason ? (
                            <span className="md2-note md2-note-warn">
                                {`⚠ ${entry.disabledReason}`}
                            </span>
                        ) : null}
                    </button>
                ))}
                {results.length === 0 ? (
                    <p className="md2-note">
                        {`Nothing matches “${query.trim()}” — the Assistant can compile it from these same operations.`}
                    </p>
                ) : null}
            </div>
        </section>
    );
}

export default CatalogLite;
