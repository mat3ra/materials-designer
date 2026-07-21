import type { MDMaterial } from "../../MDMaterial";
import type { ReplSyncOperation } from "./PyodideReplSession";
interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
}
/**
 * Docks {@link PythonRepl} in cove.js's bottom {@link ResizableDrawer} — exactly like the JupyterLite
 * session drawer, so the REPL behaves like the rest of the app. Kept mounted (hidden via display) when
 * closed so the persistent Pyodide session survives toggling.
 *
 * Note: no `containerRef` is passed to ResizableDrawer, matching JupyterLiteSessionDrawer — passing it
 * makes the drawer position absolutely inside the MD container and stick ~100px above the viewport
 * bottom instead of anchoring to it.
 */
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element;
export default PythonReplPanel;
