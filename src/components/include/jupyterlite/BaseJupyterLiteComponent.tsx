import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import JupyterLiteSession, {
    IMessageHandlerConfigItem,
} from "@mat3ra/cove/dist/other/jupyterlite/JupyterLiteSession";
import { Action, MaterialSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";

import { MDMaterial } from "../../../MDMaterial";
import { JUPYTERLITE_ORIGIN_URL } from "../../../settings";

export interface BaseJupyterLiteProps {
    // eslint-disable-next-line react/no-unused-prop-types
    materials: MDMaterial[];
    // eslint-disable-next-line react/no-unused-prop-types
    show: boolean;
    onMaterialsUpdate: (newMaterials: MDMaterial[]) => void;
    // eslint-disable-next-line react/no-unused-prop-types
    onHide: () => void;
    // eslint-disable-next-line react/no-unused-prop-types
    title?: string;
    /**
     * Currently the Allotment imperative handle rather than a DOM node - MaterialsDesigner has no
     * container element to hand over. Unused either way; see the TODO in JupyterLiteSessionDrawer.
     */
    // eslint-disable-next-line react/no-unused-prop-types
    containerRef?: React.RefObject<unknown>;
}

// `P = never` would collapse `P & BaseJupyterLiteProps` to `never`, leaving every subclass
// impossible to render from a typed parent.
class BaseJupyterLiteSessionComponent<P = unknown, S = unknown> extends React.Component<
    P & BaseJupyterLiteProps,
    S
> {
    DEFAULT_NOTEBOOK_PATH = "made/Introduction.ipynb";

    jupyterLiteSessionRef = React.createRef<JupyterLiteSession>();

    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S) {
        const { materials } = this.props;
        if (prevProps.materials !== materials) {
            this.sendMaterials();
        }
    }

    sendMaterials = () => {
        const materialsData = this.getMaterialsForMessage();
        this.jupyterLiteSessionRef.current?.sendData(materialsData);
    };

    getMaterialsForMessage = () => {
        const materials = this.getMaterialsToUse();
        return materials.map((material) => material.toJSON());
    };

    getMaterialsToUse = () => {
        const { materials } = this.props;
        return materials;
    };

    validateMaterialConfigs = (configs: MaterialSchema[]) => {
        const validationErrors: string[] = [];
        const validatedMaterials = configs.reduce((validMaterials, config) => {
            try {
                const material = new MDMaterial(config);
                material.validate();
                validMaterials.push(material);
            } catch (e: any) {
                validationErrors.push(`Failed to create material ${config.name}: ${e.message}`);
            }
            return validMaterials;
        }, [] as MDMaterial[]);
        return { validatedMaterials, validationErrors };
    };

    handleSetMaterials = (data: any) => {
        const configs = data.materials as MaterialSchema[];
        if (Array.isArray(configs)) {
            const { validatedMaterials, validationErrors } = this.validateMaterialConfigs(configs);
            this.setMaterials(validatedMaterials);
            validationErrors.forEach(showErrorAlert);
        } else {
            showErrorAlert("Invalid material data received");
        }
    };

    // eslint-disable-next-line react/sort-comp
    messageHandlerConfigs: IMessageHandlerConfigItem[] = [
        {
            action: Action.setData,
            handlers: [this.handleSetMaterials],
        },
        {
            action: Action.getData,
            handlers: [this.getMaterialsForMessage],
        },
    ];

    setMaterials = (materials: MDMaterial[]): void => {
        const { onMaterialsUpdate } = this.props;
        onMaterialsUpdate(materials);
    };

    render() {
        return (
            <JupyterLiteSession
                originURL={JUPYTERLITE_ORIGIN_URL}
                defaultNotebookPath={this.DEFAULT_NOTEBOOK_PATH}
                messageHandlerConfigs={this.messageHandlerConfigs}
                ref={this.jupyterLiteSessionRef}
            />
        );
    }
}

export default BaseJupyterLiteSessionComponent;
