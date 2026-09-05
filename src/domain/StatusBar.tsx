/**
 * Status Bar — the live facts v1 reserved 54px for and never filled.
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
        <div className="md2-statusbar" data-testid="status-bar">
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
            <span className="md2-sdiv" />
            <span className="md2-sseg">
                material {materialIndex + 1} / {materialCount}
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
