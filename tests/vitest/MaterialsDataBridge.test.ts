import { Action } from "@mat3ra/esse/dist/js/types";
import { describe, expect, it, vi } from "vitest";

import {
    type MaterialsSyncPayload,
    createMaterialsDataBridgeHandlers,
} from "../../src/components/repl/materialsDataBridge";
import { MDMaterial } from "../../src/MDMaterial";

function handlerFor(
    action: Action,
    options: Parameters<typeof createMaterialsDataBridgeHandlers>[0],
) {
    const config = createMaterialsDataBridgeHandlers(options).find(
        (candidate) => candidate.action === action,
    );
    if (!config) throw new Error(`Missing bridge handler for ${action}`);
    return config.handlers[0];
}

describe("materialsDataBridge", () => {
    it("returns current material configs for both bridge transports", async () => {
        const materials = [new MDMaterial({ name: "Si" }), new MDMaterial({ name: "Ge" })];
        const getData = handlerFor(Action.getData, { getMaterials: () => materials });

        const result = await getData({});

        expect(result).toEqual(materials.map((material) => material.toJSON()));
    });

    it("preserves the legacy JupyterLite materials payload", async () => {
        const setMaterials = vi.fn();
        const config = new MDMaterial({ name: "from-notebook" }).toJSON();
        const setData = handlerFor(Action.setData, {
            getMaterials: () => [],
            setMaterials,
        });

        await setData({ materials: [config] });

        expect(setMaterials).toHaveBeenCalledOnce();
        const received = setMaterials.mock.calls[0][0] as MDMaterial[];
        expect(received).toHaveLength(1);
        expect(received[0]).toBeInstanceOf(MDMaterial);
        expect(received[0].name).toBe("from-notebook");
    });

    it("routes a complete scoped entity batch without invoking the legacy handler", async () => {
        const setMaterials = vi.fn();
        const syncMaterials = vi.fn();
        const payload: MaterialsSyncPayload = {
            syncScope: "python-repl",
            entities: [
                {
                    type: "material",
                    name: "supercell",
                    config: new MDMaterial({ name: "Si" }).toJSON(),
                },
            ],
        };
        const setData = handlerFor(Action.setData, {
            getMaterials: () => [],
            setMaterials,
            syncMaterials,
        });

        await setData(payload);

        expect(syncMaterials).toHaveBeenCalledWith(payload);
        expect(setMaterials).not.toHaveBeenCalled();
    });
});
