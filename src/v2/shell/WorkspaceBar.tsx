/**
 * Workspace Bar — session identity, save truth, and ONE undo/redo pair.
 *
 * v1 spread ~30 actions across five menus, including undo. Here the bar carries
 * session state and history; everything else lives in the Catalog, the panels,
 * or the palette (design decision D2).
 */
import React from "react";

export interface WorkspaceBarProps {
    sessionName: string;
    onRename: (name: string) => void;
    savedAt: number | null;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onOpenCatalog: () => void;
    onOpenMenu: () => void;
    theme: "dark" | "light";
    onToggleTheme: () => void;
}

function savedLabel(savedAt: number | null): string {
    if (!savedAt) return "Not saved yet";
    const seconds = Math.round((Date.now() - savedAt) / 1000);
    if (seconds < 5) return "Saved · just now";
    if (seconds < 60) return `Saved · ${seconds}s ago`;
    return `Saved · ${Math.round(seconds / 60)}m ago`;
}

export function WorkspaceBar({
    sessionName,
    onRename,
    savedAt,
    canUndo,
    canRedo,
    onUndo,
    onRedo,
    onOpenCatalog,
    onOpenMenu,
    theme,
    onToggleTheme,
}: WorkspaceBarProps) {
    return (
        <div className="md2-wbar">
            <button
                type="button"
                className="md2-wbtn md2-icon"
                title="App menu — import, export"
                aria-label="App menu"
                onClick={onOpenMenu}
                data-testid="app-menu-button"
            >
                ☰
            </button>
            <input
                className="md2-session-name"
                value={sessionName}
                aria-label="Session name"
                onChange={(e) => onRename(e.target.value)}
            />
            <span className="md2-savechip" data-testid="save-chip">
                <span className="md2-dot" />
                {savedLabel(savedAt)}
            </span>
            <span className="md2-vdiv" />
            <button
                type="button"
                className="md2-wbtn md2-icon"
                onClick={onUndo}
                disabled={!canUndo}
                title="Undo (⌘Z) — one history for every surface"
                aria-label="Undo"
                data-testid="undo"
            >
                ↶
            </button>
            <button
                type="button"
                className="md2-wbtn md2-icon"
                onClick={onRedo}
                disabled={!canRedo}
                title="Redo (⇧⌘Z)"
                aria-label="Redo"
                data-testid="redo"
            >
                ↷
            </button>
            <span className="md2-spacer" />
            <button type="button" className="md2-searchpill" onClick={onOpenCatalog}>
                ⌕ Create or transform…<kbd>⌘K</kbd>
            </button>
            <button
                type="button"
                className="md2-wbtn md2-icon"
                onClick={onToggleTheme}
                title="Toggle theme"
                aria-label="Toggle theme"
            >
                {theme === "dark" ? "☀" : "◐"}
            </button>
        </div>
    );
}
