import JupyterLiteSession, { IMessageHandlerConfigItem } from "@mat3ra/cove/dist/other/jupyterlite/JupyterLiteSession";
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
    jupyterLiteSessionRef: React.RefObject<JupyterLiteSession>;
    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S): void;
    sendMaterials: () => void;
    getMaterialsForMessage: () => (import("@mat3ra/esse/dist/js/types").MaterialSchema & import("@mat3ra/esse/dist/js/esse/types").AnyObject)[];
    getMaterialsToUse: () => (P & BaseJupyterLiteProps)["materials"];
    setMaterials: (materials: MDMaterial[]) => void;
    messageHandlerConfigs: IMessageHandlerConfigItem[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export default BaseJupyterLiteSessionComponent;
