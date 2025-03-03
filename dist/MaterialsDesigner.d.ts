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
        const isLoading: PropTypes.Requireable<boolean>;
        const showToolbar: PropTypes.Requireable<boolean>;
        const material: PropTypes.Validator<object>;
        const isConventionalCellShown: PropTypes.Requireable<boolean>;
        const materials: PropTypes.Requireable<any[]>;
        const index: PropTypes.Requireable<number>;
        const onUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        const onItemClick: PropTypes.Requireable<(...args: any[]) => any>;
        const onNameUpdate: PropTypes.Requireable<(...args: any[]) => any>;
        const onGenerateSupercell: PropTypes.Requireable<(...args: any[]) => any>;
        const onGenerateSurface: PropTypes.Requireable<(...args: any[]) => any>;
        const onSetBoundaryConditions: PropTypes.Requireable<(...args: any[]) => any>;
        const onToggleIsNonPeriodic: PropTypes.Requireable<(...args: any[]) => any>;
        const onUndo: PropTypes.Requireable<(...args: any[]) => any>;
        const onRedo: PropTypes.Requireable<(...args: any[]) => any>;
        const onReset: PropTypes.Requireable<(...args: any[]) => any>;
        const onAdd: PropTypes.Requireable<(...args: any[]) => any>;
        const onExport: PropTypes.Requireable<(...args: any[]) => any>;
        const onSave: PropTypes.Requireable<(...args: any[]) => any>;
        const onExit: PropTypes.Requireable<(...args: any[]) => any>;
        const openImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const closeImportModal: PropTypes.Requireable<(...args: any[]) => any>;
        const openSaveActionDialog: PropTypes.Requireable<(...args: any[]) => any>;
        const onRemove: PropTypes.Requireable<(...args: any[]) => any>;
        const maxCombinatorialBasesCount: PropTypes.Requireable<number>;
        const defaultMaterialsSet: PropTypes.Requireable<any[]>;
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
    metadata: {
        build: {
            configuration: {
                width: number;
                length: number;
                vacuum_width: number;
                vacuum_length: number;
                edge_type: string;
            };
        }[];
    }[];
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
