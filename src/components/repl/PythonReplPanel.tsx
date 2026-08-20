import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

import type { MDMaterial } from "../../MDMaterial";
import { REPL_DEFAULT_PROFILE, REPL_PYODIDE_LOCK_URL, REPL_REQUIREMENTS_URL } from "./constants";
import type { MaterialsSyncPayload } from "./materialsDataBridge";
import { replSession } from "./MaterialsReplSession";

const DEFAULT_CODE = `# materials_in = the designer's list, material = the selected one.
# Helpers and enums are pre-imported. Shift+Enter to run.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])`;

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

function PythonReplPanel({
    materials,
    activeIndex,
    onReplSync,
    show,
    onHide,
    wheelBaseUrl,
    requirementsUrl = REPL_REQUIREMENTS_URL,
    pyodideLockUrl = REPL_PYODIDE_LOCK_URL,
}: PythonReplPanelProps) {
    const [requirements, setRequirements] = useState<{
        content: string;
        profile: string;
        profiles: string[];
    }>();
    const [requirementsError, setRequirementsError] = useState<string>();

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            fetch(requirementsUrl).then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            }),
            fetch(pyodideLockUrl).then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.text();
            }),
        ])
            .then(([content, lockContent]) => {
                if (cancelled) return;
                replSession.configureRequirements(content, REPL_DEFAULT_PROFILE, lockContent);
                setRequirements({
                    content,
                    profile: REPL_DEFAULT_PROFILE,
                    profiles: [REPL_DEFAULT_PROFILE],
                });
            })
            .catch((error) => {
                if (!cancelled) {
                    setRequirementsError(
                        `Could not load AX requirements: ${
                            error instanceof Error ? error.message : String(error)
                        }`,
                    );
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pyodideLockUrl, requirementsUrl]);

    useEffect(() => {
        if (wheelBaseUrl) replSession.setWheelBaseUrl(wheelBaseUrl);
    }, [wheelBaseUrl]);

    useEffect(() => {
        replSession.connect(
            () => materials,
            () => activeIndex,
            onReplSync,
        );
    }, [materials, activeIndex, onReplSync]);

    return (
        <Box sx={{ display: show ? "block" : "none" }}>
            <ResizableDrawer open={show} onClose={onHide}>
                {requirements ? (
                    <CovePythonRepl
                        session={replSession}
                        show={show}
                        defaultCode={DEFAULT_CODE}
                        requirements={{
                            ...requirements,
                            onApply: async (content, profile, onProgress) => {
                                await replSession.applyRequirements(content, profile, onProgress);
                                setRequirements({
                                    content,
                                    profile,
                                    profiles: [profile],
                                });
                            },
                        }}
                    />
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                            height: "100%",
                        }}
                    >
                        {!requirementsError && <CircularProgress size={18} />}
                        <Typography color={requirementsError ? "error" : "text.secondary"}>
                            {requirementsError || "Loading AX requirements…"}
                        </Typography>
                    </Box>
                )}
            </ResizableDrawer>
        </Box>
    );
}

export default PythonReplPanel;
