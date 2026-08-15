import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import PropTypes from "prop-types";
import React from "react";

import { theme } from "../../settings";
import { describeMaterial, describeSelection, SELECTION_HINTS } from "./selectionInfo";

export const FOOTER_HEIGHT = 54;

function InfoGroup({ label, children, title, className }) {
    const content = (
        <Stack spacing={0.25} sx={{ minWidth: 0 }} className={className}>
            <Typography
                variant="caption"
                sx={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    lineHeight: 1,
                    color: theme.palette.grey[600],
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {children}
            </Typography>
        </Stack>
    );
    return title ? <Tooltip title={title}>{content}</Tooltip> : content;
}

InfoGroup.propTypes = {
    label: PropTypes.string.isRequired,
    children: PropTypes.node,
    title: PropTypes.string,
    className: PropTypes.string,
};

InfoGroup.defaultProps = { children: null, title: undefined, className: undefined };

/**
 * Status bar under the three editor panels: what is selected in the 3D editor, what the active
 * material is, and where it sits in the list.
 */
const EditorSelectionInfo = function EditorSelectionInfo({
    material,
    index,
    materialsCount,
    selectedIndices,
}) {
    const selection = describeSelection(material, selectedIndices);
    const materialInfo = describeMaterial(material);
    return (
        <Box
            id="materials-designer-status-bar"
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                padding: theme.spacing(0, 2),
                borderTop: `1px solid ${theme.palette.grey[800]}`,
                height: `${FOOTER_HEIGHT}px`,
                overflowX: "auto",
            }}
        >
            <InfoGroup label="SELECTION" title={selection.tooltip} className="status-selection">
                <Box
                    component="span"
                    sx={{ color: selection.isEmpty ? theme.palette.grey[600] : "primary.light" }}
                >
                    {selection.text}
                </Box>
            </InfoGroup>
            <Divider orientation="vertical" flexItem />
            <InfoGroup label="MATERIAL" className="status-material">{materialInfo.text}</InfoGroup>
            <Divider orientation="vertical" flexItem />
            <InfoGroup label="POSITION" className="status-position">
                {materialsCount ? `${index + 1} / ${materialsCount}` : "—"}
            </InfoGroup>
            <Box sx={{ flex: 1 }} />
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.grey[600],
                    whiteSpace: "nowrap",
                    display: { xs: "none", lg: "block" },
                }}
            >
                {SELECTION_HINTS}
            </Typography>
        </Box>
    );
};

EditorSelectionInfo.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    material: PropTypes.object,
    index: PropTypes.number,
    materialsCount: PropTypes.number,
    selectedIndices: PropTypes.arrayOf(PropTypes.number),
};

EditorSelectionInfo.defaultProps = {
    material: undefined,
    index: 0,
    materialsCount: 0,
    selectedIndices: [],
};

export default EditorSelectionInfo;
