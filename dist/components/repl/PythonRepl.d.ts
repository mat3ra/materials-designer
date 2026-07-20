import type { MDMaterial } from "../../MDMaterial";
import { type ReplSyncOperation } from "./PyodideReplSession";
interface PythonReplProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    /** Override where prebuilt wheels are served from (default same-origin `/repl-wheels`). */
    wheelBaseUrl?: string;
}
/**
 * Layout-agnostic terminal-like Python REPL. Renders the loader + editor + output and delegates all
 * Pyodide work to the {@link replSession} singleton. On run it executes in the persistent namespace,
 * collects the Materials that changed, and hands them to `onReplSync` for the reducer to upsert.
 */
declare function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }: PythonReplProps): import("react/jsx-runtime").JSX.Element;
export default PythonRepl;
