/**
 * Workspace Bar — session identity, save truth, and ONE undo/redo pair.
 *
 * v1 spread ~30 actions across five menus, including undo. Here the bar carries
 * session state and history; everything else lives in the Catalog, the panels,
 * or the palette (design decision D2).
 */
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import RedoIcon from "@mui/icons-material/Redo";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";
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
                <MenuIcon fontSize="small" />
            </button>
            {/* Standalone wears the product's identity; the embedded costume
                hides this block, since the host supplies its own chrome. */}
            <span className="md2-brand" data-testid="brand">
                <span className="md2-brand-mark">M3</span>
                <span className="md2-brand-name">Materials Designer</span>
            </span>
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
                // Disabled controls say why they are disabled, never just grey out.
                title={canUndo ? "Undo (⌘Z) — one history for every surface" : "Nothing to undo"}
                aria-label="Undo"
                data-testid="undo"
            >
                <UndoIcon fontSize="small" />
            </button>
            <button
                type="button"
                className="md2-wbtn md2-icon"
                onClick={onRedo}
                disabled={!canRedo}
                title={canRedo ? "Redo (⇧⌘Z)" : "Nothing to redo"}
                aria-label="Redo"
                data-testid="redo"
            >
                <RedoIcon fontSize="small" />
            </button>
            <span className="md2-spacer" />
            <button type="button" className="md2-searchpill" onClick={onOpenCatalog}>
                <SearchIcon fontSize="small" /> Create or transform…<kbd>⌘K</kbd>
            </button>
            <button
                type="button"
                className="md2-wbtn md2-icon"
                onClick={onToggleTheme}
                title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                aria-label="Toggle theme"
            >
                {theme === "dark" ? (
                    <LightModeIcon fontSize="small" />
                ) : (
                    <DarkModeIcon fontSize="small" />
                )}
            </button>
        </div>
    );
}
