import { describe, expect, it, vi } from "vitest";

import { buildPaletteItems } from "../../../src/domain/paletteSources";
import { createInitialState } from "../../../src/core/session";
import { resolveCommands, type Command } from "../../../src/shell/commands";

const COMMANDS: Command<null>[] = [
    { id: "op.supercell", label: "Create supercell", group: "Build", run: () => {} },
    { id: "op.surface", label: "Create surface / slab", group: "Build", run: () => {} },
    {
        id: "create.standard-library",
        label: "Import from Standata",
        group: "Create",
        keywords: ["standata"],
        run: () => {},
    },
];

function sources(overrides: Partial<Parameters<typeof buildPaletteItems>[1]> = {}) {
    const state = createInitialState();
    return {
        commands: resolveCommands(COMMANDS, null),
        materials: state.materials,
        standata: [
            { name: "Graphene", config: {} },
            { name: "Silicon", config: {} },
        ],
        onSelectMaterial: vi.fn(),
        onImportStandata: vi.fn(),
        ...overrides,
    };
}

describe("buildPaletteItems", () => {
    it("lists actions with nothing typed", () => {
        const items = buildPaletteItems("", sources());
        expect(items.some((item) => item.label === "Create supercell")).toBe(true);
    });

    it("keeps the standard library out of the way until something is typed", () => {
        // Seventy-odd entries would bury the dozen actions someone opened the palette for.
        const items = buildPaletteItems("", sources());
        expect(items.some((item) => item.group === "Standard library")).toBe(false);
    });

    it("searches the library once there is a query", () => {
        const items = buildPaletteItems("graph", sources());
        expect(items.map((item) => item.label)).toContain("Graphene");
    });

    it("narrows actions and excludes the ones that do not match", () => {
        const labels = buildPaletteItems("surf", sources()).map((item) => item.label);
        expect(labels).toContain("Create surface / slab");
        expect(labels).not.toContain("Create supercell");
    });

    it("finds a material by its name", () => {
        const state = createInitialState();
        const items = buildPaletteItems("silicon", sources({ materials: state.materials }));
        expect(items.some((item) => item.group === "Materials")).toBe(true);
    });

    it("runs a library entry rather than merely listing it", () => {
        // The palette's own regression guard: an entry that renders but throws when picked is
        // worse than one that is missing.
        const onImportStandata = vi.fn();
        const items = buildPaletteItems("graphene", sources({ onImportStandata }));
        items.find((item) => item.label === "Graphene")!.run();
        expect(onImportStandata).toHaveBeenCalledWith({ name: "Graphene", config: {} });
    });

    it("carries a command's disabled reason through", () => {
        const commands = resolveCommands(
            [
                {
                    id: "x",
                    label: "Blocked",
                    group: "Build",
                    run: () => {},
                    isEnabled: () => false,
                    disabledReason: () => "Not here",
                },
            ],
            null,
        );
        const item = buildPaletteItems("blocked", sources({ commands }))[0];
        expect(item.disabled).toBe(true);
        expect(item.reason).toBe("Not here");
    });
});
