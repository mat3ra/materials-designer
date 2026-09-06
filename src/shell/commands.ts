/**
 * The command registry — one place every action is named, so that nothing has to be reached by
 * walking a menu.
 *
 * v1's Cypress suite selects actions by ordinal position (`selectMenuItemByNameAndItemNumber
 * ("Advanced", 6)`), which is why retiring the menu bar would otherwise break nearly every spec.
 * A command has a stable id; menus, the palette, toolbar buttons, keyboard shortcuts and the tests
 * all address that id, so the UI can be rearranged without touching a single spec.
 *
 * This module is deliberately domain-free: it knows how to resolve, filter and bind commands, not
 * what any of them do. MD's own list lives in `domain/commands.ts`, and a different designer would
 * supply its own — which is what lets this travel to cove later.
 */
import { useEffect } from "react";

export interface Command<TContext> {
    /** Stable across renames and redesigns; this is what tests and shortcuts address. */
    id: string;
    label: string;
    /** Section heading in the palette. */
    group: string;
    /** Normalised chord, e.g. "mod+z", "mod+shift+z", "shift+d", "[". */
    shortcut?: string;
    /** Extra search terms, for when the label is not what someone would type. */
    keywords?: string[];
    run: (context: TContext) => void;
    /** Default: always enabled. */
    isEnabled?: (context: TContext) => boolean;
    /**
     * Why the command cannot run right now. A disabled control that does not say why is worse
     * than one that is greyed out — the user cannot tell a no-op from a bug.
     */
    disabledReason?: (context: TContext) => string;
}

export interface ResolvedCommand {
    id: string;
    label: string;
    group: string;
    shortcut?: string;
    keywords: string[];
    enabled: boolean;
    /** Present only when `enabled` is false. */
    reason?: string;
    run: () => void;
}

/** Bind a command list to the current context, so consumers deal in plain data. */
export function resolveCommands<T>(commands: Command<T>[], context: T): ResolvedCommand[] {
    return commands.map((command) => {
        const enabled = command.isEnabled ? command.isEnabled(context) : true;
        return {
            id: command.id,
            label: command.label,
            group: command.group,
            shortcut: command.shortcut,
            keywords: command.keywords ?? [],
            enabled,
            reason: enabled ? undefined : command.disabledReason?.(context),
            run: () => {
                if (enabled) command.run(context);
            },
        };
    });
}

export function findCommand(commands: ResolvedCommand[], id: string): ResolvedCommand | undefined {
    return commands.find((command) => command.id === id);
}

/**
 * Every term must match somewhere — the same rule the Catalog uses, so searching behaves the same
 * wherever you type.
 */
export function filterCommands(commands: ResolvedCommand[], query: string): ResolvedCommand[] {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length === 0) return commands;
    return commands.filter((command) => {
        const haystack = [command.label, command.group, ...command.keywords]
            .join(" ")
            .toLowerCase();
        return terms.every((term) => haystack.includes(term));
    });
}

/**
 * True when the event is going to a place where the user is writing.
 *
 * Shortcuts must never steal a key from a text field: ⌘Z inside the filter box belongs to the
 * field's own undo, and Shift+D is a capital letter, not a request to switch material.
 */
export function isTypingTarget(target: EventTarget | null): boolean {
    const element = target as HTMLElement | null;
    if (!element || typeof element.tagName !== "string") return false;
    return (
        element.tagName === "INPUT" ||
        element.tagName === "TEXTAREA" ||
        element.tagName === "SELECT" ||
        element.isContentEditable === true
    );
}

interface ChordEvent {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
}

/**
 * Modifiers are matched exactly, so "mod+z" does not fire for ⇧⌘Z. `mod` is ⌘ on a Mac and Ctrl
 * elsewhere; both are accepted so a spec can drive either.
 */
export function matchesShortcut(event: ChordEvent, shortcut: string): boolean {
    const parts = shortcut.toLowerCase().split("+");
    const key = parts[parts.length - 1];
    const wants = {
        mod: parts.includes("mod"),
        shift: parts.includes("shift"),
        alt: parts.includes("alt"),
    };
    const has = {
        mod: !!(event.metaKey || event.ctrlKey),
        shift: !!event.shiftKey,
        alt: !!event.altKey,
    };
    return (
        event.key.toLowerCase() === key &&
        wants.mod === has.mod &&
        wants.shift === has.shift &&
        wants.alt === has.alt
    );
}

/**
 * Install the registry's shortcuts on the window.
 *
 * One listener for every command, rather than a chord handler per feature: that is what keeps the
 * typing guard and the enabled-state check in a single place instead of being re-derived — and
 * re-forgotten — at each call site.
 */
export function useCommandShortcuts(commands: ResolvedCommand[], active = true): void {
    useEffect(() => {
        if (!active) return undefined;
        function onKeyDown(event: KeyboardEvent) {
            if (isTypingTarget(event.target)) return;
            const hit = commands.find(
                (command) => command.shortcut && matchesShortcut(event, command.shortcut),
            );
            if (!hit) return;
            event.preventDefault();
            // A disabled command swallows its chord rather than falling through to the browser:
            // ⌘Z with nothing to undo should do nothing, not undo something else.
            if (hit.enabled) hit.run();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [commands, active]);
}
