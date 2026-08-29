/**
 * The one surviving menu.
 *
 * Everything that creates or transforms a material lives in the Catalog; this
 * holds the file-level actions that have nowhere better to be — and, in an
 * embedded host, the injected Save/Exit of the v1 contract.
 */
import React, { useEffect, useRef } from "react";

export interface AppMenuProps {
    onImport: () => void;
    onExport: (format: "json" | "poscar", all: boolean) => void;
    onClose: () => void;
    materialCount: number;
}

export function AppMenu({ onImport, onExport, onClose, materialCount }: AppMenuProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDocumentClick(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) onClose();
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
    }, [onClose]);

    return (
        <div className="md2-menu" ref={ref} role="menu" data-testid="app-menu">
            <button type="button" role="menuitem" className="md2-mi" onClick={onImport}>
                <span className="md2-mic">⇪</span>Import from file…
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
