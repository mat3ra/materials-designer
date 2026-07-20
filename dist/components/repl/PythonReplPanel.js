import { jsx as _jsx } from "react/jsx-runtime";
import Paper from "@mui/material/Paper";
import { theme } from "../../settings";
import PythonRepl from "./PythonRepl";
/**
 * Placement wrapper for {@link PythonRepl}. Phase 1 docks it as a bottom panel so the 3D viewer
 * stays visible above while typing. Follow-up (Track A): a draggable splitter + a viewer↔middle
 * relocation toggle; Track B replaces this with a react-mosaic tile — neither touches PythonRepl.
 */
function PythonReplPanel({ materials, activeIndex, onReplSync, show, wheelBaseUrl, }) {
    if (!show)
        return null;
    return (_jsx(Paper, { id: "python-repl-panel", square: true, sx: {
            height: 320,
            borderTop: `2px solid ${theme.palette.grey[800]}`,
        }, children: _jsx(PythonRepl, { materials: materials, activeIndex: activeIndex, onReplSync: onReplSync, show: show, wheelBaseUrl: wheelBaseUrl }) }));
}
export default PythonReplPanel;
