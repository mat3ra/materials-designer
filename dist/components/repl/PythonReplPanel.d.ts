import type { MDMaterial } from "../../MDMaterial";
import type { ReplSyncOperation } from "./PyodideReplSession";
interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    wheelBaseUrl?: string;
}
/**
 * Placement wrapper for {@link PythonRepl}. Phase 1 docks it as a bottom panel so the 3D viewer
 * stays visible above while typing. Follow-up (Track A): a draggable splitter + a viewer↔middle
 * relocation toggle; Track B replaces this with a react-mosaic tile — neither touches PythonRepl.
 */
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, wheelBaseUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element | null;
export default PythonReplPanel;
