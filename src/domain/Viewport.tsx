/**
 * Viewport — the wave.js canvas, wired to the operation log.
 *
 * The important part is `onEditCommit`, wave's documented host channel
 * (source: drag | gizmo | add | remove | clone | undo | ...). v1 ignored it in
 * favour of the legacy `onUpdate`, which is why the viewer kept a second,
 * private undo stack. Here every canvas edit becomes an operation in MD's log,
 * so ⌘Z means one thing everywhere.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import { ThreeDEditor } from "@mat3ra/wave.js";
import React, { useCallback } from "react";

export interface ViewportProps {
    material: Material;
    /** Called for real canvas edits, already classified by wave. */
    onEdit: (material: Material, source: string) => void;
    onSelectionChanged: (indices: number[]) => void;
}

/**
 * Wave replays its own history for these sources. MD owns history, so they are
 * dropped rather than recorded — otherwise a viewer-side undo would append a
 * *new* step to the log instead of removing one.
 */
const VIEWER_HISTORY_SOURCES = new Set(["undo", "redo"]);

export function Viewport({ material, onEdit, onSelectionChanged }: ViewportProps) {
    const handleEditCommit = useCallback(
        (updated: Material, source: string) => {
            if (VIEWER_HISTORY_SOURCES.has(source)) return;
            onEdit(updated, source);
        },
        [onEdit],
    );

    return (
        <div className="md2-viewport" data-testid="viewport">
            <ThreeDEditor
                editable
                material={material}
                onEditCommit={handleEditCommit}
                onSelectionChanged={onSelectionChanged}
                isConventionalCellShown={false}
            />
        </div>
    );
}
