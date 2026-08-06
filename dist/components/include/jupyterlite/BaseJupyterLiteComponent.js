import { jsx as _jsx } from "react/jsx-runtime";
import JupyterLiteSession from "@mat3ra/cove/dist/other/jupyterlite/JupyterLiteSession";
import React from "react";
import { JUPYTERLITE_ORIGIN_URL } from "../../../settings";
import { createMaterialsDataBridgeHandlers } from "../../repl/materialsDataBridge";
class BaseJupyterLiteSessionComponent extends React.Component {
    constructor() {
        super(...arguments);
        this.DEFAULT_NOTEBOOK_PATH = "made/Introduction.ipynb";
        this.jupyterLiteSessionRef = React.createRef();
        this.sendMaterials = () => {
            var _a;
            const materialsData = this.getMaterialsForMessage();
            (_a = this.jupyterLiteSessionRef.current) === null || _a === void 0 ? void 0 : _a.sendData(materialsData);
        };
        this.getMaterialsForMessage = () => {
            const materials = this.getMaterialsToUse();
            return materials.map((material) => material.toJSON());
        };
        this.getMaterialsToUse = () => {
            const { materials } = this.props;
            return materials;
        };
        this.setMaterials = (materials) => {
            const { onMaterialsUpdate } = this.props;
            onMaterialsUpdate(materials);
        };
        // eslint-disable-next-line react/sort-comp
        this.messageHandlerConfigs = createMaterialsDataBridgeHandlers({
            getMaterials: this.getMaterialsToUse,
            setMaterials: this.setMaterials,
        });
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    componentDidUpdate(prevProps, prevState) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            this.sendMaterials();
        }
    }
    render() {
        return (_jsx(JupyterLiteSession, { originURL: JUPYTERLITE_ORIGIN_URL, defaultNotebookPath: this.DEFAULT_NOTEBOOK_PATH, messageHandlerConfigs: this.messageHandlerConfigs, ref: this.jupyterLiteSessionRef }));
    }
}
export default BaseJupyterLiteSessionComponent;
