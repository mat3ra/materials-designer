import type {
    PythonCompletion,
    PythonSignatureInfo,
} from "@mat3ra/cove/dist/other/codemirror/utils/pythonCompletions";
import DataBridge from "@mat3ra/cove/dist/other/iframe-messaging/DataBridge";
import InPageTransport from "@mat3ra/cove/dist/other/iframe-messaging/InPageTransport";
import PyodideSession, {
    type Pyodide,
    type PythonExecutionResult,
    type PythonSessionInterface,
} from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { Action } from "@mat3ra/esse/dist/js/types";

import type { MDMaterial } from "../../MDMaterial";
import {
    type PyodideLock,
    PYODIDE_INDEX_URL,
    REPL_COMPLETION_PACKAGES,
    REPL_DEFAULT_WHEEL_BASE_URL,
} from "./constants";
import {
    type MaterialsSyncPayload,
    createMaterialsDataBridgeHandlers,
} from "./materialsDataBridge";

const MATERIAL_PREAMBLE = `
try:
    from mat3ra.notebooks_utils.preamble.material import *
except ModuleNotFoundError:
    from mat3ra.made.material import Material
from mat3ra.made.tools.helpers import *
from mat3ra.notebooks_utils.core.entity.material.io import get_materials as _get_materials, sync_materials as _sync_materials
`;

/**
 * Persistent Materials Designer namespace connected through the generic in-page data bridge.
 *
 * Owns a {@link PyodideSession} rather than extending it: the three callbacks below are the entire
 * contract with cove, and passing them makes the run cycle readable in one place. Implements
 * {@link PythonSessionInterface} so cove's REPL UI takes this directly.
 */
export class MaterialsReplSession implements PythonSessionInterface {
    private session: PyodideSession;

    /**
     * The interpreter handle, captured in `setupNamespace` — the first callback cove invokes, and the
     * only one that receives it. Every Python call here goes through it. Null until then, which is
     * safe: cove awaits `setupNamespace` before reporting the session initialized, and refuses to
     * execute before that.
     */
    private pyodide: Pyodide = null;

    private bridge?: DataBridge;

    private getMaterials: () => MDMaterial[] = () => [];

    private getActiveIndex = () => 0;

    private syncMaterials: (payload: MaterialsSyncPayload) => void = () => undefined;

    private requirementsContent = "";

    private requirementsProfile = "";

    private pyodideLockPackages = new Set<string>();

    private stagedWheelFilenames = new Set<string>();

    constructor() {
        this.session = new PyodideSession({
            indexUrl: PYODIDE_INDEX_URL,
            loadPackages: ["pyyaml", "typing-extensions", "sqlite3"],
            postWheelPackages: REPL_COMPLETION_PACKAGES,
            wheelBaseUrl: REPL_DEFAULT_WHEEL_BASE_URL,
            wheelFsDir: "/drive/packages",
            setupNamespace: (pyodide, log) => this.setUpMaterialNamespace(pyodide, log),
            beforeRun: () => this.bindHostMaterials(),
            afterRun: () => this.syncNamespaceToHost(),
        });
    }

    // Pass-throughs to the owned session; see PythonSessionInterface.
    get isInitialized(): boolean {
        return this.session.isInitialized;
    }

    get isRunning(): boolean {
        return this.session.isRunning;
    }

    load(onProgress?: (message: string) => void): Promise<void> {
        return this.session.load(onProgress);
    }

    execute(code: string): Promise<PythonExecutionResult> {
        return this.session.execute(code);
    }

    complete(source: string, line: number, column: number): PythonCompletion[] {
        return this.session.complete(source, line, column);
    }

    describe(
        source: string,
        line: number,
        column: number,
        name: string,
    ): PythonSignatureInfo | null {
        return this.session.describe(source, line, column, name);
    }

    setWheelBaseUrl(wheelBaseUrl: string): void {
        this.session.setWheelBaseUrl(wheelBaseUrl);
    }

    /** Takes an already-loaded Pyodide so a Node test can inject one. */
    initialize(pyodide: Pyodide, onProgress?: (message: string) => void): Promise<void> {
        return this.session.initialize(pyodide, onProgress);
    }

    configureRequirements(content: string, profile: string, pyodideLockContent: string): void {
        if (this.isInitialized) return;
        this.requirementsContent = content;
        this.requirementsProfile = profile;
        const pyodideLock = JSON.parse(pyodideLockContent) as PyodideLock;
        this.pyodideLockPackages = new Set(
            Object.entries(pyodideLock.packages || {})
                .filter(([, entry]) => !entry.file_name?.endsWith("none-any.whl"))
                .map(([name]) => name),
        );
        const notebooksUtilsWheel = pyodideLock.packages?.mat3ra?.file_name;
        if (!notebooksUtilsWheel) {
            throw new Error("AX Pyodide lock does not contain the notebooks-utils wheel.");
        }
        this.session.setWheelFilenames([notebooksUtilsWheel]);
    }

