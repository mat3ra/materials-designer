/**
 * Workspace Bar — session identity, save truth, and ONE undo/redo pair.
 *
 * v1 spread ~30 actions across five menus, including undo. Here the bar carries
 * session state and history; everything else lives in the Catalog, the panels,
 * or the palette (design decision D2).
 */
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import RedoIcon from "@mui/icons-material/Redo";
import SearchIcon from "@mui/icons-material/Search";
import UndoIcon from "@mui/icons-material/Undo";
import React from "react";

import type { ResolvedCommand } from "../shell/commands";

/** Icons for the ids the bar renders; anything else falls back to its label. */
const ICONS: Record<string, React.ReactNode> = {
    "edit.undo": <UndoIcon fontSize="small" />,
    "edit.redo": <RedoIcon fontSize="small" />,
    "material.clone": <ContentCopyIcon fontSize="small" />,
    "create.standard-library": <LibraryAddIcon fontSize="small" />,
};

export interface WorkspaceBarProps {
    sessionName: string;
    onRename: (name: string) => void;
    savedAt: number | null;
    /** The resolved registry; the bar renders a few of its ids and never invents an action. */
    commands: ResolvedCommand[];
    onOpenCatalog: () => void;
    onOpenMenu: () => void;
    theme: "dark" | "light";
}

/** Ids the quick-action row shows, in order. */
const QUICK_ACTIONS = ["edit.undo", "edit.redo", "material.clone", "create.standard-library"];

function savedLabel(savedAt: number | null): string {
    if (!savedAt) return "Not saved yet";
    const seconds = Math.round((Date.now() - savedAt) / 1000);
    if (seconds < 5) return "Saved · just now";
    if (seconds < 60) return `Saved · ${seconds}s ago`;
    return `Saved · ${Math.round(seconds / 60)}m ago`;
}

/**
 * One quick-action button.
 *
 * The title carries the command's own reason when it cannot run: a control that greys out without
 * saying why leaves the user unable to tell a no-op from a bug.
 */
function QuickAction({ command }: { command: ResolvedCommand }) {
    const hint = command.shortcut ? ` (${command.shortcut.replace("mod", "⌘")})` : "";
    return (
        <button
            type="button"
            className="md2-wbtn md2-icon"
            onClick={command.run}
            disabled={!command.enabled}
            title={command.enabled ? `${command.label}${hint}` : command.reason}
            aria-label={command.label}
            data-command={command.id}
            data-testid={`command-${command.id}`}
        >
            {ICONS[command.id] ?? command.label}
        </button>
    );
}

export function WorkspaceBar({
    sessionName,
    onRename,
    savedAt,
    commands,
    onOpenCatalog,
    onOpenMenu,
    theme,
}: WorkspaceBarProps) {
    const byId = new Map(commands.map((command) => [command.id, command]));
    const themeCommand = byId.get("view.theme");
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
            {QUICK_ACTIONS.map((id) => {
                const command = byId.get(id);
                return command ? <QuickAction key={id} command={command} /> : null;
            })}
            <span className="md2-spacer" />
            <button type="button" className="md2-searchpill" onClick={onOpenCatalog}>
                <SearchIcon fontSize="small" /> Create or transform…<kbd>⌘K</kbd>
            </button>
            {themeCommand ? (
                <button
                    type="button"
                    className="md2-wbtn md2-icon"
                    onClick={themeCommand.run}
                    title={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                    aria-label="Toggle theme"
                    data-command={themeCommand.id}
                    data-testid={`command-${themeCommand.id}`}
                >
                    {theme === "dark" ? (
                        <LightModeIcon fontSize="small" />
                    ) : (
                        <DarkModeIcon fontSize="small" />
                    )}
                </button>
            ) : null}
        </div>
    );
}
