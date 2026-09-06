/**
 * A palette: type, see what matches, run it.
 *
 * Domain-free by construction — it takes rows and hands one back. What those rows are, and where
 * they come from, is the host's business. That is what lets the same component search a materials
 * session here and a workflow's units elsewhere.
 */
import React, { useEffect, useMemo, useRef, useState } from "react";

export interface PaletteItem {
    id: string;
    label: string;
    /** Section heading; items are grouped in the order their sections first appear. */
    group: string;
    /** Right-aligned detail — a shortcut, a formula, a count. */
    hint?: string;
    disabled?: boolean;
    /** Why it cannot run, shown in place of the hint. */
    reason?: string;
    run: () => void;
}

export interface CommandPaletteProps {
    open: boolean;
    query: string;
    onQueryChange: (query: string) => void;
    /** Already filtered by the host, which knows what its sources cost to search. */
    items: PaletteItem[];
    onClose: () => void;
    placeholder?: string;
    emptyMessage?: string;
}

export function CommandPalette({
    open,
    query,
    onQueryChange,
    items,
    onClose,
    placeholder = "Search…",
    emptyMessage = "Nothing matches",
}: CommandPaletteProps) {
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) inputRef.current?.focus();
    }, [open]);

    // A shrinking list must not leave the highlight past its end.
    useEffect(() => setActive(0), [query, items.length]);

    const groups = useMemo(() => {
        const order: string[] = [];
        const byGroup = new Map<string, PaletteItem[]>();
        items.forEach((item) => {
            if (!byGroup.has(item.group)) {
                byGroup.set(item.group, []);
                order.push(item.group);
            }
            byGroup.get(item.group)!.push(item);
        });
        return order.map((group) => ({ group, items: byGroup.get(group)! }));
    }, [items]);

    if (!open) return null;

    const runnable = items.filter((item) => !item.disabled);

    function onKeyDown(event: React.KeyboardEvent) {
        if (event.key === "Escape") {
            event.preventDefault();
            onClose();
        }
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, runnable.length - 1));
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
        }
        if (event.key === "Enter") {
            event.preventDefault();
            const item = runnable[active];
            if (item) {
                item.run();
                onClose();
            }
        }
    }

    let runnableIndex = -1;

    return (
        <div className="command-palette md2-palette" role="dialog" aria-label="Command palette">
            <div className="command-palette-input md2-palette-input">
                <input
                    ref={inputRef}
                    value={query}
                    placeholder={placeholder}
                    aria-label="Search commands and materials"
                    onChange={(event) => onQueryChange(event.target.value)}
                    onKeyDown={onKeyDown}
                />
            </div>
            <div className="md2-palette-list" role="listbox">
                {groups.length === 0 && <div className="md2-empty">{emptyMessage}</div>}
                {groups.map(({ group, items: groupItems }) => (
                    <div key={group} className="md2-palette-group">
                        <div className="md2-palette-groupname">{group}</div>
                        {groupItems.map((item) => {
                            if (!item.disabled) runnableIndex += 1;
                            const isActive = !item.disabled && runnableIndex === active;
                            return (
                                <button
                                    type="button"
                                    key={item.id}
                                    role="option"
                                    aria-selected={isActive}
                                    className={`command-palette-item md2-palette-item${
                                        isActive ? " md2-on" : ""
                                    }`}
                                    disabled={item.disabled}
                                    title={item.reason}
                                    onClick={() => {
                                        item.run();
                                        onClose();
                                    }}
                                >
                                    <span className="md2-palette-label">{item.label}</span>
                                    <span className="md2-palette-hint">
                                        {item.disabled ? item.reason : item.hint}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
}
