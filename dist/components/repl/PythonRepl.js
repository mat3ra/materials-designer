import { jsx as _jsx } from "react/jsx-runtime";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import { useCallback, useEffect } from "react";
import { replSession } from "./MaterialsReplSession";
import DEFAULT_CODE from "./python/generated/default_snippet";
function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }) {
    useEffect(() => {
        if (wheelBaseUrl)
            replSession.setWheelBaseUrl(wheelBaseUrl);
    }, [wheelBaseUrl]);
    const injectCurrentMaterials = useCallback(() => {
        // Stable list order, deliberately NOT active-first: after a run the active index moves to the
        // REPL's own output, which would then feed back in as `materials_in[0]` on the next run.
        // `material` still tracks the active one.
        replSession.injectMaterials(materials.map((material) => material.toJSON()), activeIndex);
    }, [materials, activeIndex]);
    // Keep the namespace in step while the panel is already open — e.g. the user selects a different
    // material, or a previous run appended one. Before the session is up there is nothing to inject
    // into; the `onReady` pass below covers that case.
    useEffect(() => {
        if (show && replSession.isInitialized)
            injectCurrentMaterials();
    }, [show, injectCurrentMaterials]);
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
