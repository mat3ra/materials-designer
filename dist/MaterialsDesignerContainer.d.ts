import { MDMaterial } from "./MDMaterial";
import { type MDState } from "./reducers/Material";
declare global {
    interface Window {
        MDState: MDState;
    }
}
export interface ImportModalProps {
    show: boolean;
    onSubmit: (materials: MDMaterial[]) => void;
}
export interface MaterialsDesignerContainerProps {
    skipAlertProvider?: boolean;
    isLoading?: boolean;
    initialMaterials?: MDMaterial[];
    openImportModal?: (params: ImportModalProps) => void;
    closeImportModal?: () => void;
    openSaveActionDialog?: (state: MDState) => void;
    isConventionalCellShown?: boolean;
    maxCombinatorialBasesCount?: number;
    onExit?: () => void;
}
export declare function MaterialsDesignerContainer({ initialMaterials, skipAlertProvider, isLoading, ...props }: MaterialsDesignerContainerProps): import("react/jsx-runtime").JSX.Element;
