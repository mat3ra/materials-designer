import JupyterLiteSession, { IMessageHandlerConfigItem } from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
import { MDMaterial } from "../../../MDMaterial";
export interface BaseJupyterLiteProps {
    materials: MDMaterial[];
    show: boolean;
    onMaterialsUpdate: (newMaterials: MDMaterial[]) => void;
    onHide: () => void;
    title?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
}
declare class BaseJupyterLiteSessionComponent<P = never, S = never> extends React.Component<P & BaseJupyterLiteProps, S> {
    DEFAULT_NOTEBOOK_PATH: string;
    jupyterLiteSessionRef: React.RefObject<JupyterLiteSession | null>;
    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S): void;
    sendMaterials: () => void;
    getMaterialsForMessage: () => (MaterialSchema & import("@mat3ra/esse/dist/js/esse/types").AnyObject)[];
    getMaterialsToUse: () => (P & BaseJupyterLiteProps)["materials"];
    validateMaterialConfigs: (configs: MaterialSchema[]) => {
        validatedMaterials: MDMaterial[];
        validationErrors: string[];
    };
    handleSetMaterials: (data: any) => void;
    messageHandlerConfigs: IMessageHandlerConfigItem[];
    setMaterials: (materials: MDMaterial[]) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default BaseJupyterLiteSessionComponent;
