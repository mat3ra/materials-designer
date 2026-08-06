import React from "react";
import type { MDMaterial } from "../../MDMaterial";
import type { MaterialsSyncPayload } from "./materialsDataBridge";
interface PythonReplPanelProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (payload: MaterialsSyncPayload) => void;
    show: boolean;
    onHide: () => void;
    wheelBaseUrl?: string;
}
declare function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }: PythonReplPanelProps): React.JSX.Element;
export default PythonReplPanel;
