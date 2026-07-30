import { jsx as _jsx } from "react/jsx-runtime";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import { useCallback, useEffect, useRef } from "react";
import { replSession } from "./MaterialsReplSession";
import DEFAULT_CODE from "./python/generated/default_snippet";
function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }) {
    // A ref, not deps: re-binding the callbacks would re-trigger the environment load.
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
        // Stable list order, deliberately NOT active-first: after a run the active index moves to the
        // REPL's own output, which would then feed back in as `materials_in[0]` on the next run.
        // `material` still tracks the active one.
        replSession.injectMaterials(currentMaterials.map((material) => material.toJSON()), currentIndex);
    }, []);
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
        // Refreshed every run, so re-running the same code is idempotent.
        onBeforeRun: injectCurrentMaterials, onRunSuccess: syncChangedMaterials }));
}
export default PythonRepl;
