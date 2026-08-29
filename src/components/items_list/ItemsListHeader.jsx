import Dropdown from "@mat3ra/cove/dist/mui/components/dropdown/Dropdown";
import IconByName from "@mat3ra/cove/dist/mui/components/icon/IconByName";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Close";
import CloneIcon from "@mui/icons-material/Collections";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";

/**
 * Title, count, filter and the "add material" menu. Deliberately rendered outside the list's `ul`:
 * the Cypress widgets address items as `ul > div:nth-of-type(N) li`.
 */
function ItemsListHeader({ filter, onFilterChange, shownCount, totalCount, addActions }) {
    return (
        <Box
            className="materials-designer-items-list-header"
            sx={{
                padding: theme.spacing(1, 1.25, 1),
                borderBottom: `1px solid ${theme.palette.grey[800]}`,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                <Typography
                    variant="caption"
                    sx={{ letterSpacing: "0.08em", color: theme.palette.grey[500] }}
                >
                    MATERIALS
                </Typography>
                <Chip
                    size="small"
                    className="materials-count"
                    label={filter ? `${shownCount} / ${totalCount}` : totalCount}
                    sx={{ height: 18, fontSize: "0.7rem" }}
                />
                <Box sx={{ flex: 1 }} />
                <Dropdown
                    id="add-material-menu"
                    className="add-material-menu"
                    actions={addActions}
                    popperProps={{ id: "add-material-popper" }}
                >
                    <Tooltip title="Add a material">
                        <IconButton size="small" aria-label="Add a material">
                            <AddIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Dropdown>
            </Box>
            <TextField
                fullWidth
                size="small"
                variant="outlined"
                className="materials-filter"
                placeholder="Filter by name or formula"
                value={filter}
                onChange={(event) => onFilterChange(event.target.value)}
                // Escape clears rather than closes: there is nothing to close, and a filter that
                // hides every material is otherwise a small dead end to type your way out of.
                onKeyDown={(event) => {
                    if (event.key !== "Escape" || !filter) return;
                    event.stopPropagation();
                    onFilterChange("");
                }}
                inputProps={{ "aria-label": "Filter materials", autoComplete: "off" }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: "1rem", color: theme.palette.grey[600] }} />
                        </InputAdornment>
                    ),
                    endAdornment: filter ? (
                        <InputAdornment position="end">
                            <Tooltip title="Clear filter (Esc)">
                                <IconButton
                                    size="small"
                                    aria-label="Clear filter"
                                    className="materials-filter-clear"
                                    onClick={() => onFilterChange("")}
                                    sx={{ padding: 0.25 }}
                                >
                                    <ClearIcon sx={{ fontSize: "0.9rem" }} />
                                </IconButton>
                            </Tooltip>
                        </InputAdornment>
                    ) : null,
                    sx: { fontSize: "0.8rem" },
                }}
            />
        </Box>
    );
}

ItemsListHeader.propTypes = {
    filter: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
    shownCount: PropTypes.number.isRequired,
    totalCount: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    addActions: PropTypes.array.isRequired,
};

/** Actions for the "+" menu, in the shape cove's Dropdown expects. */
export function buildAddActions({ onClone, onImport, onUpload }) {
    return [
        {
            id: "clone-active-material",
            content: "Clone active material",
            icon: <CloneIcon fontSize="small" />,
            onClick: onClone,
        },
        {
            id: "import-from-standata",
            content: "Import from Standata",
            icon: <IconByName name="actions.download" fontSize="small" />,
            onClick: onImport,
        },
        {
            id: "upload-from-disk",
            content: "Upload from disk",
            icon: <IconByName name="actions.upload" fontSize="small" />,
            onClick: onUpload,
        },
    ];
}

export default ItemsListHeader;
