import type { MaterialSchema } from "@mat3ra/esse/dist/js/types";

import type { MDMaterial } from "../../MDMaterial";
import type { Pyodide } from "./pyodideEnvironment";

/** The scope tag every REPL-produced material carries; see `materialsSyncScope` for the merge rule. */
export const REPL_SYNC_SCOPE = "python-repl";

export interface MaterialEntity {
    type: "material";
    name: string;
    config: MaterialSchema;
}

export interface MaterialsSyncPayload {
    syncScope: string;
    entities: MaterialEntity[];
}

/**
 * The namespace users see, ran once after the environment is built.
 *
 * Inline Python is deliberate bootstrap glue, kept to this file: the imports plus one scan
 * function. It moves into `mat3ra-notebooks-utils` once a release ships the REPL host bridge —
 * v1 must not depend on an unreleased wheel.
 */
export const MATERIALS_PREAMBLE = `
from mat3ra.made.material import Material
from mat3ra.made.tools.helpers import *

def __md_scan_materials():
    """Serialize every public Material binding for the host.

    Lists, tuples and dictionary values are inspected one level deep. The host-provided inputs
    (materials_in, material) are excluded so merely running a cell does not echo them back.
    """
    import json
    reserved = {"materials_in", "material"}
    entities = []
    for name, value in list(globals().items()):
        if name.startswith("_") or name in reserved:
            continue
        if isinstance(value, Material):
            found = [value]
        elif isinstance(value, (list, tuple)):
            found = [item for item in value if isinstance(item, Material)]
        elif isinstance(value, dict):
            found = [item for item in value.values() if isinstance(item, Material)]
        else:
            continue
        entities.extend(
            {"type": "material", "name": name, "config": json.loads(m.to_json())} for m in found
        )
    return json.dumps(entities)
`;

/** Rebinds `materials_in` / `material` from the designer's current list; ran before every run. */
const BIND_MATERIALS_SNIPPET = `
import json as _md_json
materials_in = [Material.create(config) for config in _md_json.loads(_md_materials_json)]
material = materials_in[_md_selected_index] if 0 <= _md_selected_index < len(materials_in) else None
`;

/** Push the designer's materials into the namespace as `materials_in`, the selected one as `material`. */
export async function pushMaterialsIntoNamespace(
    pyodide: Pyodide,
    materials: MDMaterial[],
    selectedIndex: number,
): Promise<void> {
    pyodide.globals.set(
        "_md_materials_json",
        JSON.stringify(materials.map((material) => material.toJSON())),
    );
    pyodide.globals.set("_md_selected_index", selectedIndex);
    await pyodide.runPythonAsync(BIND_MATERIALS_SNIPPET);
}

/** Read every public `Material` binding back out as a sync payload for the reducer. */
export async function pullMaterialsFromNamespace(pyodide: Pyodide): Promise<MaterialsSyncPayload> {
    const entitiesJson = (await pyodide.runPythonAsync("__md_scan_materials()")) as string;
    return { syncScope: REPL_SYNC_SCOPE, entities: JSON.parse(entitiesJson) as MaterialEntity[] };
}
