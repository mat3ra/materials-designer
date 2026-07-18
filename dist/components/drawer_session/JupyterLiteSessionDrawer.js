import { jsx as _jsx } from "react/jsx-runtime";
import ResizableDrawer from "@mat3ra/cove/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import BaseJupyterLiteSessionComponent from "../include/jupyterlite/BaseJupyterLiteComponent";
class JupyterLiteSessionDrawer extends BaseJupyterLiteSessionComponent {
    render() {
        // TODO: fix drawer sticking to the MD container and pass the ref to the resizable drawer then
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { show, onHide, containerRef } = this.props;
        return (_jsx("div", { style: { display: show ? "block" : "none" }, children: _jsx(ResizableDrawer, { open: show, onClose: onHide, children: super.render() }) }));
    }
}
export default JupyterLiteSessionDrawer;
