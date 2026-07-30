import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import PythonRepl from "./PythonRepl";
/**
 * Docks the REPL in cove's bottom drawer, like the JupyterLite session. Stays mounted (hidden) when
 * closed so the Pyodide session survives toggling.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer. Passing it positions the drawer absolutely
 * inside the MD container, leaving it stuck ~100px above the viewport bottom.
 */
function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }) {
    return (_jsx("div", { style: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: _jsx(PythonRepl, { materials: materials, activeIndex: activeIndex, onReplSync: onReplSync, show: show, wheelBaseUrl: wheelBaseUrl }) }) }));
}
export default PythonReplPanel;
