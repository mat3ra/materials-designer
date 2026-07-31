import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import React, { useCallback, useEffect } from "react";

import type { MDMaterial } from "../../MDMaterial";
import { type ReplSyncOperation, replSession } from "./MaterialsReplSession";
import DEFAULT_CODE from "./python/generated/default_snippet";

interface PythonReplProps {
    materials: MDMaterial[];
    activeIndex: number;
    onReplSync: (operations: ReplSyncOperation[]) => void;
    show: boolean;
    wheelBaseUrl?: string;
}

function PythonRepl({ materials, activeIndex, onReplSync, show, wheelBaseUrl }: PythonReplProps) {
    useEffect(() => {
        if (wheelBaseUrl) replSession.setWheelBaseUrl(wheelBaseUrl);
    }, [wheelBaseUrl]);

    const injectCurrentMaterials = useCallback(() => {
        replSession.injectMaterials(
            materials.map((material) => material.toJSON()),
            activeIndex,
        );
    }, [materials, activeIndex]);

    useEffect(() => {
        if (show && replSession.isInitialized) injectCurrentMaterials();
    }, [show, injectCurrentMaterials]);

    const syncChangedMaterials = useCallback(() => {
        const operations = replSession.collectChangedMaterials();
        if (operations.length) onReplSync(operations);
    }, [onReplSync]);

    return (
        <CovePythonRepl
            session={replSession}
            show={show}
            defaultCode={DEFAULT_CODE}
            onReady={injectCurrentMaterials}
            // Refreshed every run, so re-running the same code is idempotent.
            onBeforeRun={injectCurrentMaterials}
            onRunSuccess={syncChangedMaterials}
        />
    );
}

export default PythonRepl;
