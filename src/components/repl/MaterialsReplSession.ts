import PyodideSession from "@mat3ra/cove/dist/other/pyodide/PyodideSession";
import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";

import { randomAlphanumeric } from "../../utils/str";
import {
    PYODIDE_INDEX_URL,
    REPL_COMPLETION_PACKAGES,
    REPL_DEFAULT_WHEEL_BASE_URL,
    REPL_INPUT_VARIABLE_NAMES,
    REPL_LOAD_PACKAGES,
    REPL_MAT3RA_PACKAGES,
    REPL_PYPI_PINNED_PACKAGES,
    REPL_WHEEL_FILENAMES,
    REPL_WHEEL_FS_DIR,
} from "./constants";
import PY_COLLECT from "./python/generated/collect";
import PY_HELPER_META from "./python/generated/helper_meta";
import PY_SNAPSHOT from "./python/generated/snapshot";

/**
 * One operation the reducer should apply: the ESSE config produced by a changed Python
 * variable, tagged with the stable client id the session assigned to that variable name.
 * `variableName` is carried for display; add-vs-update is decided by `clientId`.
 */
export interface ReplSyncOperation {
    variableName: string;
    clientId: string;
    config: MaterialSchema;
}

/**
 * Introspected metadata for one pre-imported helper function, used to drive editor autocomplete.
 * Produced by {@link PY_HELPER_META}; `module` is the Python dotted path (used to derive a category).
 */
export interface ReplHelperMeta {
    name: string;
    signature: string;
    doc: string;
    module: string;
}

// Private alias so user code that rebinds `Material` cannot break our isinstance checks;
// the leading underscore also excludes it from the collected globals.
const PY_IMPORT_MATERIAL = "from mat3ra.made.material import Material as _ReplMaterial";

// Pull the full curated helper API (create_supercell, create_slab, create_interface_*, the defect
// helpers, …) into the namespace so users never have to write import lines. `helpers.__all__`
// bounds the `*`, so only the ~45 public names land — not private internals.
const PY_IMPORT_HELPERS = "from mat3ra.made.tools.helpers import *";

/**
 * The Materials Designer flavour of cove's {@link PyodideSession}: everything Material-specific and
 * nothing else. The generic half — loading Pyodide, installing the environment, running code in a
 * persistent namespace, Jupyter-shaped errors, Jedi completions — lives in cove and is shared.
 *
 * What this adds:
 *  - pre-imports `mat3ra.made.tools.helpers` and introspects it for autocomplete ({@link helpers})
 *  - binds the designer's materials into the namespace ({@link injectMaterials})
 *  - diffs the namespace after each run and reports Materials the user created or reassigned
 *    ({@link collectChangedMaterials}), keyed by a stable per-variable client id
 *
 * A module-level singleton ({@link replSession}) is exported so the persistent Python namespace and
 * the variable->clientId map survive the panel being toggled closed and open again.
 */
export class MaterialsReplSession extends PyodideSession {
    /** variableName -> stable client id. Authoritative for add (new name) vs update (known name). */
    private variableNameToClientId = new Map<string, string>();

    /** Introspected helper-function metadata for editor autocomplete; populated on bootstrap. */
    private helperMeta: ReplHelperMeta[] = [];

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
    }

    /** The pre-imported helper functions available in the namespace (for editor autocomplete). */
    get helpers(): ReplHelperMeta[] {
        return this.helperMeta;
    }

    /**
     * Pre-import the made helper API and introspect it, and hand the collector the list of injected
     * input names so a "reload inputs" rebind is never mistaken for a user-created Material.
     */
    protected async bootstrapNamespace(log: (message: string) => void): Promise<void> {
        log("Importing mat3ra.made.tools helpers…");
        this.py.runPython(PY_IMPORT_MATERIAL);
        this.py.runPython(PY_IMPORT_HELPERS);
        this.py.runPython(PY_HELPER_META);
        this.helperMeta = JSON.parse(this.py.runPython("_repl_helper_meta_json"));
        this.py.globals.set("_reserved_input_names", this.py.toPy([...REPL_INPUT_VARIABLE_NAMES]));
        log(
            `Environment ready — ${this.helperMeta.length} helpers pre-imported. Type to autocomplete.`,
        );
    }

    /** Snapshot Material identities before each run so {@link collectChangedMaterials} can diff. */
    protected beforeExecute(): void {
        this.py.runPython(PY_SNAPSHOT);
    }

    /**
     * Bind the current designer materials into the namespace as `materials_in` (list) and
     * `material` (first/active), reconstructed from their ESSE configs.
     */
    injectMaterials(configs: MaterialSchema[], activeIndex = 0): void {
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

    /**
     * Diff the namespace and return one {@link ReplSyncOperation} per newly-created or reassigned
     * Material, resolving/assigning the stable client id per variable name.
     */
    collectChangedMaterials(): ReplSyncOperation[] {
        this.assertReady();
        this.py.runPython(PY_COLLECT);
        const changed: { variable_name: string; config: MaterialSchema }[] = JSON.parse(
            this.py.runPython("_repl_export"),
        );
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

/** Module-level singleton — survives panel toggles alongside the persistent `window.pyodide`. */
export const replSession = new MaterialsReplSession();
