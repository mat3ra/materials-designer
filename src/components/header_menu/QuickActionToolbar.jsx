import CodeIcon from "@mui/icons-material/Code";
import SearchIcon from "@mui/icons-material/Search";
import ThreeDIcon from "@mui/icons-material/ViewInAr";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";
import { formatShortcut, TOOLBAR_ACTION_IDS } from "./actions";

/**
 * Fixed so the panels below can subtract it. Kept in sync with `main.css`, which sizes the 3D
 * canvas and the basis editor off the same total: see APP_BAR_HEIGHT in MaterialsDesigner.
 */
export const QUICK_ACTIONS_HEIGHT = 38;

const PANEL_TOGGLES = [
    { name: "ItemsList", label: "Materials list", icon: <ViewSidebarIcon fontSize="small" /> },
    { name: "SourceEditor", label: "Source editor", icon: <CodeIcon fontSize="small" /> },
    { name: "ThreeDEditorFullscreen", label: "3D viewer", icon: <ThreeDIcon fontSize="small" /> },
];

/**
 * A slim row of the most-used actions under the menu bar, so the common operations cost one click
 * instead of two. Everything here is also reachable from the menus and the command palette.
 */
function QuickActionToolbar({
    actions,
    onOpenPalette,
    onSectionVisibilityToggle,
    visibilityByName,
}) {
    const actionById = new Map(actions.map((action) => [action.id, action]));
    return (
        <Toolbar
            variant="dense"
            className="materials-designer-quick-actions"
            sx={{
                minHeight: QUICK_ACTIONS_HEIGHT,
                height: QUICK_ACTIONS_HEIGHT,
                gap: 0.25,
                borderTop: `1px solid ${theme.palette.grey[900]}`,
            }}
        >
            {TOOLBAR_ACTION_IDS.map((id, position) => {
                if (id === "|") {
                    // eslint-disable-next-line react/no-array-index-key
                    return <Divider key={`sep-${position}`} orientation="vertical" flexItem />;
                }
                const action = actionById.get(id);
                if (!action) return null;
                const shortcut = formatShortcut(action.shortcut);
                return (
                    <Tooltip
                        key={action.id}
                        title={shortcut ? `${action.label} (${shortcut})` : action.label}
                    >
                        <IconButton
                            size="small"
                            color="inherit"
                            aria-label={action.label}
                            className={`quick-action quick-action-${action.id}`}
                            onClick={action.run}
                        >
                            {action.icon}
                        </IconButton>
                    </Tooltip>
                );
            })}

            <Box sx={{ flex: 1 }} />

            <Tooltip title={`Search actions and materials (${formatShortcut("Mod+K")})`}>
                <Button
                    size="small"
                    color="inherit"
                    variant="outlined"
                    startIcon={<SearchIcon fontSize="small" />}
                    className="open-command-palette"
                    onClick={onOpenPalette}
                    sx={{
                        textTransform: "none",
                        borderColor: theme.palette.grey[800],
                        color: theme.palette.grey[500],
                        display: { xs: "none", md: "inline-flex" },
                    }}
                >
                    Search…
                </Button>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            {PANEL_TOGGLES.map(({ name, label, icon }) => (
                <Tooltip key={name} title={`${visibilityByName[name] ? "Hide" : "Show"} ${label}`}>
                    <IconButton
                        size="small"
                        aria-label={`${visibilityByName[name] ? "Hide" : "Show"} ${label}`}
                        className={`panel-toggle panel-toggle-${name}`}
                        color={visibilityByName[name] ? "primary" : "inherit"}
                        onClick={() => onSectionVisibilityToggle(name)}
                    >
                        {icon}
                    </IconButton>
                </Tooltip>
            ))}
        </Toolbar>
    );
}

QuickActionToolbar.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    actions: PropTypes.array.isRequired,
    onOpenPalette: PropTypes.func.isRequired,
    onSectionVisibilityToggle: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    visibilityByName: PropTypes.object.isRequired,
};

export default QuickActionToolbar;
