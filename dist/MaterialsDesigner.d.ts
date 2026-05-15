export default MaterialsDesigner;
declare class MaterialsDesigner {
    constructor(props: any);
    state: {
        isVisibleItemsList: boolean;
        isVisibleSourceEditor: boolean;
        isVisibleThreeDEditorFullscreen: boolean;
        isVisibleJupyterLiteSessionDrawer: boolean;
        importMaterialsDialogProps: null;
    };
    containerRef: React.RefObject<any>;
    shouldComponentUpdate(nextProps: any, nextState: any): boolean;
    getGridConfig: () => any;
    checkIfOnlyOneGridItemIsVisible: () => boolean;
    onSectionVisibilityToggle: (componentName: any) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
declare namespace MaterialsDesigner {
    namespace propTypes {
        let mdState: PropTypes.Validator<NonNullable<PropTypes.InferProps<{
            index: PropTypes.Requireable<number>;
            isLoading: PropTypes.Requireable<boolean>;
            materials: PropTypes.Requireable<(object | null | undefined)[]>;
        }>>>;
        let showToolbar: PropTypes.Requireable<boolean>;
        let isConventionalCellShown: PropTypes.Requireable<boolean>;
        let onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let onItemClick: PropTypes.Requireable<(...args: any[]) => any>;
        let onNameUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        let onGenerateSupercell: PropTypes.Requireable<(...args: any[]) => any>;
        let onGenerateSurface: PropTypes.Requireable<(...args: any[]) => any>;
        let onSetBoundaryConditions: PropTypes.Requireable<(...args: any[]) => any>;
        let onToggleIsNonPeriodic: PropTypes.Requireable<(...args: any[]) => any>;
        let onUndo: PropTypes.Requireable<(...args: any[]) => any>;
        let onRedo: PropTypes.Requireable<(...args: any[]) => any>;
        let onReset: PropTypes.Requireable<(...args: any[]) => any>;
        let onAdd: PropTypes.Requireable<(...args: any[]) => any>;
        let onExport: PropTypes.Requireable<(...args: any[]) => any>;
        let onExit: PropTypes.Requireable<(...args: any[]) => any>;
        let openImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        let closeImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        let openSaveActionDialog: PropTypes.Requireable<(...args: any[]) => any>;
        let onRemove: PropTypes.Requireable<(...args: any[]) => any>;
        let maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        let defaultMaterialsSet: PropTypes.Requireable<any[]>;
    }
    namespace defaultProps {
        export { materialConfigs as defaultMaterialsSet };
    }
}
import React from "react";
import PropTypes from "prop-types";
declare const materialConfigs: ({
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: null;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: null;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: null;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: null;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: null;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
} | {
    name: string;
    lattice: {
        type: string;
        a: number;
        b: number;
        c: number;
        alpha: number;
        beta: number;
        gamma: number;
        units: {
            length: string;
            angle: string;
        };
    };
    basis: {
        units: string;
        elements: {
            id: number;
            value: string;
        }[];
        coordinates: {
            id: number;
            value: number[];
        }[];
    };
    external: {
        id: string;
        source: string;
        doi: string;
        url: string;
        origin: boolean;
    };
    isNonPeriodic: boolean;
})[];
