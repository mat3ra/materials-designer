import HexIcon from "@mui/icons-material/Hexagon";
import SearchIcon from "@mui/icons-material/Search";
import UploadIcon from "@mui/icons-material/Upload";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";
import { formatShortcut } from "./actions";

const MAX_PER_GROUP = 6;

function matches(query, text) {
    return String(text || "")
        .toLowerCase()
        .includes(query);
}

/**
 * Builds the palette's entries for a query: the invocable actions, the materials in the session,
 * and the Standata library. Standata is only searched once the user types, since it is long and
 * would otherwise bury the actions.
 */
export function buildEntries({
    query,
    actions,
    materials,
    standataConfigs,
    onGoToMaterial,
    onImportStandata,
}) {
    const q = query.trim().toLowerCase();
    const entries = [];

    actions
        // An unavailable action is left out rather than greyed out: a palette is a place to reach
        // for something, and offering "Undo" with an empty history is only a dead end.
        .filter((action) => !action.disabled)
        .filter((action) => !q || matches(q, `${action.label} ${action.group}`))
        .forEach((action) => entries.push({ ...action, kind: "action" }));

    materials.forEach((material, index) => {
        if (q && !matches(q, `${material.name} ${material.formula}`)) return;
        entries.push({
            id: `material-${index}`,
            kind: "material",
            group: "Materials in session",
            label: material.name,
            hint: material.formula,
            icon: <HexIcon />,
            run: () => onGoToMaterial(index),
        });
    });

    if (q) {
        standataConfigs
            .filter((config) => matches(q, config.name))
            .slice(0, MAX_PER_GROUP)
            .forEach((config, index) => {
                entries.push({
                    id: `standata-${index}-${config.name}`,
                    kind: "standata",
                    group: "Import from Standata",
                    label: config.name,
                    icon: <UploadIcon />,
                    run: () => onImportStandata(config),
                });
            });
    }

    return entries;
}

/** One searchable entry point over the actions, the session's materials, and Standata. */
class CommandPalette extends React.Component {
    constructor(props) {
        super(props);
        this.state = { query: "", activeIndex: 0 };
    }

    componentDidUpdate(prevProps) {
        const { open } = this.props;
        if (open && !prevProps.open) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ query: "", activeIndex: 0 });
        }
    }

    get entries() {
        const { actions, materials, standataConfigs, onGoToMaterial, onImportStandata } =
            this.props;
        const { query } = this.state;
        return buildEntries({
            query,
            actions,
            materials,
            standataConfigs,
            onGoToMaterial,
            onImportStandata,
        });
    }

    runEntry = (entry) => {
        const { onClose } = this.props;
        onClose();
        entry?.run?.();
    };

    handleKeyDown = (event) => {
        const { entries } = this;
        const { activeIndex } = this.state;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            this.setState({ activeIndex: Math.min(entries.length - 1, activeIndex + 1) });
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.setState({ activeIndex: Math.max(0, activeIndex - 1) });
        } else if (event.key === "Enter") {
            event.preventDefault();
            this.runEntry(entries[activeIndex]);
        }
    };

    render() {
        const { open, onClose } = this.props;
        const { query, activeIndex } = this.state;
        const { entries } = this;
        let lastGroup = null;
        return (
            <Dialog
                open={open}
                onClose={onClose}
                fullWidth
                maxWidth="sm"
                className="command-palette"
                PaperProps={{ sx: { position: "absolute", top: 64, m: 0 } }}
            >
                <Box sx={{ p: 1.5, borderBottom: `1px solid ${theme.palette.grey[800]}` }}>
                    <TextField
                        autoFocus
                        fullWidth
                        size="small"
                        variant="standard"
                        className="command-palette-input"
                        placeholder="Search actions, materials, Standata…"
                        value={query}
                        onChange={(event) =>
                            this.setState({ query: event.target.value, activeIndex: 0 })
                        }
                        onKeyDown={this.handleKeyDown}
                        inputProps={{ "aria-label": "Search actions and materials" }}
                        InputProps={{
                            disableUnderline: true,
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <List dense sx={{ maxHeight: "50vh", overflowY: "auto", py: 0 }}>
                    {entries.map((entry, index) => {
                        const header = entry.group !== lastGroup ? entry.group : null;
                        lastGroup = entry.group;
                        return (
                            <React.Fragment key={entry.id}>
                                {header && (
                                    <ListSubheader
                                        sx={{
                                            lineHeight: "24px",
                                            fontSize: "0.65rem",
                                            letterSpacing: "0.08em",
                                            backgroundColor: "transparent",
                                        }}
                                    >
                                        {header.toUpperCase()}
                                    </ListSubheader>
                                )}
                                <ListItemButton
                                    selected={index === activeIndex}
                                    className="command-palette-item"
                                    onMouseEnter={() => this.setState({ activeIndex: index })}
                                    onClick={() => this.runEntry(entry)}
                                >
                                    <ListItemIcon sx={{ minWidth: 34 }}>{entry.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={entry.label}
                                        secondary={entry.hint}
                                        primaryTypographyProps={{ variant: "body2" }}
                                    />
                                    {entry.shortcut && (
                                        <Typography
                                            variant="caption"
                                            sx={{ color: theme.palette.grey[600] }}
                                        >
                                            {formatShortcut(entry.shortcut)}
                                        </Typography>
                                    )}
                                </ListItemButton>
                            </React.Fragment>
                        );
                    })}
                    {entries.length === 0 && (
                        <Typography
                            variant="body2"
                            sx={{ p: 2, textAlign: "center", color: theme.palette.grey[600] }}
                        >
                            Nothing matches “{query}”.
                        </Typography>
                    )}
                </List>
            </Dialog>
        );
    }
}

CommandPalette.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    actions: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    materials: PropTypes.array.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    standataConfigs: PropTypes.array,
    onGoToMaterial: PropTypes.func.isRequired,
    onImportStandata: PropTypes.func.isRequired,
};

CommandPalette.defaultProps = { standataConfigs: [] };

export default CommandPalette;
