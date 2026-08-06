import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import CovePythonRepl from "@mat3ra/cove/dist/other/repl/PythonRepl";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import { replSession } from "./MaterialsReplSession";
const DEFAULT_CODE = `# materials_in = the designer's list, material = the selected one.
# Helpers and enums are pre-imported. Shift+Enter to run.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])`;
function PythonReplPanel({ materials, activeIndex, onReplSync, show, onHide, wheelBaseUrl, }) {
    useEffect(() => {
        if (wheelBaseUrl)
            replSession.setWheelBaseUrl(wheelBaseUrl);
    }, [wheelBaseUrl]);
    useEffect(() => {
        replSession.connect(() => materials, () => activeIndex, onReplSync);
    }, [materials, activeIndex, onReplSync]);
    return (_jsx(Box, { sx: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: _jsx(CovePythonRepl, { session: replSession, show: show, defaultCode: DEFAULT_CODE }) }) }));
}
export default PythonReplPanel;
