import { MDMaterial } from "../../../../MDMaterial";
interface MaterialsSelectorProps {
    materials: MDMaterial[];
    selectedMaterials: MDMaterial[];
    setSelectedMaterials: (selectedMaterials: MDMaterial[]) => void;
    testId?: string;
}
declare function MaterialsSelector(props: MaterialsSelectorProps): import("react/jsx-runtime").JSX.Element;
export default MaterialsSelector;
