import { Material as MDMaterial } from "../../../../material";
import BaseJupyterLiteSessionComponent, { BaseJupyterLiteProps } from "../../../include/jupyterlite/BaseJupyterLiteComponent";
interface JupyterLiteTransformationDialogState {
    selectedMaterials: MDMaterial[];
    newMaterials: MDMaterial[];
}
declare class JupyterLiteTransformationDialog extends BaseJupyterLiteSessionComponent<BaseJupyterLiteProps, JupyterLiteTransformationDialogState> {
    constructor(props: BaseJupyterLiteProps);
    componentDidUpdate(prevProps: BaseJupyterLiteProps, prevState: JupyterLiteTransformationDialogState): void;
    handleSubmit: () => void;
    setMaterials: (newMaterials: MDMaterial[]) => void;
    getMaterialsToUse: () => MDMaterial[];
    render(): import("react/jsx-runtime").JSX.Element;
}
export default JupyterLiteTransformationDialog;
