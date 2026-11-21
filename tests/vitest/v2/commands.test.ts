import { describe, expect, it, vi } from "vitest";

import {
    type Command,
    filterCommands,
    findCommand,
    isTypingTarget,
    matchesShortcut,
    resolveCommands,
} from "../../../src/shell/commands";

interface Ctx {
    canUndo: boolean;
    openPanels: number;
}

const CONTEXT: Ctx = { canUndo: false, openPanels: 3 };

const COMMANDS: Command<Ctx>[] = [
    { id: "edit.undo", label: "Undo", group: "Edit", shortcut: "mod+z", run: () => {},
      isEnabled: (c) => c.canUndo, disabledReason: () => "Nothing to undo" },
    { id: "edit.redo", label: "Redo", group: "Edit", shortcut: "mod+shift+z", run: () => {} },
    { id: "op.supercell", label: "Create supercell", group: "Build",
      keywords: ["repeat", "3x3"], run: () => {} },
    { id: "op.surface", label: "Create surface / slab", group: "Build",
      keywords: ["miller", "hkl"], run: () => {} },
];

describe("resolveCommands", () => {
    it("carries the reason a command cannot run", () => {
        const resolved = resolveCommands(COMMANDS, CONTEXT);
        const undo = findCommand(resolved, "edit.undo")!;
        expect(undo.enabled).toBe(false);
        expect(undo.reason).toBe("Nothing to undo");
    });

    it("reports no reason when the command is available", () => {
        const resolved = resolveCommands(COMMANDS, { ...CONTEXT, canUndo: true });
        const undo = findCommand(resolved, "edit.undo")!;
        expect(undo.enabled).toBe(true);
        expect(undo.reason).toBeUndefined();
    });

    it("defaults to enabled when a command states no condition", () => {
        expect(findCommand(resolveCommands(COMMANDS, CONTEXT), "edit.redo")!.enabled).toBe(true);
    });

    it("refuses to run a disabled command even if its run() is called directly", () => {
        // The palette and the shortcut path both call run() on whatever row is focused; the guard
        // belongs here rather than being re-implemented, and re-forgotten, at each call site.
        const run = vi.fn();
        const resolved = resolveCommands(
            [{ id: "x", label: "X", group: "G", run, isEnabled: () => false }],
            CONTEXT,
        );
        resolved[0].run();
        expect(run).not.toHaveBeenCalled();
    });

    it("passes the context through to run()", () => {
        const run = vi.fn();
        resolveCommands([{ id: "x", label: "X", group: "G", run }], CONTEXT)[0].run();
        expect(run).toHaveBeenCalledWith(CONTEXT);
    });
});

describe("filterCommands", () => {
    const resolved = resolveCommands(COMMANDS, CONTEXT);

    it("returns everything for an empty query", () => {
        expect(filterCommands(resolved, "")).toHaveLength(COMMANDS.length);
        expect(filterCommands(resolved, "   ")).toHaveLength(COMMANDS.length);
    });

    it("narrows to one match and excludes the others", () => {
        // The spec asserts both halves: searching "surf" shows the surface command and hides
        // supercell.
        const hits = filterCommands(resolved, "surf");
        expect(hits.map((c) => c.id)).toEqual(["op.surface"]);
    });

    it("matches on keywords the label does not contain", () => {
        expect(filterCommands(resolved, "hkl").map((c) => c.id)).toEqual(["op.surface"]);
    });

    it("requires every term to match, not any", () => {
        expect(filterCommands(resolved, "create supercell").map((c) => c.id)).toEqual([
            "op.supercell",
        ]);
        expect(filterCommands(resolved, "create nonsense")).toHaveLength(0);
    });

    it("ignores case", () => {
        expect(filterCommands(resolved, "UNDO").map((c) => c.id)).toEqual(["edit.undo"]);
    });
});

describe("matchesShortcut", () => {
    it("matches a modifier chord on either platform's modifier", () => {
        expect(matchesShortcut({ key: "z", metaKey: true }, "mod+z")).toBe(true);
        expect(matchesShortcut({ key: "z", ctrlKey: true }, "mod+z")).toBe(true);
    });

    it("does not fire the unshifted chord when shift is held", () => {
        // Otherwise ⇧⌘Z would undo as well as redo.
        expect(matchesShortcut({ key: "z", metaKey: true, shiftKey: true }, "mod+z")).toBe(false);
        expect(matchesShortcut({ key: "z", metaKey: true, shiftKey: true }, "mod+shift+z")).toBe(
            true,
        );
    });

    it("requires the modifier when one is specified", () => {
        expect(matchesShortcut({ key: "z" }, "mod+z")).toBe(false);
    });

    it("rejects extra modifiers on a bare key", () => {
        expect(matchesShortcut({ key: "d", shiftKey: true }, "shift+d")).toBe(true);
        expect(matchesShortcut({ key: "d", shiftKey: true, metaKey: true }, "shift+d")).toBe(false);
        expect(matchesShortcut({ key: "[" }, "[")).toBe(true);
    });

    it("is case-insensitive about the key", () => {
        // Shift+D arrives as key "D", not "d".
        expect(matchesShortcut({ key: "D", shiftKey: true }, "shift+d")).toBe(true);
    });
});

describe("isTypingTarget", () => {
    it("recognises the places a user writes", () => {
        for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) {
            expect(isTypingTarget({ tagName } as unknown as EventTarget)).toBe(true);
        }
        expect(
            isTypingTarget({ tagName: "DIV", isContentEditable: true } as unknown as EventTarget),
        ).toBe(true);
    });

    it("does not treat ordinary elements or a missing target as typing", () => {
        expect(isTypingTarget({ tagName: "DIV" } as unknown as EventTarget)).toBe(false);
        expect(isTypingTarget(null)).toBe(false);
        expect(isTypingTarget({} as unknown as EventTarget)).toBe(false);
    });
});
