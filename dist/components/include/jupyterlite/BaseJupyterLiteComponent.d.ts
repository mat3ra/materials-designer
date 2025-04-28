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
    jupyterLiteSessionRef: React.RefObject<JupyterLiteSession>;
    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S): void;
    sendMaterials: () => void;
    getMaterialsForMessage: () => {
        _id: string;
        metadata: {};
        formula?: string | undefined;
        unitCellFormula?: string | undefined;
        basis: {
            elements: {
                value: string;
                id: number;
            }[];
            coordinates: {
                value: [number, number, number];
                id: number;
            }[];
            units?: "crystal" | "cartesian" | undefined;
            labels?: {
                value: string | number;
                id: number;
            }[] | undefined;
        };
        lattice: {
            a: number;
            b: number;
            c: number;
            alpha: number;
            beta: number;
            gamma: number;
            vectors?: {
                a: [number, number, number];
                b: [number, number, number];
                c: [number, number, number];
                alat?: number | undefined;
                units?: "angstrom" | "bohr" | undefined;
            } | undefined;
            type?: "CUB" | "BCC" | "FCC" | "TET" | "MCL" | "ORC" | "ORCC" | "ORCF" | "ORCI" | "HEX" | "BCT" | "TRI" | "MCLC" | "RHL" | undefined;
            units?: {
                length?: "angstrom" | "bohr" | undefined;
                angle?: "degree" | "radian" | undefined;
            } | undefined;
        };
        derivedProperties?: ({
            name?: "volume" | undefined;
            units?: "angstrom^3" | undefined;
            value: number;
        } | {
            name?: "density" | undefined;
            units?: "g/cm^3" | undefined;
            value: number;
        } | {
            pointGroupSymbol?: string | undefined;
            spaceGroupSymbol?: string | undefined;
            tolerance?: {
                units?: "angstrom" | undefined;
                value: number;
            } | undefined;
            name?: "symmetry" | undefined;
        } | {
            name?: "elemental_ratio" | undefined;
            value: number;
            element?: string | undefined;
        } | {
            name?: "p-norm" | undefined;
            degree?: number | undefined;
            value: number;
        } | {
            name?: "inchi" | undefined;
            value: string;
        } | {
            name?: "inchi_key" | undefined;
            value: string;
        })[] | undefined;
        external?: {
            id: string | number;
            source: string;
            origin: boolean;
            data?: {} | undefined;
            doi?: string | undefined;
            url?: string | undefined;
        } | undefined;
        src?: {
            extension?: string | undefined;
            filename: string;
            text: string;
            hash: string;
        } | undefined;
        scaledHash?: string | undefined;
        icsdId?: number | undefined;
        isNonPeriodic?: boolean | undefined;
        consistencyChecks?: {
            name: "default" | "atomsTooClose" | "atomsOverlap";
            key: string;
            severity: "error" | "info" | "warning";
            message: string;
        }[] | undefined;
        slug?: string | undefined;
        systemName?: string | undefined;
        schemaVersion?: string | undefined;
        name?: string | undefined;
        isDefault?: boolean | undefined;
    }[];
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
