import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import Box from "@mui/material/Box";
import PythonRepl from "./PythonRepl";
/**
 * Hidden with `display: none` rather than unmounted, so the ~30s Pyodide environment and the REPL's
 * persistent namespace survive the panel being toggled closed and open again.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer's own default. Passing it makes ResizableDrawer
 * position the paper absolutely against the MD container, which leaves it stuck ~100px above the
 * viewport bottom; without it the paper stays viewport-fixed at the bottom, which is what we want.
 */
function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }) {
    return (_jsx(Box, { sx: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: _jsx(PythonRepl, { materials: materials, activeIndex: activeIndex, onReplSync: onReplSync, show: show, wheelBaseUrl: wheelBaseUrl }) }) }));
}
export default PythonReplPanel;
