import JupyterLiteSession, {
    IMessageHandlerConfigItem,
} from "@mat3ra/cove/dist/other/jupyterlite/JupyterLiteSession";
import React from "react";

import { MDMaterial } from "../../../MDMaterial";
import { JUPYTERLITE_ORIGIN_URL } from "../../../settings";
import { createMaterialsDataBridgeHandlers } from "../../repl/materialsDataBridge";

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
    // eslint-disable-next-line react/no-unused-prop-types
    containerRef?: React.RefObject<HTMLDivElement>;
}

class BaseJupyterLiteSessionComponent<P = never, S = never> extends React.Component<
    P & BaseJupyterLiteProps,
    S
> {
    DEFAULT_NOTEBOOK_PATH = "made/Introduction.ipynb";

    jupyterLiteSessionRef = React.createRef<JupyterLiteSession>();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

    setMaterials = (materials: MDMaterial[]): void => {
        const { onMaterialsUpdate } = this.props;
        onMaterialsUpdate(materials);
    };

    // eslint-disable-next-line react/sort-comp
    messageHandlerConfigs: IMessageHandlerConfigItem[] = createMaterialsDataBridgeHandlers({
        getMaterials: this.getMaterialsToUse,
        setMaterials: this.setMaterials,
    });

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
