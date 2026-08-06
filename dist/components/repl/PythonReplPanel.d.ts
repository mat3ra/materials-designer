import type { MDMaterial } from "../../MDMaterial";
import type { MaterialsSyncPayload } from "./materialsDataBridge";
interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
    requirementsUrl?: string;
    pyodideLockUrl?: string;
}
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, requirementsUrl, pyodideLockUrl, }: PythonReplPanelProps): import("react/jsx-runtime").JSX.Element;
export default PythonReplPanel;
