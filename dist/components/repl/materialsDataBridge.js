import { showErrorAlert } from "@mat3ra/cove/dist/other/alerts";
import { Action } from "@mat3ra/esse/dist/js/types";
import { MDMaterial } from "../../MDMaterial";
function validateMaterialConfigs(configs) {
    return configs.reduce((materials, config) => {
        try {
            const material = new MDMaterial(config);
            material.validate();
            materials.push(material);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            showErrorAlert(`Failed to create material ${config.name}: ${message}`);
        }
        return materials;
    }, []);
}
/** Shared material handlers for iframe notebooks and the in-page Python REPL. */
export function createMaterialsDataBridgeHandlers({ getMaterials, setMaterials, syncMaterials, }) {
    const handleSetData = (payload) => {
        const data = payload;
        if (typeof data.syncScope === "string" && Array.isArray(data.entities)) {
            syncMaterials === null || syncMaterials === void 0 ? void 0 : syncMaterials(data);
            return;
        }
        if (!Array.isArray(data.materials)) {
            showErrorAlert("Invalid material data received");
            return;
        }
        setMaterials === null || setMaterials === void 0 ? void 0 : setMaterials(validateMaterialConfigs(data.materials));
    };
    return [
        { action: Action.setData, handlers: [handleSetData] },
        {
            action: Action.getData,
            handlers: [() => getMaterials().map((material) => material.toJSON())],
        },
    ];
}
