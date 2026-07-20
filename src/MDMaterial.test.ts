import { describe, expect, it } from "vitest";

import { MDMaterial } from "./MDMaterial";

describe("MDMaterial.replClientId (app-level id, must not leak into exports)", () => {
    it("is preserved across clone()", () => {
        const material = new MDMaterial({ name: "supercell" });
        material.replClientId = "cid-1";
        expect(material.clone().replClientId).toBe("cid-1");
    });

    it("does NOT appear in toJSON() (so it never reaches JSON/POSCAR export)", () => {
        const material = new MDMaterial({ name: "supercell" });
        material.replClientId = "cid-1";
        expect("replClientId" in material.toJSON()).toBe(false);
        expect(JSON.stringify(material.toJSON())).not.toContain("cid-1");
    });
});
