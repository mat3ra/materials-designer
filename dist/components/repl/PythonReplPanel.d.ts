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
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element;
export default PythonReplPanel;
