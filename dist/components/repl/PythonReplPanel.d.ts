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
 * Hidden with `display: none` rather than unmounted, so the ~30s Pyodide environment and the REPL's
 * persistent namespace survive the panel being toggled closed and open again.
 *
 * No `containerRef` — matching JupyterLiteSessionDrawer's own default. Passing it makes ResizableDrawer
 * position the paper absolutely against the MD container, which leaves it stuck ~100px above the
 * viewport bottom; without it the paper stays viewport-fixed at the bottom, which is what we want.
 */
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element;
export default PythonReplPanel;
