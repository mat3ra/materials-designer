import ResizableDrawer from "@mat3ra/cove.js/dist/mui/components/custom/resizable-drawer/ResizableDrawer";
import React from "react";

import BaseJupyterLiteSessionComponent from "../include/jupyterlite/BaseJupyterLiteComponent";

class JupyterLiteSessionDrawer extends BaseJupyterLiteSessionComponent {
    render() {
        // TODO: fix drawer sticking to the MD container and pass the ref to the resizable drawer then
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { show, onHide, containerRef } = this.props;

        return (
            <div style={{ display: show ? "block" : "none" }}>
                <ResizableDrawer open={show} onClose={onHide}>
                    {super.render()}
                </ResizableDrawer>
            </div>
        );
    }
}

export default JupyterLiteSessionDrawer;
