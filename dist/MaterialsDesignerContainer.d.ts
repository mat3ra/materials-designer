import { MDMaterial } from "./MDMaterial";
import { type MDState } from "./reducers/Material";
declare global {
    interface Window {
        MDState: MDState;
    }
}
interface MaterialsDesignerContainerProps {
    skipAlertProvider?: boolean;
    isLoading?: boolean;
    initialMaterials?: MDMaterial[];
    openImportModal?: () => void;
    closeImportModal?: () => void;
    openSaveActionDialog?: (params: {
        show: boolean;
        material: MDMaterial;
        onSubmit: () => void;
    }) => void;
    materialsSave?: () => void;
    isConventionalCellShown?: boolean;
    maxCombinatorialBasesCount?: number;
    onExit?: () => void;
}
export declare function MaterialsDesignerContainer({ initialMaterials, skipAlertProvider, isLoading, ...props }: MaterialsDesignerContainerProps): import("react/jsx-runtime").JSX.Element;
export {};
