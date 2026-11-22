import SupercellIcon from "@mui/icons-material/BorderClear";
import CloneIcon from "@mui/icons-material/Collections";
import BoundaryConditionsIcon from "@mui/icons-material/Directions";
import ConventionalCellIcon from "@mui/icons-material/FormatShapes";
import GetAppIcon from "@mui/icons-material/GetApp";
import SlabIcon from "@mui/icons-material/Layers";
import CombinatorialSetIcon from "@mui/icons-material/LibraryAdd";
import RedoIcon from "@mui/icons-material/Redo";
import SearchIcon from "@mui/icons-material/Search";
import InterpolatedSetIcon from "@mui/icons-material/SwapVert";
import Terminal from "@mui/icons-material/Terminal";
import UndoIcon from "@mui/icons-material/Undo";
import UploadIcon from "@mui/icons-material/Upload";
import React from "react";

/** Dialogs owned by MaterialsDesigner, which the materials list opens too. */
export type SharedDialogName = "standata" | "upload";

/** Dialogs owned by HeaderMenuToolbar's own state, addressed by state key. */
export type LocalDialogKey =
    | "showBoundaryConditionsDialog"
    | "showCombinatorialDialog"
    | "showExportMaterialsDialog"
    | "showInterpolateDialog"
    | "showJupyterLiteTransformation"
    | "showSupercellDialog"
    | "showSurfaceDialog";

/** A "Mod+Shift+Z"-style descriptor. `Mod` is ⌘ on a Mac and Ctrl everywhere else. */
export type Shortcut = `${string}+${string}`;

/**
 * One invocable command. Not a `DropdownAction` from cove: this carries a keyboard shortcut and a
 * group used for palette headings, and is rendered as an icon button rather than a menu row.
 */
export interface Action {
    id: string;
    label: string;
    group: "Edit" | "Input/Output" | "Advanced";
    icon: React.ReactElement;
    shortcut?: Shortcut;
    run: () => void;
    /** Greyed out on the toolbar, skipped by the shortcut handler, absent from the palette. */
    disabled?: boolean;
}

export interface BuildActionsParams {
    onUndo: () => void;
    onRedo: () => void;
    onClone: () => void;
    onOpenDialog: (name: SharedDialogName) => void;
    onUseConventionalCell: () => void;
    openLocalDialog: (key: LocalDialogKey) => void;
    canUndo?: boolean;
    canRedo?: boolean;
}

/** Ids of the actions the quick-action toolbar shows, in order. `|` marks a separator. */
export const TOOLBAR_ACTION_IDS = [
    "undo",
    "redo",
    "|",
    "import-standata",
    "upload",
    "export",
    "|",
    "supercell",
    "surface",
    "|",
    "jupyterlite-transformation",
];

const isMac = () =>
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform || "");

/** Renders a shortcut for the current platform: "Mod+Z" reads as ⌘Z or Ctrl+Z. */
export function formatShortcut(shortcut?: string): string {
    if (!shortcut) return "";
    return isMac()
        ? shortcut.replace("Mod+", "⌘").replace("Shift+", "⇧")
        : shortcut.replace("Mod+", "Ctrl+");
}

/**
 * The single registry of invocable actions, shared by the quick-action toolbar, the keyboard
 * shortcuts and the command palette so the three can never drift. A `disabled` entry is greyed out
 * on the toolbar, skipped by the shortcut handler and left out of the palette.
 */
export function buildActions({
    onUndo,
    onRedo,
    onClone,
    onOpenDialog,
    onUseConventionalCell,
    openLocalDialog,
    canUndo = true,
    canRedo = true,
}: BuildActionsParams): Action[] {
    return [
        {
            id: "undo",
            label: "Undo",
            group: "Edit",
            icon: <UndoIcon />,
            shortcut: "Mod+Z",
            run: onUndo,
            disabled: !canUndo,
        },
        {
            id: "redo",
            label: "Redo",
            group: "Edit",
            icon: <RedoIcon />,
            shortcut: "Mod+Shift+Z",
            run: onRedo,
            disabled: !canRedo,
        },
        {
            id: "clone",
            label: "Clone active material",
            group: "Edit",
            icon: <CloneIcon />,
            run: onClone,
        },
        {
            id: "conventional-cell",
            label: "Use conventional cell",
            group: "Edit",
            icon: <ConventionalCellIcon />,
            run: onUseConventionalCell,
        },
        {
            id: "import-standata",
            label: "Import from Standata",
            group: "Input/Output",
            icon: <SearchIcon />,
            run: () => onOpenDialog("standata"),
        },
        {
            id: "upload",
            label: "Upload from disk",
            group: "Input/Output",
            icon: <UploadIcon />,
            run: () => onOpenDialog("upload"),
        },
        {
            id: "export",
            label: "Export materials",
            group: "Input/Output",
            icon: <GetAppIcon />,
            shortcut: "Mod+E",
            run: () => openLocalDialog("showExportMaterialsDialog"),
        },
        {
            id: "supercell",
            label: "Create supercell",
            group: "Advanced",
            icon: <SupercellIcon />,
            run: () => openLocalDialog("showSupercellDialog"),
        },
        {
            id: "surface",
            label: "Create surface / slab",
            group: "Advanced",
            icon: <SlabIcon />,
            run: () => openLocalDialog("showSurfaceDialog"),
        },
        {
            id: "boundary-conditions",
            label: "Set boundary conditions",
            group: "Advanced",
            icon: <BoundaryConditionsIcon />,
            run: () => openLocalDialog("showBoundaryConditionsDialog"),
        },
        {
            id: "combinatorial-set",
            label: "Generate combinatorial set",
            group: "Advanced",
            icon: <CombinatorialSetIcon />,
            run: () => openLocalDialog("showCombinatorialDialog"),
        },
        {
            id: "interpolated-set",
            label: "Generate interpolated set",
            group: "Advanced",
            icon: <InterpolatedSetIcon />,
            run: () => openLocalDialog("showInterpolateDialog"),
        },
        {
            id: "jupyterlite-transformation",
            label: "JupyterLite transformation",
            group: "Advanced",
            icon: <Terminal />,
            run: () => openLocalDialog("showJupyterLiteTransformation"),
        },
    ];
}

/**
 * Whether a keyboard shortcut should be ignored because the user is typing. The basis editor and
 * the name fields have their own undo stacks, and stealing Mod+Z from them would lose text.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
    // Duck-typed rather than `instanceof HTMLElement`: an element from another document (the
    // JupyterLite iframe) belongs to a different realm and would fail the instance check.
    const element = target as Partial<
        Pick<HTMLElement, "tagName" | "isContentEditable" | "closest">
    > | null;
    if (!element) return false;
    return (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.isContentEditable === true ||
        Boolean(element.closest?.(".cm-editor"))
    );
}

/** Matches a keyboard event against a "Mod+Shift+Z"-style descriptor. */
export function matchesShortcut(event: KeyboardEvent, shortcut?: string): boolean {
    if (!shortcut) return false;
    const parts = shortcut.split("+");
    const key = parts[parts.length - 1].toLowerCase();
    const needsShift = parts.includes("Shift");
    const needsMod = parts.includes("Mod");
    const hasMod = event.metaKey || event.ctrlKey;
    return (
        event.key.toLowerCase() === key &&
        hasMod === needsMod &&
        event.shiftKey === needsShift &&
        !event.altKey
    );
}
