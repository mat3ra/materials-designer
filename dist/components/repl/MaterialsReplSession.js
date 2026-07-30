import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import { randomAlphanumeric } from "../../utils/str";
import { PYODIDE_INDEX_URL, REPL_COMPLETION_PACKAGES, REPL_DEFAULT_WHEEL_BASE_URL, REPL_INPUT_VARIABLE_NAMES, REPL_LOAD_PACKAGES, REPL_MAT3RA_PACKAGES, REPL_PYPI_PINNED_PACKAGES, REPL_WHEEL_FILENAMES, REPL_WHEEL_FS_DIR, } from "./constants";
import PY_COLLECT from "./python/generated/collect";
import PY_HELPER_META from "./python/generated/helper_meta";
import PY_SNAPSHOT from "./python/generated/snapshot";
// Private alias so user code that rebinds `Material` cannot break our isinstance checks;
// the leading underscore also excludes it from the collected globals.
const PY_IMPORT_MATERIAL = "from mat3ra.made.material import Material as _ReplMaterial";
// Pre-imported so users never write import lines. `__all__` bounds the `*` to the public helpers.
const PY_IMPORT_HELPERS = "from mat3ra.made.tools.helpers import *";
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
            wheelFsDir: REPL_WHEEL_FS_DIR,
        });
        /** A known variable name means update; an unknown one means append. */
        this.variableNameToClientId = new Map();
        this.helperMeta = [];
    }
    get helpers() {
        return this.helperMeta;
    }
    /**
     * `_reserved_input_names` is what stops a re-injection of the designer's materials from looking
     * like the user created them.
     */
    async bootstrapNamespace(log) {
        log("Importing mat3ra.made.tools helpers…");
        this.py.runPython(PY_IMPORT_MATERIAL);
        this.py.runPython(PY_IMPORT_HELPERS);
        this.py.runPython(PY_HELPER_META);
        this.helperMeta = JSON.parse(this.py.runPython("_repl_helper_meta_json"));
        this.py.globals.set("_reserved_input_names", this.py.toPy([...REPL_INPUT_VARIABLE_NAMES]));
        log(`Environment ready — ${this.helperMeta.length} helpers pre-imported. Type to autocomplete.`);
    }
    /** Snapshot identities so {@link collectChangedMaterials} can tell what the run changed. */
    beforeExecute() {
        this.py.runPython(PY_SNAPSHOT);
    }
    /** Binds `materials_in` (list) and `material` (the active one). */
    injectMaterials(configs, activeIndex = 0) {
        this.assertReady();
        this.py.globals.set("_repl_injected_json", JSON.stringify(configs));
        this.py.globals.set("_repl_active_index", activeIndex);
        this.py.runPython(`
import json as _json
_repl_in = [_ReplMaterial.create_from_config_or_class_instance(_c) for _c in _json.loads(_repl_injected_json)]
materials_in = _repl_in
material = _repl_in[_repl_active_index] if (_repl_in and 0 <= _repl_active_index < len(_repl_in)) else (_repl_in[0] if _repl_in else None)
`);
    }
    /** One operation per Material the run created or reassigned. */
    collectChangedMaterials() {
        this.assertReady();
        this.py.runPython(PY_COLLECT);
        const changed = JSON.parse(this.py.runPython("_repl_export"));
        return changed.map(({ variable_name: variableName, config }) => {
            let clientId = this.variableNameToClientId.get(variableName);
            if (!clientId) {
                clientId = randomAlphanumeric(12);
                this.variableNameToClientId.set(variableName, clientId);
            }
            return { variableName, clientId, config };
        });
    }
}
/** Singleton, matching the lifetime of the persistent `window.pyodide`. */
export const replSession = new MaterialsReplSession();
