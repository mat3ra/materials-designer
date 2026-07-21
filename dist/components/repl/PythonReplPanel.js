import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@exabyte-io/cove.js/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import PythonRepl from "./PythonRepl";
/**
 * Docks {@link PythonRepl} in cove.js's bottom {@link ResizableDrawer} — exactly like the JupyterLite
 * session drawer, so the REPL behaves like the rest of the app. Kept mounted (hidden via display) when
 * closed so the persistent Pyodide session survives toggling.
 *
 * Note: no `containerRef` is passed to ResizableDrawer, matching JupyterLiteSessionDrawer — passing it
 * makes the drawer position absolutely inside the MD container and stick ~100px above the viewport
 * bottom instead of anchoring to it.
 */
function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }) {
    return (_jsx("div", { style: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: _jsx(PythonRepl, { materials: materials, activeIndex: activeIndex, onReplSync: onReplSync, show: show, wheelBaseUrl: wheelBaseUrl }) }) }));
}
export default PythonReplPanel;
