import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import setClass from "classnames";
import { closeSnackbar, enqueueSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";
import ItemsListHeader, { buildAddActions } from "./ItemsListHeader";

/** Short structural facts for a list row: lattice type and site count. */
function describeStructure(material) {
    const facts = [];
    try {
        if (material.lattice?.type) facts.push(material.lattice.type);
        const sites = material.getBasis().elements.length;
        if (sites) facts.push(`${sites} ${sites === 1 ? "site" : "sites"}`);
    } catch (error) {
        // A material that cannot describe itself still gets a row, just a plainer one.
    }
    return facts;
}

class ItemsList extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.defaultState;
        this.focusListItem = this.focusListItem.bind(this);
        this.blurListItem = this.blurListItem.bind(this);
        this.initControlsSwitchFromKeyboard = this.initControlsSwitchFromKeyboard.bind(this);
        window.addEventListener("keydown", this.initControlsSwitchFromKeyboard, false);
    }

    get defaultState() {
        const { materials, index } = this.props;
        return {
            editedName: materials[index].name,
            editedIndex: -1,
            filter: "",
        };
    }

    /** Materials matching the filter, each keeping the index it has in the unfiltered list. */
    get visibleEntries() {
        const { materials } = this.props;
        const { filter } = this.state;
        const query = filter.trim().toLowerCase();
        const entries = materials.map((material, index) => ({ material, index }));
        if (!query) return entries;
        return entries.filter(({ material }) =>
            [material.name, material.formula].some((value) =>
                String(value || "")
                    .toLowerCase()
                    .includes(query),
            ),
        );
    }

    componentDidUpdate(prevProps) {
        const { materials, index } = this.props;
        if (prevProps.materials.length > materials.length)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ editedName: materials[index].name, editedIndex: index });
    }

    initControlsSwitchFromKeyboard(event) {
        const { materials, index, onItemClick } = this.props;
        if (!event.shiftKey) return; // Shift key must be down

        const nextIndex = materials.length === 1 + index ? 0 : index + 1;
        const previousIndex = index === 0 ? materials.length - 1 : index - 1;

        switch (event.keyCode) {
            case 85: // U
                onItemClick(previousIndex); // Up => decreasing index, b/c of descending order
                break;
            case 68: // D
                onItemClick(nextIndex);
                break;
            default:
        }
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.initControlsSwitchFromKeyboard, false);
    }

    focusListItem(event, index) {
        this.setState({ editedIndex: index, editedName: event.target.value });
    }

    blurListItem() {
        const { onItemClick, onNameUpdate, index } = this.props;
        const { editedName, editedIndex } = this.state;
        onNameUpdate(editedName, editedIndex);
        onItemClick(index);
        this.setState({ editedName: null, editedIndex: null });
    }

    /**
     * Used when clicking remove item
     * e.preventDefault is used to inform further
     * elements that event is already handled and they should skip
     * handling it, otherwise the page can crash.
     * @param {React.MouseEvent} e - JS DOM event
     * @param {Number} index - index of element that should be removed
     */
    // eslint-disable-next-line react/sort-comp
    onDeleteIconClick(e, index) {
        const { materials, onRemove, onRestore } = this.props;
        e.preventDefault();
        // Captured before the removal so the offer to undo restores this exact material - including
        // its original signature - at the position it came from.
        const removed = materials[index];
        const canRestore = materials.length > 1 && Boolean(onRestore);
        onRemove(index);
        if (!canRestore) return;
        // The undo control lives in the message rather than notistack's `action` slot: cove's
        // AlertProvider supplies its own Snackbar component for every variant, and that component
        // renders only the message.
        const snackbarKey = `undo-remove-${removed.name}-${index}`;
        enqueueSnackbar(
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span>Removed “{removed.name}”</span>
                <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
                    className="undo-remove-material"
                    onClick={() => {
                        onRestore(removed, index);
                        closeSnackbar(snackbarKey);
                    }}
                >
                    Undo
                </Button>
            </Box>,
            { variant: "default", key: snackbarKey },
        );
    }

    /**
     * this function is used for handling clicks on different elements
     * here is used check if the event is default prevented in order to
     * avoid propagated actions that already was handled and don't handle
     * extra actions that can lead to page crashes
     * @param {React.MouseEvent} e - js dom event
     * @param {Number} index - index of element that should be removed
     */
    onItemListClick(e, index) {
        const { onItemClick } = this.props;
        if (e.defaultPrevented) return;
        e.preventDefault();
        onItemClick(index);
    }

    renderListItem(entity, index, indexFromState, updatedIndices) {
        const { name, isNonPeriodic } = entity;
        const isUpdated = updatedIndices.includes(index);
        const { editedIndex, editedName } = this.state;
        const isBeingEdited = editedIndex === index;
        const isBeingActive = index === indexFromState;
        const dynamicIconColor = isBeingActive ? theme.palette.grey[300] : theme.palette.grey[900];
        const neutralColor = theme.palette.grey[500];
        return (
            <Paper elevation={isBeingActive ? 8 : 2} key={name + "-" + index}>
                <ListItem
                    dense
                    divider
                    onClick={(e) => this.onItemListClick(e, index)}
                    className={setClass(
                        { active: isBeingEdited || isBeingActive },
                        { updated: isUpdated || isBeingEdited },
                    )}
                    secondaryAction={
                        <Tooltip title={`Remove "${name}"`}>
                            <IconButton
                                edge="end"
                                aria-label={`Remove ${name}`}
                                className="list-item-icon icon-button-delete"
                                onClick={(e) => {
                                    this.onDeleteIconClick(e, index);
                                }}
                            >
                                <DeleteIcon sx={{ color: neutralColor }} />
                            </IconButton>
                        </Tooltip>
                    }
                    sx={{
                        // TODO: figure out why "dense" prop doesn't work and remove this
                        paddingY: 0,
                    }}
                >
                    <ListItemAvatar>
                        <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            badgeContent={
                                entity.id ? (
                                    <Avatar
                                        variant="circular"
                                        sx={{
                                            width: 20,
                                            height: 20,
                                            border: `1px solid ${dynamicIconColor}`,
                                            color: dynamicIconColor,
                                        }}
                                    >
                                        <IconByName
                                            sx={{ width: 14, height: 14 }}
                                            name="actions.save"
                                        />
                                    </Avatar>
                                ) : null
                            }
                        >
                            <Avatar variant="circular">
                                <IconButton
                                    sx={{
                                        color: dynamicIconColor,
                                        ...(isBeingActive
                                            ? { border: `1px solid ${dynamicIconColor}` }
                                            : null),
                                    }}
                                >
                                    <IconByName
                                        name={
                                            isNonPeriodic
                                                ? "entities.material.nonPeriodic"
                                                : "entities.material"
                                        }
                                    />
                                </IconButton>
                            </Avatar>
                        </Badge>
                    </ListItemAvatar>

                    <ListItemText
                        sx={{ my: 0.25, color: isBeingActive ? "inherit" : neutralColor }}
                        className="list-item-text"
                        primary={
                            <TextField
                                className="list-item-text_primary"
                                fullWidth
                                variant="standard"
                                size="small"
                                onFocus={(e) => this.focusListItem(e, index)}
                                value={isBeingEdited ? editedName : entity.name}
                                onChange={(event) =>
                                    this.setState({ editedName: event.target.value })
                                }
                                onBlur={this.blurListItem}
                                InputProps={{
                                    disableUnderline: !isBeingEdited,
                                    style: { color: "inherit" },
                                }}
                            />
                        }
                        secondary={
                            // TODO: avoid setting font size in sx and use theme variants instead
                            <Typography
                                variant="caption"
                                component="span"
                                sx={{
                                    fontSize: "0.8em",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                }}
                            >
                                <code>{entity.formula}</code>
                                {describeStructure(entity).map((fact) => (
                                    <Box
                                        key={fact}
                                        component="span"
                                        sx={{ color: theme.palette.grey[600] }}
                                    >
                                        {fact}
                                    </Box>
                                ))}
                                {isUpdated && (
                                    <Tooltip title="Edited since it entered the session">
                                        <Box
                                            component="span"
                                            className="material-updated-dot"
                                            sx={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: "50%",
                                                backgroundColor: "warning.main",
                                            }}
                                        />
                                    </Tooltip>
                                )}
                            </Typography>
                        }
                    />
                </ListItem>
            </Paper>
        );
    }

    render() {
        const { materials, index, updatedIndices, onClone, onImport, onUpload } = this.props;
        const { filter } = this.state;
        const entries = this.visibleEntries;
        return (
            <>
                <ItemsListHeader
                    filter={filter}
                    onFilterChange={(value) => this.setState({ filter: value })}
                    shownCount={entries.length}
                    totalCount={materials.length}
                    addActions={buildAddActions({ onClone, onImport, onUpload })}
                />
                <List
                    sx={{
                        // TODO: figure out why "dense" prop doesn't work and remove this
                        paddingY: 0,
                    }}
                >
                    {entries.map(({ material, index: materialIndex }) =>
                        this.renderListItem(material, materialIndex, index, updatedIndices),
                    )}
                </List>
                {entries.length === 0 && (
                    <Typography
                        variant="body2"
                        className="materials-empty-state"
                        sx={{ p: 2, textAlign: "center", color: theme.palette.grey[600] }}
                    >
                        No materials match “{filter}”.
                    </Typography>
                )}
            </>
        );
    }
}

ItemsList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    materials: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    updatedIndices: PropTypes.arrayOf(PropTypes.number).isRequired,
    onItemClick: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
    onNameUpdate: PropTypes.func.isRequired,
    /** Puts a removed material back; without it, removal is not offered as undoable. */
    onRestore: PropTypes.func,
    onClone: PropTypes.func.isRequired,
    onImport: PropTypes.func.isRequired,
    onUpload: PropTypes.func.isRequired,
};

ItemsList.defaultProps = {
    onRestore: undefined,
};

export default ItemsList;
