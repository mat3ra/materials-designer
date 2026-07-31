import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import Box from "@mui/material/Box";
import PythonRepl from "./PythonRepl";
function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }) {
    return (_jsx(Box, { sx: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: _jsx(PythonRepl, { materials: materials, activeIndex: activeIndex, onReplSync: onReplSync, show: show, wheelBaseUrl: wheelBaseUrl }) }) }));
}
export default PythonReplPanel;
