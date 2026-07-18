import { jsx as _jsx } from "react/jsx-runtime";
import { showErrorAlert } from "@mat3ra/cove.js/dist/other/alerts";
import JupyterLiteSession from "@mat3ra/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { Action } from "@mat3ra/esse/dist/js/types";
import React from "react";
import { MDMaterial } from "../../../MDMaterial";
import { JUPYTERLITE_ORIGIN_URL } from "../../../settings";
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
        this.validateMaterialConfigs = (configs) => {
            const validationErrors = [];
            const validatedMaterials = configs.reduce((validMaterials, config) => {
                try {
                    const material = new MDMaterial(config);
                    material.validate();
                    validMaterials.push(material);
                }
                catch (e) {
                    validationErrors.push(`Failed to create material ${config.name}: ${e.message}`);
                }
                return validMaterials;
            }, []);
            return { validatedMaterials, validationErrors };
        };
        this.handleSetMaterials = (data) => {
            const configs = data.materials;
            if (Array.isArray(configs)) {
                const { validatedMaterials, validationErrors } = this.validateMaterialConfigs(configs);
                this.setMaterials(validatedMaterials);
                validationErrors.forEach(showErrorAlert);
            }
            else {
                showErrorAlert("Invalid material data received");
            }
        };
        // eslint-disable-next-line react/sort-comp
        this.messageHandlerConfigs = [
            {
                action: Action.setData,
                handlers: [this.handleSetMaterials],
            },
            {
                action: Action.getData,
                handlers: [this.getMaterialsForMessage],
            },
        ];
        this.setMaterials = (materials) => {
            const { onMaterialsUpdate } = this.props;
            onMaterialsUpdate(materials);
        };
    }
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
