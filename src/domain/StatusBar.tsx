/**
 * Status Bar — the live facts v1 reserved 54px for and never filled.
 *
 * Facts are grouped rather than laid out as a flat run of segments: a spec (and a reader) asks
 * "what is this material?" and "where am I in the list?", not "what is in the fourth segment?".
 * The group elements carry stable ids and classes so the questions can be asked directly.
 */
import React from "react";

import type { ResultDigest, SelectionModel } from "../core/types";

export interface StatusBarProps {
    digest: ResultDigest;
    selection: SelectionModel;
    stepCount: number;
    materialIndex: number;
    materialCount: number;
    saved: boolean;
}

export function StatusBar({
    digest,
    selection,
    stepCount,
    materialIndex,
    materialCount,
    saved,
}: StatusBarProps) {
    return (
        <div className="md2-statusbar" id="materials-designer-status-bar" data-testid="status-bar">
            <span className="md2-sgroup status-material" data-status-group="material">
                <span className="md2-sseg">
                    <b>{digest.formula}</b>
                </span>
                <span className="md2-sdiv" />
                <span className="md2-sseg" data-testid="atom-count">
                    {digest.atomCount} atoms
                </span>
                <span className="md2-sdiv" />
                <span className="md2-sseg">{digest.latticeType ?? "—"}</span>
                {digest.a !== undefined && (
                    <>
                        <span className="md2-sdiv" />
                        <span className="md2-sseg md2-mono">a {digest.a.toFixed(3)} Å</span>
                    </>
                )}
            </span>

            <span className="md2-sdiv" />
            {/* Position in the list, not an ordinal label: "1 / 2" reads the same way a page
                number does, and is what the status-bar spec asserts. */}
            <span
                className="md2-sgroup status-position"
                data-status-group="position"
                title="Position in the materials list"
            >
                {materialIndex + 1} / {materialCount}
            </span>

            <span className="md2-sdiv" />
            <span className="md2-sseg md2-accent" data-testid="selection-readout">
                {selection.siteIds.length
                    ? `${selection.siteIds.length} of ${digest.atomCount} selected`
                    : "no selection"}
            </span>
            <span className="md2-spacer" />
            <span className="md2-sseg">{stepCount} steps</span>
            <span className="md2-sdiv" />
            <span className="md2-sseg">{saved ? "✓ autosaved" : "saving…"}</span>
        </div>
    );
}
