/**
 * Materials Designer's commands.
 *
 * The ids here are a contract: `plan/cutover/TEST-HOOKS.md` records them, every trigger renders
 * `data-command="<id>"`, and the Cypress suite invokes them by id rather than by walking a menu.
 * Labels and placement are free to change; ids are not.
 *
 * Availability is expressed here rather than at each button, so the palette, the toolbar and the
 * keyboard all agree about what can run — and, when something cannot, they give the same reason.
 */
import type { UseSession } from "../core/useSession";
import type { Command } from "../shell/commands";
import { type MDStateView, toMDState } from "./mdState";

export type RegionName = "navigator" | "viewport" | "timeline" | "inspector" | "console";

/** The file-level actions the platform injects. Absent in standalone; each self-disables. */
export interface HostActions {
    import?: () => void;
    /** Handed the session projected into the shape the platform's save dialog reads. */
    save?: (state: MDStateView) => void;
    exit?: () => void;
}

export interface CommandContext {
    session: UseSession;
    regions: Record<RegionName, boolean>;
    host: HostActions;
    ui: {
        openPanel: (type: string) => void;
        openCatalog: () => void;
        openPalette: () => void;
        pickFiles: () => void;
        exportActive: (format: "json" | "poscar") => void;
        exportAll: () => void;
        toggleRegion: (region: RegionName) => void;
        toggleTheme: () => void;
        startRename: (id: string) => void;
    };
}

const NOT_YET = "Not built yet";

/** Materials in list order, which is the order the Navigator and the status bar both use. */
function materials(context: CommandContext) {
    return context.session.state.materials;
}

function activeIndex(context: CommandContext): number {
    return materials(context).findIndex((doc) => doc.id === context.session.activeDoc.id);
}

function step(context: CommandContext, delta: number) {
    const all = materials(context);
    if (all.length < 2) return;
    const next = (activeIndex(context) + delta + all.length) % all.length;
    context.session.select(all[next].id);
}

/**
 * The last visible panel cannot be closed.
 *
 * Hiding every region leaves a blank window with no way back, which is what the
 * control-availability spec pins down.
 */
function isLastOpenRegion(context: CommandContext, region: RegionName): boolean {
    const open = Object.entries(context.regions).filter(([, isOpen]) => isOpen);
    return open.length === 1 && open[0][0] === region;
}

function regionCommand(region: RegionName, label: string): Command<CommandContext> {
    return {
        id: `view.toggle-${region}`,
        label,
        group: "View",
        keywords: ["panel", "toggle", "show", "hide"],
        run: (c) => c.ui.toggleRegion(region),
        isEnabled: (c) => !isLastOpenRegion(c, region),
        disabledReason: () => "The last open panel cannot be hidden",
    };
}

/** Opening an operation panel is the same action from the Catalog, the palette or a shortcut. */
function panelCommand(
    id: string,
    type: string,
    label: string,
    keywords: string[],
): Command<CommandContext> {
    return {
        id,
        label,
        group: "Build",
        keywords,
        run: (c) => c.ui.openPanel(type),
    };
}

