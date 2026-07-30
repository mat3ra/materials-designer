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
/**
 * Wires the designer's materials into cove's generic {@link CovePythonRepl}. The REPL shell (editor,
 * Run, status, console) and the Pyodide runtime are both cove's; everything here is the materials
 * half: inject the current stash before each run, and push whatever the user created back into it.
 */
declare function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }: PythonReplProps): import("react/jsx-runtime").JSX.Element;
export default PythonRepl;
