declare const Material_base: {
    new (...config: any[]): {
        _json: import("@mat3ra/made/dist/js/material").MaterialSchemaJSON;
        toJSON(): import("@mat3ra/made/dist/js/types").MaterialJSON;
        src: import("@mat3ra/esse/dist/js/types").FileSourceSchema;
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
    };
    readonly defaultConfig: {
        name: string;
        basis: {
            elements: {
                id: number;
                value: string;
            }[];
            coordinates: {
                id: number;
                value: number[];
            }[];
            units: string;
        };
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
    };
} & (new (...args: any[]) => {
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
}) & (new (...args: any[]) => {
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
}) & (new (...args: any[]) => {
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
}) & {
    new (...args: any[]): {
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
    };
    readonly defaultConfig: object | null;
    createDefault(): any;
} & typeof import("@mat3ra/code/dist/js/entity").InMemoryEntity;
export class Material extends Material_base {
    static createFromMadeMaterial(material: any): Material;
    constructor(config: any);
    set isUpdated(arg: boolean);
    get isUpdated(): boolean;
    set metadata(arg: {});
    get metadata(): {};
    toJSON(): {
        _id: string;
        metadata: {};
        formula?: string | undefined;
        unitCellFormula?: string | undefined;
        basis: {
            elements: {
                id: number;
                value: string;
                occurrence?: number | undefined;
                oxidationState?: number | undefined;
            }[];
            labels?: {
                id?: number | undefined;
                value?: number | undefined;
            }[] | undefined;
            coordinates: {
                id?: number | undefined;
                value?: [number, number, number] | [boolean, boolean, boolean] | undefined;
            }[];
            name?: string | undefined;
            units?: string | undefined;
            bonds?: {
                atomPair?: [{
                    id?: number | undefined;
                }, {
                    id?: number | undefined;
                }] | undefined;
                bondType?: "double" | "other" | "single" | "triple" | "quadruple" | "aromatic" | "tautomeric" | "dative" | undefined;
            }[] | undefined;
        };
        lattice: {
            name?: "lattice" | undefined;
            vectors?: {
                alat?: number | undefined;
                units?: "m" | "angstrom" | "crystal" | "km" | "pm" | "nm" | "a.u." | "bohr" | "fractional" | "cartesian" | "alat" | undefined;
                a: [number, number, number];
                b: [number, number, number];
                c: [number, number, number];
            } | undefined;
            type: "CUB" | "BCC" | "FCC" | "TET" | "MCL" | "ORC" | "ORCC" | "ORCF" | "ORCI" | "HEX" | "BCT" | "TRI" | "MCLC" | "RHL";
            units?: {
                length?: "angstrom" | "bohr" | undefined;
                angle?: "degree" | "radian" | undefined;
            } | undefined;
            a: number;
            b: number;
            c: number;
            alpha: number;
            beta: number;
            gamma: number;
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
        slug?: string | undefined;
        systemName?: string | undefined;
        consistencyChecks?: {
            key: string;
            name: "default" | "atomsTooClose" | "atomsOverlap";
            severity: "error" | "warning" | "info";
            message: string;
        }[] | undefined;
        schemaVersion?: string | undefined;
        name?: string | undefined;
        isDefault?: boolean | undefined;
    };
    cleanOnCopy(): void;
    get boundaryConditions(): any;
}
import { Made } from "@mat3ra/made";
export {};
