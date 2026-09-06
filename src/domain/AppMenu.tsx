/**
 * The one surviving menu.
 *
 * Everything that creates or transforms a material lives in the Catalog; this
 * holds the file-level actions that have nowhere better to be — and, in an
 * embedded host, the injected Save/Exit of the v1 contract.
 */
import React, { useEffect, useRef } from "react";

export interface AppMenuProps {
    /** The toggle that opened this menu; clicks on it are not "outside". */
    anchorSelector?: string;
    onImport: () => void;
    onExport: (format: "json" | "poscar", all: boolean) => void;
    onClose: () => void;
    materialCount: number;
}

export function AppMenu({
    anchorSelector,
    onImport,
    onExport,
    onClose,
    materialCount,
}: AppMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDocumentClick(event: MouseEvent) {
            const target = event.target as Node;
            if (ref.current?.contains(target)) return;
            // Without this, mousedown closes the menu and the button's own
            // click handler immediately reopens it — the toggle could never
            // close what it opened.
            if (anchorSelector && (target as Element).closest?.(anchorSelector)) return;
            onClose();
        }
        function onKey(event: KeyboardEvent) {
            if (event.key === "Escape") onClose();
        }
        document.addEventListener("mousedown", onDocumentClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDocumentClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [onClose, anchorSelector]);

    return (
        <div className="md2-menu" ref={ref} role="menu" data-testid="app-menu">
            <button type="button" role="menuitem" className="md2-mi" onClick={onImport}>
                <span className="md2-mic">⇪</span>Upload from disk…
            </button>
            <div className="md2-msep" />
            <button
                type="button"
                role="menuitem"
                className="md2-mi"
                onClick={() => onExport("json", false)}
            >
                <span className="md2-mic">⇩</span>Export as JSON
            </button>
            <button
                type="button"
                role="menuitem"
                className="md2-mi"
                onClick={() => onExport("poscar", false)}
            >
                <span className="md2-mic">⇩</span>Export as POSCAR
            </button>
            <button
                type="button"
                role="menuitem"
                className="md2-mi"
                onClick={() => onExport("json", true)}
                disabled={materialCount < 2}
            >
                <span className="md2-mic">⇩</span>Export all ({materialCount})
            </button>
            <div className="md2-msep" />
            <div className="md2-mnote">
                Save and Exit appear here when a host provides them — the v1 embedding contract is
                unchanged.
            </div>
        </div>
    );
}