    connect(
        getMaterials: () => MDMaterial[],
        getActiveIndex: () => number,
        syncMaterials: (payload: MaterialsSyncPayload) => void,
    ): void {
        this.getMaterials = getMaterials;
        this.getActiveIndex = getActiveIndex;
        this.syncMaterials = syncMaterials;
        if (this.bridge) return;

        const transport = new InPageTransport((action, payload) => {
            this.pyodide.globals.set("data_from_host_action", action);
            this.pyodide.globals.set("data_from_host", this.pyodide.toPy(payload));
        });
        this.bridge = new DataBridge(transport);
        createMaterialsDataBridgeHandlers({
            getMaterials: () => this.getMaterials(),
            syncMaterials: (payload) => this.syncMaterials(payload),
        }).forEach(({ action, handlers }) => this.bridge?.addHandlers(action, handlers));
    }

    private async setUpMaterialNamespace(
        pyodide: Pyodide,
        log: (message: string) => void,
    ): Promise<void> {
        this.pyodide = pyodide;
        if (!this.requirementsContent || !this.requirementsProfile) {
            throw new Error("MaterialsReplSession: requirements were not configured before load.");
        }
        await this.installRequirements(this.requirementsContent, this.requirementsProfile, log);
        log("Preparing material namespace…");
        this.pyodide.runPython(MATERIAL_PREAMBLE);
        log("Environment ready. Type to autocomplete.");
    }

    async applyRequirements(
        content: string,
        profile: string,
        log: (message: string) => void,
    ): Promise<void> {
        if (!this.isInitialized) throw new Error("Python environment is not ready.");
        await this.installRequirements(content, profile, log);
        this.requirementsContent = content;
        this.requirementsProfile = profile;
    }

    private async installRequirements(
        content: string,
        profile: string,
        log: (message: string) => void,
    ): Promise<void> {
        this.pyodide.FS.mkdirTree("/drive");
        this.pyodide.FS.mkdirTree("/drive/packages");
        this.pyodide.FS.writeFile("/drive/config.yml", content, { encoding: "utf8" });
        log(`Installing AX requirements profile '${profile}'…`);
        this.pyodide.globals.set("_repl_requirements_profile", profile);
        const requirementsJson = await this.pyodide.runPythonAsync(`
import json
from mat3ra.notebooks_utils.pyodide.packages.install import get_package_list_from_config
json.dumps(await get_package_list_from_config("/drive/config.yml", _repl_requirements_profile))
`);
        const requirements = JSON.parse(requirementsJson) as string[];
        const pyodidePackages = requirements
            .map(
                (requirement) => requirement.replace(/^nodeps:/, "").match(/^[A-Za-z0-9_.-]+/)?.[0],
            )
            .filter((name): name is string => Boolean(name))
            .filter((name) => this.pyodideLockPackages.has(name.replace(/_/g, "-")));
        if (pyodidePackages.length) {
            log(`Loading ${pyodidePackages.length} package(s) from AX's Pyodide lock…`);
            await this.pyodide.loadPackage(pyodidePackages);
        }
        const wheelPrefix = "emfs:/drive/packages/";
        const wheelFilenames = requirements
            .filter((requirement) => requirement.startsWith(wheelPrefix))
            .map((requirement) => requirement.slice(wheelPrefix.length));
        const newWheelFilenames = wheelFilenames.filter(
            (filename) => !this.stagedWheelFilenames.has(filename),
        );
        await this.session.stageWheels(newWheelFilenames, log);
        newWheelFilenames.forEach((filename) => this.stagedWheelFilenames.add(filename));
        await this.pyodide.runPythonAsync(`
from mat3ra.notebooks_utils.pyodide.packages.install import install_packages_pyodide
await install_packages_pyodide(_repl_requirements_profile)
`);
    }

    /** Push the designer's current materials into the namespace as `materials_in` / `material`. */
    private async bindHostMaterials(): Promise<void> {
        if (!this.bridge) throw new Error("MaterialsReplSession is not connected to a host.");
        await this.bridge.receive(Action.getData);
        this.pyodide.globals.set("_repl_active_index", this.getActiveIndex());
        this.pyodide.runPython(`
materials_in = _get_materials(globals())
material = materials_in[_repl_active_index] if 0 <= _repl_active_index < len(materials_in) else None
`);
    }

    /** Read any Material the run produced back out to the host. */
    private async syncNamespaceToHost(): Promise<void> {
        await this.pyodide.runPythonAsync("_sync_materials(globals())");
    }

    dispose(): void {
        this.bridge?.destroy();
        this.bridge = undefined;
        this.pyodide = null;
        this.session.dispose();
    }
}

export const replSession = new MaterialsReplSession();
