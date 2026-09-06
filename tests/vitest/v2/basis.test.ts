import { describe, expect, it } from "vitest";

import { emptySite, parseBasisXyz, serializeBasisXyz } from "../../../src/domain/inspector/basis";

describe("parseBasisXyz", () => {
    it("reads element and coordinates", () => {
        const sites = parseBasisXyz("Si 0 0 0\nSi 0.25 0.25 0.25");
        expect(sites).toHaveLength(2);
        expect(sites[0]).toEqual({
            element: "Si",
            x: "0",
            y: "0",
            z: "0",
            constraints: [true, true, true],
        });
    });

    it("treats a site with no constraint columns as unconstrained", () => {
        expect(parseBasisXyz("Si 0 0 0")[0].constraints).toEqual([true, true, true]);
    });

    it("reads constraint columns when present", () => {
        expect(parseBasisXyz("Si 0 0 0 1 1 0")[0].constraints).toEqual([true, true, false]);
    });

    it("ignores blank lines and stray whitespace", () => {
        expect(parseBasisXyz("\n  Si 0 0 0  \n\n Si 0.25 0.25 0.25\n")).toHaveLength(2);
    });

    it("survives made.js's own spacing", () => {
        const sites = parseBasisXyz("Si     0.000000    0.000000    0.000000 \n");
        expect(sites).toHaveLength(1);
        expect(sites[0].element).toBe("Si");
    });
});

describe("serializeBasisXyz", () => {
    it("omits constraint columns when nothing is constrained", () => {
        // An untouched basis has to serialise as it did before the table existed; appending
        // "1 1 1" everywhere would change stored content for a material nobody edited.
        const text = serializeBasisXyz(parseBasisXyz("Si 0 0 0\nSi 0.25 0.25 0.25"));
        expect(text).toBe("Si 0.000000 0.000000 0.000000\nSi 0.250000 0.250000 0.250000");
    });

    it("writes constraints for every site once any one of them is constrained", () => {
        const sites = parseBasisXyz("Si 0 0 0\nSi 0.25 0.25 0.25");
        sites[0].constraints = [true, true, false];
        expect(serializeBasisXyz(sites)).toBe(
            "Si 0.000000 0.000000 0.000000 1 1 0\nSi 0.250000 0.250000 0.250000 1 1 1",
        );
    });

    it("formats coordinates to six places", () => {
        const sites = [{ ...emptySite(), x: "0.4" }];
        expect(serializeBasisXyz(sites)).toBe("Si 0.400000 0.000000 0.000000");
    });

    it("leaves a value that is not a number alone, so a half-typed cell is not destroyed", () => {
        const sites = [{ ...emptySite(), x: "-" }];
        expect(serializeBasisXyz(sites)).toBe("Si - 0.000000 0.000000");
    });

    it("round-trips through parse", () => {
        const original = "Si 0.000000 0.000000 0.000000 1 1 0\nO 0.250000 0.250000 0.250000 1 1 1";
        expect(serializeBasisXyz(parseBasisXyz(original))).toBe(original);
    });
});
