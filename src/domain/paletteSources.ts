/**
 * What the palette searches: actions, the session's own materials, and the standard library.
 *
 * The three are deliberately not equal. Actions and materials are few and always listed; Standata's
 * seventy-odd entries appear only once something has been typed, because listing them by default
 * would bury the dozen things a user actually came to the palette for.
 */
import { resolve } from "../core/replay";
import type { MaterialDoc } from "../core/types";
import type { PaletteItem } from "../kit/command/CommandPalette";
import { type ResolvedCommand, filterCommands } from "../shell/commands";
import type { StandataEntry } from "./StandataPanel";

export interface PaletteSources {
    commands: ResolvedCommand[];
    materials: MaterialDoc[];
    standata: StandataEntry[];
    onSelectMaterial: (id: string) => void;
    onImportStandata: (entry: StandataEntry) => void;
}

/** How many library entries a query may show before the list stops being scannable. */
const STANDATA_LIMIT = 20;

function matches(haystack: string, query: string): boolean {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const text = haystack.toLowerCase();
    return terms.every((term) => text.includes(term));
}

export function buildPaletteItems(query: string, sources: PaletteSources): PaletteItem[] {
    const trimmed = query.trim();

    const commands: PaletteItem[] = filterCommands(sources.commands, trimmed).map((command) => ({
        id: `command:${command.id}`,
        commandId: command.id,
        label: command.label,
        group: command.group,
        hint: command.shortcut?.replace("mod", "⌘"),
        disabled: !command.enabled,
        reason: command.reason,
        run: command.run,
    }));

    const materials: PaletteItem[] = sources.materials
        .map((doc) => ({ doc, material: resolve(doc).material }))
        .filter(({ material }) => !trimmed || matches(material.name ?? "", trimmed))
        .map(({ doc, material }) => ({
            id: `material:${doc.id}`,
            label: material.name || "Untitled",
            group: "Materials",
            hint: material.formula,
            run: () => sources.onSelectMaterial(doc.id),
        }));

    // Nothing typed: the library stays out of the way.
    const standata: PaletteItem[] = !trimmed
        ? []
        : sources.standata
              .filter((entry) => matches(entry.name, trimmed))
              .slice(0, STANDATA_LIMIT)
              .map((entry) => ({
                  id: `standata:${entry.name}`,
                  label: entry.name,
                  group: "Standard library",
                  hint: "import",
                  run: () => sources.onImportStandata(entry),
              }));

    // Ordered by what someone opening a palette is most likely to be after. File-level actions are
    // last because they have a menu of their own, and the list is scrollable — anything below the
    // fold is effectively missing.
    const priority = [
        "Build",
        "Create",
        "Structure",
        "Materials",
        "Standard library",
        "Edit",
        "History",
        "Console",
        "View",
        "Global",
        "File",
    ];
    return [...commands, ...materials, ...standata].sort((a, b) => {
        const rank = (group: string) => {
            const index = priority.indexOf(group);
            return index === -1 ? priority.length : index;
        };
        return rank(a.group) - rank(b.group);
    });
}
