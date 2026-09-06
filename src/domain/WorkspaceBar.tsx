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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import React from "react";

import type { ResolvedCommand } from "../shell/commands";

/** Icons for the ids the bar renders; anything else falls back to its label. */
const ICONS: Record<string, React.ReactNode> = {
    "edit.undo": <UndoIcon fontSize="small" />,
    "edit.redo": <RedoIcon fontSize="small" />,
    "material.clone": <ContentCopyIcon fontSize="small" />,
    "create.standard-library": <LibraryAddIcon fontSize="small" />,
    "create.from-file": <UploadFileIcon fontSize="small" />,
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

/**
 * The quick-action row: a short key the specs address it by, and the command it runs.
 *
 * The key is deliberately not the command id. Specs say `.quick-action-undo`, which reads as an
 * action rather than as a namespaced identifier, and keeps the class stable if a command is ever
 * regrouped.
 */
const QUICK_ACTIONS: { key: string; command: string }[] = [
    { key: "undo", command: "edit.undo" },
    { key: "redo", command: "edit.redo" },
    { key: "clone", command: "material.clone" },
    { key: "import-standata", command: "create.standard-library" },
    { key: "import-file", command: "create.from-file" },
];

/** Regions that can be shown or hidden, with the name their toggle is addressed by. */
const PANEL_TOGGLES: { name: string; command: string; label: string }[] = [
    { name: "navigator", command: "view.toggle-navigator", label: "Materials list" },
    { name: "viewport", command: "view.toggle-viewport", label: "3D view" },
    { name: "timeline", command: "view.toggle-timeline", label: "Timeline" },
    { name: "inspector", command: "view.toggle-inspector", label: "Inspector" },
    { name: "console", command: "view.toggle-console", label: "Console" },
];

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
function QuickAction({ command, actionKey }: { command: ResolvedCommand; actionKey: string }) {
    const hint = command.shortcut ? ` (${command.shortcut.replace("mod", "⌘")})` : "";
    return (
        <button
            type="button"
            className={`md2-wbtn md2-icon quick-action-${actionKey}`}
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
            {QUICK_ACTIONS.map(({ key, command }) => {
                const resolved = byId.get(command);
                return resolved ? (
                    <QuickAction key={key} actionKey={key} command={resolved} />
                ) : null;
            })}
            <span className="md2-vdiv" />
            {PANEL_TOGGLES.map(({ name, command, label }) => {
                const resolved = byId.get(command);
                if (!resolved) return null;
                return (
                    <button
                        key={name}
                        type="button"
                        className={`md2-wbtn md2-toggle panel-toggle-${name}`}
                        onClick={resolved.run}
                        disabled={!resolved.enabled}
                        title={resolved.enabled ? resolved.label : resolved.reason}
                        aria-label={resolved.label}
                        aria-pressed={undefined}
                        data-command={resolved.id}
                    >
                        {label}
                    </button>
                );
            })}
            <span className="md2-spacer" />
            {/* The Catalog is the browsing surface; ⌘K opens the palette, which searches
                everything by name. Two doors, deliberately not the same one. */}
            <button
                type="button"
                className="md2-searchpill"
                onClick={onOpenCatalog}
                data-testid="open-catalog"
            >
                <SearchIcon fontSize="small" /> Create or transform…
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
