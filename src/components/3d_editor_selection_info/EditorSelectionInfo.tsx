import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React from "react";

import type { MDMaterial } from "../../MDMaterial";
import { theme } from "../../settings";
import { formatShortcut } from "../header_menu/actions";
import { describeMaterial } from "./materialInfo";

/**
 * A single strip, not a panel: label and value sit on one line so the bar can stay out of the
 * way. Every pixel here is a pixel the 3D canvas does not get.
 */
export const FOOTER_HEIGHT = 36;

interface InfoGroupProps {
    label: string;
    children?: React.ReactNode;
    title?: string;
    className?: string;
}

function InfoGroup({ label, children, title, className }: InfoGroupProps) {
    const content = (
        <Box
            className={className}
            sx={{ display: "flex", alignItems: "baseline", gap: 0.75, minWidth: 0 }}
        >
            <Typography
                variant="caption"
                sx={{
                    fontSize: "0.6rem",
                    letterSpacing: "0.08em",
                    color: theme.palette.grey[600],
                    flexShrink: 0,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                sx={{
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}
            >
                {children}
            </Typography>
        </Box>
    );
    return title ? <Tooltip title={title}>{content}</Tooltip> : content;
}

export interface EditorSelectionInfoProps {
    material?: MDMaterial;
    index?: number;
    materialsCount?: number;
}

/**
 * Status bar under the three editor panels: what the active material is and where it sits in the
 * list.
 *
 * Selection detail is deliberately absent: wave.js renders its own StatusBar and
 * SelectionInspector inside the 3D editor, so what is selected is described there, next to the
 * atoms it refers to. This bar covers what wave cannot know - the material and the list around it.
 */
function EditorSelectionInfo({
    material,
    index = 0,
    materialsCount = 0,
}: EditorSelectionInfoProps) {
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
            <InfoGroup label="MATERIAL" className="status-material">
                {materialInfo.text}
            </InfoGroup>
            <Divider orientation="vertical" flexItem sx={{ my: 0.75 }} />
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
                {`Shift+U / Shift+D switch material · ${formatShortcut("Mod+K")} to search`}
            </Typography>
        </Box>
    );
}

export default EditorSelectionInfo;