export const COMMANDS: Command<CommandContext>[] = [
    // ---------------------------------------------------------------------- file
    {
        id: "file.import",
        label: "Import from the platform",
        group: "File",
        keywords: ["host", "open"],
        run: (c) => c.host.import?.(),
        // Standalone has no host to import from, exactly as v1's menu item self-disabled.
        isEnabled: (c) => Boolean(c.host.import),
        disabledReason: () => "Only available when embedded in the platform",
    },
    {
        id: "file.save",
        label: "Save to the platform",
        group: "File",
        shortcut: "mod+s",
        run: (c) => c.host.save?.(toMDState(c.session.state)),
        isEnabled: (c) => Boolean(c.host.save),
        disabledReason: () => "Only available when embedded in the platform",
    },
    {
        id: "file.exit",
        label: "Exit",
        group: "File",
        run: (c) => c.host.exit?.(),
        isEnabled: (c) => Boolean(c.host.exit),
        disabledReason: () => "Only available when embedded in the platform",
    },
    {
        id: "file.export-json",
        label: "Export as JSON",
        group: "File",
        keywords: ["download", "save"],
        run: (c) => c.ui.exportActive("json"),
    },
    {
        id: "file.export-poscar",
        label: "Export as POSCAR",
        group: "File",
        keywords: ["download", "vasp"],
        run: (c) => c.ui.exportActive("poscar"),
    },
    {
        id: "file.export-all",
        label: "Export all materials",
        group: "File",
        keywords: ["download", "zip"],
        run: (c) => c.ui.exportAll(),
    },

    // ---------------------------------------------------------------------- edit
    {
        id: "edit.undo",
        label: "Undo",
        group: "Edit",
        shortcut: "mod+z",
        run: (c) => c.session.undo(),
        isEnabled: (c) => c.session.canUndo,
        disabledReason: () => "Nothing to undo",
    },
    {
        id: "edit.redo",
        label: "Redo",
        group: "Edit",
        shortcut: "mod+shift+z",
        run: (c) => c.session.redo(),
        isEnabled: (c) => c.session.canRedo,
        disabledReason: () => "Nothing to redo",
    },

    // ------------------------------------------------------------------ material
    {
        id: "material.clone",
        label: "Clone material",
        group: "Material",
        keywords: ["copy", "duplicate", "fork"],
        // v1's Clone appends without moving the selection; the harvested status-bar spec pins
        // that the denominator grows while the numerator stays put.
        run: (c) =>
            c.session.fork(c.session.activeDoc.id, undefined, {
                select: false,
                // v1 named a clone "New Material" so it reads as distinct from its source in the
                // list; the platform's fixtures pin that name.
                name: "New Material",
            }),
    },
    {
        id: "material.rename",
        label: "Rename material",
        group: "Material",
        run: (c) => c.ui.startRename(c.session.activeDoc.id),
    },
    {
        id: "material.remove",
        label: "Delete material",
        group: "Material",
        keywords: ["remove"],
        run: (c) => c.session.remove(c.session.activeDoc.id),
        isEnabled: (c) => materials(c).length > 1,
        disabledReason: () => "The last material cannot be deleted",
    },
    {
        id: "material.next",
        label: "Next material",
        group: "Material",
        shortcut: "]",
        run: (c) => step(c, 1),
        isEnabled: (c) => materials(c).length > 1,
        disabledReason: () => "Only one material in the session",
    },
    {
        id: "material.previous",
        label: "Previous material",
        group: "Material",
        shortcut: "[",
        run: (c) => step(c, -1),
        isEnabled: (c) => materials(c).length > 1,
        disabledReason: () => "Only one material in the session",
    },

    // -------------------------------------------------------------------- create
    {
        id: "create.standard-library",
        label: "Import from Standata",
        group: "Create",
        keywords: ["standata", "library", "standard"],
        run: (c) => c.ui.openPanel("standard-library"),
    },
    {
        id: "create.from-file",
        label: "Import from file",
        group: "Create",
        keywords: ["upload", "poscar", "json", "open"],
        run: (c) => c.ui.pickFiles(),
    },

    // ---------------------------------------------------------------- operations
    panelCommand("op.supercell", "supercell", "Create supercell", ["repeat", "matrix"]),
    panelCommand("op.surface", "surface", "Create surface / slab", ["slab", "miller", "hkl"]),
    panelCommand("op.boundary-conditions", "boundary-conditions", "Set boundary conditions", [
        "pbc",
        "periodic",
    ]),
    panelCommand("op.combinatorial-set", "combinatorial-set", "Create combinatorial set", [
        "batch",
        "screen",
    ]),
    {
        id: "op.interpolated-set",
        label: "Create interpolated set (NEB)",
        group: "Build",
        keywords: ["neb", "images", "endpoints"],
        run: (c) => c.ui.openPanel("interpolated-set"),
        // Registered in the operation registry, but its apply is still the identity function —
        // so it would replay as a silent no-op. Better to say so than to appear to work.
        isEnabled: () => false,
        disabledReason: () => NOT_YET,
    },

    // --------------------------------------------------------------- structure
    {
        id: "structure.conventional-cell",
        label: "Use conventional cell",
        group: "Structure",
        keywords: ["primitive", "cell"],
        run: (c) => c.session.apply("conventional-cell", {}),
    },
    {
        id: "structure.toggle-periodicity",
        label: "Toggle periodicity",
        group: "Structure",
        keywords: ["periodic", "molecule", "non-periodic"],
        run: (c) =>
            c.session.apply("toggle-periodicity", {
                isNonPeriodic: !c.session.active.material.isNonPeriodic,
            }),
    },

    // ----------------------------------------------------------------- history
    {
        id: "history.revert-origin",
        label: "Reset to the original",
        group: "History",
        keywords: ["reset", "revert", "start"],
        run: (c) => c.session.revert(c.session.activeDoc.id, 0),
        isEnabled: (c) => c.session.activeDoc.log.length > 1,
        disabledReason: () => "This material has no steps to revert",
    },
    {
        id: "history.fork",
        label: "Fork from the current step",
        group: "History",
        keywords: ["branch", "copy"],
        run: (c) => c.session.fork(c.session.activeDoc.id),
    },

    // ------------------------------------------------------------------- view
    regionCommand("navigator", "Toggle the materials list"),
    regionCommand("viewport", "Toggle the 3D view"),
    regionCommand("timeline", "Toggle the timeline"),
    regionCommand("inspector", "Toggle the inspector"),
    regionCommand("console", "Toggle the console"),
    {
        id: "view.theme",
        label: "Switch light / dark theme",
        group: "View",
        keywords: ["dark", "light", "appearance"],
        run: (c) => c.ui.toggleTheme(),
    },

    // ----------------------------------------------------------------- global
    {
        id: "global.palette",
        label: "Search commands and materials",
        group: "Global",
        shortcut: "mod+k",
        keywords: ["palette", "find"],
        run: (c) => c.ui.openPalette(),
    },
];
