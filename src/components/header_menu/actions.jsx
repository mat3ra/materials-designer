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
export function formatShortcut(shortcut) {
    if (!shortcut) return "";
    return isMac()
        ? shortcut.replace("Mod+", "⌘").replace("Shift+", "⇧")
        : shortcut.replace("Mod+", "Ctrl+");
}

/**
 * The single registry of invocable actions, shared by the quick-action toolbar, the keyboard
 * shortcuts and the command palette so the three can never drift. Each entry:
 * `{ id, label, group, icon, shortcut, run, disabled? }`. A `disabled` entry is greyed out on the
 * toolbar, skipped by the shortcut handler and left out of the palette.
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
}) {
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
export function isTypingTarget(target) {
    if (!target) return false;
    const tag = target.tagName;
    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        target.isContentEditable === true ||
        Boolean(target.closest?.(".cm-editor"))
    );
}

/** Matches a keyboard event against a "Mod+Shift+Z"-style descriptor. */
export function matchesShortcut(event, shortcut) {
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
