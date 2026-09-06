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
        .map(([name, config]) => ({ name, config }))
        .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * A library config as the session can hold it.
 *
 * Standata entries carry an `external` block recording where the structure came from. made.js
 * accepts it on the way in but rejects it when serialising against the enhanced schema, so a
 * material imported with it intact throws the first time anything asks for its JSON — which,
 * since `window.MDState` is published on every change, means the app stops rendering.
 *
 * The block is dropped here rather than papered over downstream. Its content is provenance about
 * an external database, which the operation log records in its own terms anyway.
 */
export function toImportableConfig(config: Record<string, unknown>): Record<string, unknown> {
    const { external, ...rest } = config;
    return rest;
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
                    placeholder="Search 74 materials…"
                    aria-label="Search the standard library"
                    onChange={(e) => setQuery(e.target.value)}
                />
                <div className="md2-standata-list">
                    {shown.map((entry) => (
                        <button
                            type="button"
                            key={entry.name}
                            className="md2-standata-row"
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
