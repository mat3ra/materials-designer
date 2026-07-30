import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { randomAlphanumeric } from "../../utils/str";
import { PYODIDE_INDEX_URL, REPL_COMPLETION_PACKAGES, REPL_DEFAULT_WHEEL_BASE_URL, REPL_INPUT_VARIABLE_NAMES, REPL_LOAD_PACKAGES, REPL_MAT3RA_PACKAGES, REPL_PYPI_PINNED_PACKAGES, REPL_WHEEL_FILENAMES, } from "./constants";
import PY_BOOTSTRAP_SCRIPTS from "./python/generated/bootstrap";
import PY_COLLECT_CHANGED_MATERIALS from "./python/generated/collect_changed_materials";
import PY_INJECT_MATERIALS from "./python/generated/inject_materials";
import PY_SNAPSHOT_MATERIAL_IDENTITIES from "./python/generated/snapshot_material_identities";
/** Length of the generated {@link ReplSyncOperation.clientId}; wide enough that collisions are moot. */
const CLIENT_ID_LENGTH = 12;
/**
 * Used via the {@link replSession} singleton: the persistent Python namespace and the
 * variable->clientId map have to survive the panel being toggled closed and open again.
 */
export class MaterialsReplSession extends PyodideSession {
    constructor() {
        super({
            indexUrl: PYODIDE_INDEX_URL,
            loadPackages: REPL_LOAD_PACKAGES,
            pypiPinnedPackages: REPL_PYPI_PINNED_PACKAGES,
            wheelFilenames: REPL_WHEEL_FILENAMES,
            // Jedi installs alongside the mat3ra packages; both need the wheels present first.
            postWheelPackages: [...REPL_MAT3RA_PACKAGES, ...REPL_COMPLETION_PACKAGES],
            wheelBaseUrl: REPL_DEFAULT_WHEEL_BASE_URL,
        });
        /** A known variable name means update; an unknown one means append. */
        this.variableNameToClientId = new Map();
    }
    /**
     * Runs every script in python/bootstrap/ — adding one there is a drop-in, nothing to register here.
     *
     * `_reserved_input_names` is what stops a re-injection of the designer's materials from looking
     * like the user created them — see collect_changed_materials.py.
     */
    async bootstrapNamespace(log) {
        PY_BOOTSTRAP_SCRIPTS.forEach(({ name, source }) => {
            log(`Preparing namespace (${name})…`);
            this.py.runPython(source);
        });
        this.py.globals.set("_reserved_input_names", this.py.toPy([...REPL_INPUT_VARIABLE_NAMES]));
        log("Environment ready. Type to autocomplete.");
    }
    /** Snapshot identities so {@link collectChangedMaterials} can tell what the run changed. */
    beforeExecute() {
        this.py.runPython(PY_SNAPSHOT_MATERIAL_IDENTITIES);
    }
    /**
     * Binds `materials_in` (list, in designer order) and `material` (the active one). No-op for an
     * empty list: inject_materials.py relies on there being at least one material to fall back to.
     */
    injectMaterials(configs, activeIndex = 0) {
        this.assertReady();
        if (configs.length === 0)
            return;
        this.py.globals.set("_repl_injected_json", JSON.stringify(configs));
        this.py.globals.set("_repl_active_index", activeIndex);
        this.py.runPython(PY_INJECT_MATERIALS);
    }
    /** One operation per Material the run created or reassigned. */
    collectChangedMaterials() {
        this.assertReady();
        this.py.runPython(PY_COLLECT_CHANGED_MATERIALS);
        const changed = JSON.parse(this.py.runPython("_repl_export"));
        return changed.map(({ variable_name: variableName, config }) => {
            let clientId = this.variableNameToClientId.get(variableName);
            if (!clientId) {
                clientId = randomAlphanumeric(CLIENT_ID_LENGTH);
                this.variableNameToClientId.set(variableName, clientId);
            }
            return { variableName, clientId, config };
        });
    }
}
/** Singleton, matching the lifetime of the persistent `window.pyodide`. */
export const replSession = new MaterialsReplSession();
