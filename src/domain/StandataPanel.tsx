/**
 * Standard library — the 74 Standata entries as a searchable list.
 *
 * In v1 this was a modal dialog behind Input/Output; here it is a Catalog entry
 * that opens in the panel zone, and each pick becomes a material whose origin
 * step records where it came from.
 */
import { MaterialStandata } from "@mat3ra/standata";
import React, { useMemo, useState } from "react";

export interface StandataEntry {
    name: string;
    config: Record<string, unknown>;
}

/** Read once: the catalog is static runtime data. */
export function loadStandata(): StandataEntry[] {
    const map = (
        MaterialStandata as unknown as {
            runtimeData: { filesMapByName: Record<string, Record<string, unknown>> };
        }
    ).runtimeData.filesMapByName;
    return Object.entries(map)
        .map(([fileName, config]) => ({
            // The map is keyed by file name — "C-[Graphene]-HEX_[P6%2Fmmm]_2D_[Monolayer].json" —
            // which is storage, not language. What someone is choosing from is the material's own
            // name, which is also what v1's dialog listed and what the platform's fixtures name.
            name: (config.name as string) || fileName,
            config,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

export interface StandataPanelProps {
    onPick: (entry: StandataEntry) => void;
    onCancel: () => void;
}

export function StandataPanel({ onPick, onCancel }: StandataPanelProps) {
    const entries = useMemo(loadStandata, []);
    const [query, setQuery] = useState("");
    const needle = query.trim().toLowerCase();
    const shown = needle ? entries.filter((e) => e.name.toLowerCase().includes(needle)) : entries;

    return (
        <section
            className="md2-panel"
            aria-label="Standard library"
            data-testid="panel-standard-library"
        >
            <header className="md2-panel-head">
                <span className="md2-icon" aria-hidden="true">
                    ◈
                </span>
                <h2 className="md2-panel-title">Standard library</h2>
                <span className="md2-badge" data-engine="native">
                    NATIVE
                </span>
            </header>
            <div className="md2-panel-body">
                <input
                    className="md2-field"
                    style={{ width: "100%", marginBottom: 10 }}
                    value={query}
                    data-testid="standata-search"
                    placeholder={`Search ${entries.length} materials…`}
                    aria-label="Search the standard library"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="md2-standata-list">
                    {shown.map((entry) => (
                        <button
                            type="button"
                            key={entry.name}
                            className="md2-standata-row"
                            data-testid="standata-row"
                            onClick={() => onPick(entry)}
                        >
                            <span className="md2-swatch" />
                            {entry.name}
                        </button>
                    ))}
                    {!shown.length && <div className="md2-note">No matches.</div>}
                </div>
            </div>
            <div className="md2-actions">
                <button type="button" className="md2-btn" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </section>
    );
}
