import type { MDMaterial } from "../../MDMaterial";
import { type ReplSyncOperation } from "./MaterialsReplSession";
interface PythonReplProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    /** Override where prebuilt wheels are served from (default same-origin `/repl-wheels`). */
    wheelBaseUrl?: string;
}
declare function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }: PythonReplProps): import("react/jsx-runtime").JSX.Element;
export default PythonRepl;
