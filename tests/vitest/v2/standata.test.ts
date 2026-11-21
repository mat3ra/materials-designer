import Material from "@mat3ra/made/dist/js/Material";
import { describe, expect, it } from "vitest";

import { toImportableConfig } from "../../../src/core/io";
import { COMMANDS } from "../../../src/domain/commands";
import { CATALOG } from "../../../src/domain/panels/catalog";
import { loadStandata } from "../../../src/domain/StandataPanel";

describe("the standard library", () => {
    const entries = loadStandata();

    it("is listed by material name, not by file name", () => {
        // The map is keyed by "C-[Graphene]-HEX_[P6%2Fmmm]_2D_[Monolayer]-[2dm-3993].json".
        expect(entries.some((entry) => entry.name.endsWith(".json"))).toBe(false);
        expect(
            entries.some(
                (entry) => entry.name === "C, Graphene, HEX (P6/mmm) 2D (Monolayer), 2dm-3993",
            ),
        ).toBe(true);
    });

    it("is offered under one name wherever it is offered", () => {
        // The Catalog card said "Standard library" while the command, the palette and v1's menu
        // all said "Import from Standata" — and a reviewer looking for Standata did not find it.
        const command = COMMANDS.find((one) => one.id === "create.standard-library");
        const card = CATALOG.find((entry) => entry.command === "create.standard-library");
        // Both have to be found first. Comparing `card?.title` to `command?.label` when neither
        // exists is `undefined === undefined`, so the test passed precisely when the id it guards
        // had been renamed away — proven by renaming it and watching this stay green.
        expect(command, "no command create.standard-library").toBeDefined();
        expect(card, "no Catalog card runs create.standard-library").toBeDefined();
        expect(card?.title).toBe(command?.label);
    });

    it("can be imported entry by entry", () => {
        const unusable = entries.filter((entry) => {
            try {
                new Material(toImportableConfig(entry.config) as never).toJSON();
                return false;
            } catch {
                return true;
            }
        });
        expect(unusable.map((entry) => entry.name)).toEqual([]);
    });

    it("keeps the provenance of every entry that has valid provenance", () => {
        const withExternal = entries.filter((entry) => entry.config.external !== undefined);
        expect(withExternal.length).toBeGreaterThan(50);
        const dropped = withExternal.filter(
            (entry) => toImportableConfig(entry.config).external === undefined,
        );
        // Exactly one entry names a source outside the schema's enum; the rest keep their block.
        // If this number moves, @mat3ra/standata changed and the reason is worth knowing.
        expect(dropped).toHaveLength(1);
        expect(dropped[0].name).toContain("Nanoribbon");
    });
});

describe("toImportableConfig", () => {
    const SILICON = {
        name: "Silicon FCC",
        lattice: {
            type: "FCC",
            a: 3.867,
            b: 3.867,
            c: 3.867,
            alpha: 60,
            beta: 60,
            gamma: 60,
            units: { length: "angstrom", angle: "degree" },
        },
        basis: {
            elements: [{ id: 0, value: "Si" }],
            coordinates: [{ id: 0, value: [0, 0, 0] }],
            units: "crystal",
        },
    };

    it("leaves a usable config exactly as it is", () => {
        const config = { ...SILICON };
        expect(toImportableConfig(config)).toBe(config);
    });

    it("drops external only when that is what makes the config unusable", () => {
        const valid = { ...SILICON, external: { id: "x", source: "ICSD", origin: true } };
        expect(toImportableConfig(valid).external).toBeDefined();

        const invalid = { ...SILICON, external: { id: "x", source: "somewhere-else" } };
        expect(toImportableConfig(invalid).external).toBeUndefined();
    });

    it("reports a structure that is broken for some other reason", () => {
        expect(() => toImportableConfig({ name: "Broken", lattice: {} })).toThrow();
    });
});
