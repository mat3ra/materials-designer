import { jsx as _jsx } from "react/jsx-runtime";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import { useCallback, useEffect, useRef } from "react";
import { replSession } from "./MaterialsReplSession";
import DEFAULT_CODE from "./python/generated/default_snippet";
/**
 * Wires the designer's materials into cove's generic {@link CovePythonRepl}. The REPL shell (editor,
 * Run, status, console) and the Pyodide runtime are both cove's; everything here is the materials
 * half: inject the current stash before each run, and push whatever the user created back into it.
 */
function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }) {
    // Keep latest materials for injection without re-binding callbacks (which would re-trigger load).
    const materialsRef = useRef({ materials, activeIndex });
    materialsRef.current = { materials, activeIndex };
    useEffect(() => {
        if (wheelBaseUrl)
            replSession.configure({ wheelBaseUrl });
    }, [wheelBaseUrl]);
    const injectCurrentMaterials = useCallback(() => {
        const { materials: currentMaterials, activeIndex: currentIndex } = materialsRef.current;
        if (!currentMaterials.length)
            return;
        // Inject in STABLE list order so `materials_in[0]` is always the first designer material.
        // Do NOT reorder active-first: after a run the active index moves to the REPL-created output,
        // which would otherwise feed that output back in as `materials_in[0]` on the next run
        // (e.g. build a supercell of the just-created defect). `material` still tracks the active one.
        replSession.injectMaterials(currentMaterials.map((material) => material.toJSON()), currentIndex);
    }, []);
    // Refresh injected inputs whenever the active material changes while the panel is ready/open.
    useEffect(() => {
        if (show && replSession.isInitialized)
            injectCurrentMaterials();
    }, [show, activeIndex, injectCurrentMaterials]);
    const syncChangedMaterials = useCallback(() => {
        const operations = replSession.collectChangedMaterials();
        if (operations.length)
            onReplSync(operations);
    }, [onReplSync]);
    return (_jsx(CovePythonRepl, { session: replSession, show: show, defaultCode: DEFAULT_CODE, onReady: injectCurrentMaterials, 
        // Reload inputs from the designer before every run so `materials_in` always reflects the
        // current stash (never stale REPL outputs) — re-running the same code is idempotent.
        onBeforeRun: injectCurrentMaterials, onRunSuccess: syncChangedMaterials }));
}
export default PythonRepl;
