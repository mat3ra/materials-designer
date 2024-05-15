import JupyterLiteSession, { IMessageHandlerConfigItem } from "@exabyte-io/cove.js/dist/other/jupyterlite/JupyterLiteSession";
import { MaterialSchema } from "@mat3ra/esse/dist/js/types";
import { Made } from "@mat3ra/made";
import React from "react";
export interface BaseJupyterLiteProps {
    materials: Made.Material[];
    show: boolean;
    onMaterialsUpdate: (newMaterials: Made.Material[]) => void;
    onHide: () => void;
    title?: string;
    containerRef?: React.RefObject<HTMLDivElement>;
}
declare class BaseJupyterLiteSessionComponent<P = never, S = never> extends React.Component<P & BaseJupyterLiteProps, S> {
    DEFAULT_NOTEBOOK_PATH: string;
    jupyterLiteSessionRef: React.RefObject<JupyterLiteSession>;
    componentDidUpdate(prevProps: P & BaseJupyterLiteProps, prevState: S): void;
    sendMaterials: () => void;
    getMaterialsForMessage: () => import("@mat3ra/made/dist/js/types").MaterialJSON[];
    getMaterialsToUse: () => (P & BaseJupyterLiteProps)["materials"];
    validateMaterialConfigs: (configs: MaterialSchema[]) => {
        validatedMaterials: ({
            _json: import("@mat3ra/made/dist/js/material").MaterialSchemaJSON;
            toJSON(): import("@mat3ra/made/dist/js/types").MaterialJSON;
            src: import("@mat3ra/esse/dist/js/types").FileSourceSchema | undefined;
            updateFormula(): void;
            isNonPeriodic: boolean;
            getDerivedPropertyByName(name: string): {
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
            } | undefined;
            getDerivedProperties(): import("@mat3ra/esse/dist/js/types").DerivedPropertiesSchema;
            readonly formula: string;
            readonly unitCellFormula: string;
            unsetFileProps(): void;
            setBasis(textOrObject: string | import("@mat3ra/made/dist/js/parsers/xyz").BasisConfig, format?: string | undefined, unitz?: string | undefined): void;
            setBasisConstraints(constraints: import("@mat3ra/made/dist/js/constraints/constraints").Constraint[]): void;
            readonly basis: import("@mat3ra/made/dist/js/parsers/xyz").BasisConfig;
            readonly Basis: import("@mat3ra/made/dist/js/basis/constrained_basis").ConstrainedBasis;
            readonly uniqueElements: string[];
            lattice: import("@mat3ra/made/dist/js/lattice/lattice_vectors").BravaisConfigProps | undefined;
            readonly Lattice: Made.Lattice;
            getInchiStringForHash(): string;
            calculateHash(salt?: string | undefined, isScaled?: boolean | undefined, bypassNonPeriodicCheck?: boolean | undefined): string;
            hash: string;
            readonly scaledHash: string;
            toCrystal(): void;
            toCartesian(): void;
            getBasisAsXyz(fractional?: boolean | undefined): string;
            getAsQEFormat(): string;
            getAsPOSCAR(ignoreOriginal?: boolean | undefined, omitConstraints?: boolean | undefined): string;
            getACopyWithConventionalCell(): any;
            getConsistencyChecks(): import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            getBasisConsistencyChecks(): import("@mat3ra/esse/dist/js/types").ConsistencyCheck[];
            consistencyChecks: object[];
            addConsistencyChecks(array: object[]): void;
            prop: {
                <T = undefined>(name: string, defaultValue: T): T;
                <T_1 = undefined>(name: string): T_1 | undefined;
            } & {
                <T_2 = undefined>(name: string, defaultValue: T_2): T_2;
                <T_1_1 = undefined>(name: string): T_1_1 | undefined;
            } & {
                <T_3 = undefined>(name: string, defaultValue: T_3): T_3;
                <T_1_2 = undefined>(name: string): T_1_2 | undefined;
            } & {
                <T_4 = undefined>(name: string, defaultValue: T_4): T_4;
                <T_1_3 = undefined>(name: string): T_1_3 | undefined;
            } & {
                <T_5 = undefined>(name: string, defaultValue: T_5): T_5;
                <T_6 = undefined>(name: string): T_6 | undefined;
            };
            setProp: ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void) & ((name: string, value: unknown) => void);
            unsetProp: ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void) & ((name: string) => void);
            setProps: ((json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined) => any) & ((json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined) => any) & ((json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined) => any) & ((json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined) => any) & ((json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined) => any);
            toJSONSafe: ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject);
            toJSONQuick: ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((exclude?: string[] | undefined) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject);
            clone: ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any) & ((extraContext?: object | undefined) => any);
            validate: (() => void) & (() => void) & (() => void) & (() => void) & (() => void);
            clean: ((config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) & ((config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject) => import("@mat3ra/code/dist/js/entity/in_memory").AnyObject);
            isValid: (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean) & (() => boolean);
            id: string;
            readonly cls: string;
            getClsName: (() => string) & (() => string) & (() => string) & (() => string) & (() => string);
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference: ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema) & ((byIdOnly?: boolean | undefined) => import("@mat3ra/esse/dist/js/types").EntityReferenceSchema);
            getEntityByName: ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity) & ((entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string) => import("@mat3ra/code/dist/js/entity").InMemoryEntity);
            metadata: object;
            updateMetadata(object: object): void;
            name: string;
            setName(name: string): void;
            readonly isDefault: boolean;
        } & {
            consistencyChecks: object[];
            addConsistencyChecks(array: object[]): void;
            _json: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            prop<T_7 = undefined>(name: string, defaultValue: T_7): T_7;
            prop<T_1_4 = undefined>(name: string): T_1_4 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            metadata: object;
            updateMetadata(object: object): void;
            _json: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            prop<T_2_1 = undefined>(name: string, defaultValue: T_2_1): T_2_1;
            prop<T_1_1_1 = undefined>(name: string): T_1_1_1 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            name: string;
            setName(name: string): void;
            _json: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            prop<T_3_1 = undefined>(name: string, defaultValue: T_3_1): T_3_1;
            prop<T_1_2_1 = undefined>(name: string): T_1_2_1 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & {
            readonly isDefault: boolean;
            _json: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            prop<T_4_1 = undefined>(name: string, defaultValue: T_4_1): T_4_1;
            prop<T_1_3_1 = undefined>(name: string): T_1_3_1 | undefined;
            setProp(name: string, value: unknown): void;
            unsetProp(name: string): void;
            setProps(json?: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject | undefined): any;
            toJSON(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONSafe(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            toJSONQuick(exclude?: string[] | undefined): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            clone(extraContext?: object | undefined): any;
            validate(): void;
            clean(config: import("@mat3ra/code/dist/js/entity/in_memory").AnyObject): import("@mat3ra/code/dist/js/entity/in_memory").AnyObject;
            isValid(): boolean;
            id: string;
            readonly cls: string;
            getClsName(): string;
            readonly slug: string;
            readonly isSystemEntity: boolean;
            getAsEntityReference(byIdOnly?: boolean | undefined): import("@mat3ra/esse/dist/js/types").EntityReferenceSchema;
            getEntityByName(entities: import("@mat3ra/code/dist/js/entity").InMemoryEntity[], entity: string, name: string): import("@mat3ra/code/dist/js/entity").InMemoryEntity;
        } & import("@mat3ra/code/dist/js/entity").InMemoryEntity)[];
        validationErrors: string[];
    };
    handleSetMaterials: (data: any) => void;
    messageHandlerConfigs: IMessageHandlerConfigItem[];
    setMaterials: (materials: Made.Material[]) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
export default BaseJupyterLiteSessionComponent;
