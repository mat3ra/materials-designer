import React from "react";
import { MDMaterial } from "../../../../MDMaterial";
interface MaterialsSelectorProps {
    materials: MDMaterial[];
    selectedMaterials: MDMaterial[];
    setSelectedMaterials: (selectedMaterials: MDMaterial[]) => void;
    testId?: string;
}
declare function MaterialsSelector(props: MaterialsSelectorProps): React.JSX.Element;
export default MaterialsSelector;
