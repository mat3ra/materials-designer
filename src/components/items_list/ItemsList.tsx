import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import CloseIcon from "@mui/icons-material/Close";
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
import React from "react";

import type { MDMaterial } from "../../MDMaterial";
import { theme } from "../../settings";
import { isTypingTarget } from "../header_menu/actions";
import ItemsListHeader, { buildAddActions } from "./ItemsListHeader";

/** Short structural facts for a list row: lattice type and site count. */
function describeStructure(material: MDMaterial): string[] {
    const facts: string[] = [];
    try {
        if (material.lattice?.type) facts.push(material.lattice.type);
        const sites = material.getBasis().elements.length;
        if (sites) facts.push(`${sites} ${sites === 1 ? "site" : "sites"}`);
    } catch (error) {
        // A material that cannot describe itself still gets a row, just a plainer one.
    }
    return facts;
}

export interface ItemsListProps {
    materials: MDMaterial[];
    index: number;
    updatedIndices: number[];
    onItemClick: (index: number) => void;
    onRemove: (index: number) => void;
    onNameUpdate: (name: string, index: number) => void;
    /** Puts a removed material back; without it, removal is not offered as undoable. */
    onRestore?: (material: MDMaterial, index: number) => void;
    onClone: () => void;
    onImport: () => void;
    onUpload: () => void;
}

interface ItemsListState {
    /** Buffer for the name field of the row being renamed; null once the edit is committed. */
    editedName: string | null;
    /** Index of the row being renamed, or -1 when none is. */
    editedIndex: number | null;
    filter: string;
}

/** One filtered row, carrying the index the material has in the unfiltered list. */
interface VisibleEntry {
    material: MDMaterial;
    index: number;
}

class ItemsList extends React.Component<ItemsListProps, ItemsListState> {
    constructor(props: ItemsListProps) {
        super(props);
        this.state = this.defaultState;
        this.focusListItem = this.focusListItem.bind(this);
        this.blurListItem = this.blurListItem.bind(this);
        this.initControlsSwitchFromKeyboard = this.initControlsSwitchFromKeyboard.bind(this);
        window.addEventListener("keydown", this.initControlsSwitchFromKeyboard, false);
    }

    get defaultState(): ItemsListState {
        const { materials, index } = this.props;
        return {
            editedName: materials[index].name,
            editedIndex: -1,
            filter: "",
        };
    }

    /** Materials matching the filter, each keeping the index it has in the unfiltered list. */
    get visibleEntries(): VisibleEntry[] {
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

    componentDidUpdate(prevProps: ItemsListProps) {
        const { materials, index } = this.props;
        if (prevProps.materials.length > materials.length)
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ editedName: materials[index].name, editedIndex: index });
    }

    initControlsSwitchFromKeyboard(event: KeyboardEvent) {
        const { materials, index, onItemClick } = this.props;
        if (!event.shiftKey) return; // Shift key must be down
        // Shift is also how you type a capital letter. Without this, naming a material "Diamond"
        // or filtering for "Si" would switch the active material mid-word.
        if (isTypingTarget(event.target)) return;
        if (event.metaKey || event.ctrlKey || event.altKey) return;

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

    focusListItem(event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) {
        this.setState({ editedIndex: index, editedName: event.target.value });
    }

    blurListItem() {
        const { materials, onItemClick, onNameUpdate, index } = this.props;
        const { editedName, editedIndex } = this.state;
        // Clicking a row focuses its name field, so simply browsing the list used to dispatch a
        // rename on every click-away - each one an undo step for a name that never changed. The
        // null checks matter too: a blur that arrives with the buffer already cleared would
        // otherwise rename material `null` to `null`.
        if (editedIndex !== null && editedIndex >= 0 && editedName !== null) {
            const edited = materials[editedIndex];
            if (edited && edited.name !== editedName) onNameUpdate(editedName, editedIndex);
        }
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
    onDeleteIconClick(e: React.MouseEvent, index: number) {
        const { materials, onRemove, onRestore } = this.props;
        e.preventDefault();
        // Captured before the removal so the offer to undo restores this exact material - including
        // its original signature - at the position it came from.
        const removed = materials[index];
        onRemove(index);
        // Removing the last material is refused by the reducer, so there would be nothing to undo.
        if (materials.length <= 1 || !onRestore) return;
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
    onItemListClick(e: React.MouseEvent, index: number) {
        const { onItemClick } = this.props;
        if (e.defaultPrevented) return;
        e.preventDefault();
        onItemClick(index);
    }

    renderListItem(
        entity: MDMaterial,
        index: number,
        indexFromState: number,
        updatedIndices: number[],
    ) {
        const { name, isNonPeriodic } = entity;
        const isUpdated = updatedIndices.includes(index);
        const { editedIndex, editedName } = this.state;
        const isBeingEdited = editedIndex === index;
        const isBeingActive = index === indexFromState;
        // Once per row: describeStructure parses the basis, which is not free for large materials.
        const structureFacts = describeStructure(entity);
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
                                size="small"
                                aria-label={`Remove ${name}`}
                                className="list-item-icon icon-button-delete"
                                onClick={(e) => {
                                    this.onDeleteIconClick(e, index);
                                }}
                                // Quiet until wanted: a row is for picking a material, not for
                                // deleting one, so the control only gains contrast on approach.
                                sx={{
                                    padding: 0.25,
                                    color: theme.palette.grey[700],
                                    "&:hover": { color: theme.palette.grey[300] },
                                }}
                            >
                                <CloseIcon sx={{ fontSize: "1rem" }} />
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
                            // One line that clips, never a second row: a narrow sidebar used to
                            // wrap "24 sites" onto its own line and make every item look
                            // two-storey. Facts are joined into a single text node so a break can
                            // only ever happen between the formula and the rest.
                            // TODO: avoid setting font size in sx and use theme variants instead
                            <Typography
                                variant="caption"
                                component="span"
                                title={[entity.formula, ...structureFacts].join(" · ")}
                                sx={{
                                    fontSize: "0.8em",
                                    display: "flex",
                                    alignItems: "center",
                                    flexWrap: "nowrap",
                                    gap: 0.75,
                                    minWidth: 0,
                                }}
                            >
                                <Box
                                    component="code"
                                    sx={{
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        flexShrink: 1,
                                    }}
                                >
                                    {entity.formula}
                                </Box>
                                <Box
                                    component="span"
                                    sx={{
                                        color: theme.palette.grey[600],
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        flexShrink: 1,
                                    }}
                                >
                                    {structureFacts.join(" · ")}
                                </Box>
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
                                                flexShrink: 0,
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

export default ItemsList;
