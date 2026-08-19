import type { PythonCompletion, PythonSignatureInfo } from "@mat3ra/cove/dist/other/codemirror/utils/pythonCompletions";
import { type Pyodide, type PythonExecutionResult, type PythonSessionInterface } from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import type { MDMaterial } from "../../MDMaterial";
import { type MaterialsSyncPayload } from "./materialsDataBridge";
/**
 * Persistent Materials Designer namespace connected through the generic in-page data bridge.
 *
 * Owns a {@link PyodideSession} rather than extending it: the three callbacks below are the entire
 * contract with cove, and passing them makes the run cycle readable in one place. Implements
 * {@link PythonSessionInterface} so cove's REPL UI takes this directly.
 */
export declare class MaterialsReplSession implements PythonSessionInterface {
    private session;
    /**
     * The interpreter handle, captured in `setupNamespace` — the first callback cove invokes, and the
     * only one that receives it. Every Python call here goes through it. Null until then, which is
     * safe: cove awaits `setupNamespace` before reporting the session initialized, and refuses to
     * execute before that.
     */
    private pyodide;
    private bridge?;
    private getMaterials;
    private getActiveIndex;
    private syncMaterials;
    private requirementsContent;
    private requirementsProfile;
    private pyodideLockPackages;
    private stagedWheelFilenames;
    constructor();
    get isInitialized(): boolean;
    get isRunning(): boolean;
    load(onProgress?: (message: string) => void): Promise<void>;
    execute(code: string): Promise<PythonExecutionResult>;
    complete(source: string, line: number, column: number): PythonCompletion[];
    describe(source: string, line: number, column: number, name: string): PythonSignatureInfo | null;
    setWheelBaseUrl(wheelBaseUrl: string): void;
    /** Takes an already-loaded Pyodide so a Node test can inject one. */
    initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void>;
    configureRequirements(content: string, profile: string, pyodideLockContent: string): void;
    connect(getMaterials: () => MDMaterial[], getActiveIndex: () => number, syncMaterials: (payload: MaterialsSyncPayload) => void): void;
    private setUpMaterialNamespace;
    applyRequirements(content: string, profile: string, log: (message: string) => void): Promise<void>;
    private installRequirements;
    /** Push the designer's current materials into the namespace as `materials_in` / `material`. */
    private bindHostMaterials;
    /** Read any Material the run produced back out to the host. */
    private syncNamespaceToHost;
    dispose(): void;
}
export declare const replSession: MaterialsReplSession;
