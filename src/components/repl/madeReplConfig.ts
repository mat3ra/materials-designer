/**
 * Everything materials-specific about the embedded Python REPL. The REPL page itself
 * (github.com/mat3ra/pyodide-repl) is generic — it knows no domain — so this config travels to it
 * over the data bridge: which packages to install, and the Python that turns this app's materials
 * into `materials_in` / `material` and reads results back out.
 *
 * TODO(repl→AX): both the package lists and the Python below belong in AX — the lists in its
 * `config.yml` `made` profile (shared with JupyterLite, so the two environments cannot drift), the
 * Python in `mat3ra-notebooks-utils` once a release carries the host bridge (api-examples #355).
 */

/** The scope tag every REPL-produced material carries; `materialsSyncScope` keys its merge on it. */
export const REPL_SYNC_SCOPE = "python-repl";

/**
 * Wheels for the packages that do not build under Pyodide, served straight from the JupyterLite
 * deploy that already hosts them for its own kernel — it sends `access-control-allow-origin: *`,
 * so no app in this stack has to serve or provision them.
 */
const WHEEL_BASE_URL = "https://jupyterlite.mat3ra.com/files/packages";

/** Ran once after the environment is built: the namespace a user starts with. */
const SETUP_CODE = `
from mat3ra.made.material import Material
from mat3ra.made.tools.helpers import *

def __md_scan_materials():
    """Serialize every public Material binding, for the host to merge.

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
    return json.dumps({"syncScope": "${REPL_SYNC_SCOPE}", "entities": entities})
`;

/** Ran before every user run: this app's materials, as the variables users expect. */
const BEFORE_RUN_CODE = `
import json as _md_json
_md_data = _md_json.loads(data_from_host_json) or {}
materials_in = [Material.create(config) for config in _md_data.get("materials", [])]
_md_index = _md_data.get("selectedIndex", 0)
material = materials_in[_md_index] if 0 <= _md_index < len(materials_in) else None
`;

const DEFAULT_CODE = `# materials_in = the designer's list, material = the selected one.
# mat3ra.made.tools helpers are pre-imported. Shift+Enter to run.
supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])`;

/** The config this app hands the generic REPL page; see that repo's README for the contract. */
export const MADE_REPL_CONFIG = {
    environment: {
        loadPackages: ["numpy", "scipy", "typing-extensions", "lzma", "sqlite3", "ssl"],
        pypiPinnedPackages: [
            "annotated_types>=0.6.0",
            "networkx==3.2.1",
            "monty==2023.11.3",
            "tabulate==0.9.0",
            "sympy==1.12",
            "uncertainties==3.1.6",
            "ase==3.25.0",
        ],
        wheelBaseUrl: WHEEL_BASE_URL,
        wheelFilenames: [
            "pydantic_core-2.18.2-py3-none-any.whl",
            "pydantic-2.7.1-py3-none-any.whl",
            "spglib-2.0.2-py3-none-any.whl",
            "ruamel.yaml-0.17.32-py3-none-any.whl",
            "pymatgen-2024.4.13-py3-none-any.whl",
        ],
        // Installed once the wheels are in place, so their pinned dependencies are satisfied.
        postWheelPackages: [
            "pymatgen-analysis-defects<=2024.4.23",
            "mat3ra-periodic-table",
            "mat3ra-made",
            "jedi==0.19.2",
        ],
    },
    setupCode: SETUP_CODE,
    beforeRunCode: BEFORE_RUN_CODE,
    afterRunCode: "__md_scan_materials()",
    defaultCode: DEFAULT_CODE,
};
