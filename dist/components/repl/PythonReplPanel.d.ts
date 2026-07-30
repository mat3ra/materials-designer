import type { MDMaterial } from "../../MDMaterial";
import type { ReplSyncOperation } from "./MaterialsReplSession";
interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
}
/**
 * Docks the REPL in cove's bottom drawer, like the JupyterLite session. Stays mounted (hidden) when
 * closed so the Pyodide session survives toggling.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer. Passing it positions the drawer absolutely
 * inside the MD container, leaving it stuck ~100px above the viewport bottom.
 */
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element;
export default PythonReplPanel;
