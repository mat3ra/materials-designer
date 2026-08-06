import { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import React from "react";
import { MDMaterial } from "../../MDMaterial";
interface StandataImportDialogProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (materials: MDMaterial[]) => void;
    defaultMaterialConfigs: MaterialSchema[];
}
interface StandataImportDialogState {
    selectedMaterialConfigs: MaterialSchema[];
}
declare class StandataImportDialog extends React.Component<StandataImportDialogProps, StandataImportDialogState> {
    constructor(props: StandataImportDialogProps);
    handleMaterialSelect: (materialConfigs: MaterialSchema[] | []) => void;
    handleRemoveMaterial: (index: number) => void;
    addMaterials: () => void;
    render(): React.JSX.Element;
}
export default StandataImportDialog;
