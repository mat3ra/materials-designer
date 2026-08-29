/**
 * React binding for the session store.
 *
 * The store itself is pure (state/session.ts); this hook owns the React state,
 * the autosave debounce, the restore-on-load prompt and the global keyboard
 * shortcuts. Keeping the reducers pure is what lets the spine be tested without
 * a DOM — and stops the v1 mistake of holding the present in a ref that React
 * never re-renders for.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { clear as clearStorage, load, save } from "./persist";
import { resolve } from "./replay";
import {
    type RecordOptions,
    addMaterials,
    applyCoalescingOperation,
    applyOperation,
    canRedo,
    canUndo,
    createInitialState,
    createMaterialDoc,
    forkMaterial,
    getActive,
    redo,
    removeMaterial,
    revertTo,
    setActive,
    setSelection,
    undo,
} from "./session";
import type { MaterialDoc, SessionState } from "./types";

const AUTOSAVE_DEBOUNCE_MS = 800;

export interface UseSession {
    state: SessionState;
    activeDoc: MaterialDoc;
    active: ReturnType<typeof resolve>;
    sessionName: string;
    setSessionName: (name: string) => void;
    savedAt: number | null;
    restoredFrom: string | null;
    dismissRestoreNotice: () => void;
    startFresh: () => void;
    canUndo: boolean;
    canRedo: boolean;
    apply: (
        type: string,
        params: unknown,
        options?: RecordOptions & { materialId?: string },
    ) => void;
    applyCoalescing: (
        type: string,
        params: unknown,
        options?: RecordOptions & { materialId?: string },
    ) => void;
    add: (docs: MaterialDoc[]) => void;
    remove: (id: string) => void;
    fork: (id: string, upToStep?: number) => void;
    revert: (id: string, step: number) => void;
    select: (id: string) => void;
    selectSites: (siteIds: number[]) => void;
    undo: () => void;
    redo: () => void;
    error: string | null;
    clearError: () => void;
}

export function useSession(): UseSession {
    const [restored] = useState(() => load());
    const [state, setState] = useState<SessionState>(() => createInitialState(restored?.materials));
    const [sessionName, setSessionName] = useState(restored?.name ?? "Untitled session");
    const [savedAt, setSavedAt] = useState<number | null>(restored?.savedAt ?? null);
    const [restoredFrom, setRestoredFrom] = useState<string | null>(
        restored ? new Date(restored.savedAt).toLocaleString() : null,
    );
    const [error, setError] = useState<string | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Autosave on idle. Restoring silently would be worse than not restoring —
    // the notice is dismissed explicitly by the user (see restoredFrom).
    useEffect(() => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (save(state, sessionName)) setSavedAt(Date.now());
        }, AUTOSAVE_DEBOUNCE_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [state, sessionName]);

    /** Wrap a reducer so a failing operation surfaces instead of white-screening. */
    const run = useCallback((fn: (s: SessionState) => SessionState) => {
        setState((current) => {
            try {
                return fn(current);
            } catch (e) {
                setError(e instanceof Error ? e.message : String(e));
                return current;
            }
        });
    }, []);

    const api = useMemo(
        () => ({
            apply: (
                type: string,
                params: unknown,
                options?: RecordOptions & { materialId?: string },
            ) => run((s) => applyOperation(s, type, params, options)),
            applyCoalescing: (
                type: string,
                params: unknown,
                options?: RecordOptions & { materialId?: string },
            ) => run((s) => applyCoalescingOperation(s, type, params, options)),
            add: (docs: MaterialDoc[]) => run((s) => addMaterials(s, docs)),
            remove: (id: string) => run((s) => removeMaterial(s, id)),
            fork: (id: string, upToStep?: number) => run((s) => forkMaterial(s, id, upToStep)),
            revert: (id: string, step: number) => run((s) => revertTo(s, id, step)),
            select: (id: string) => run((s) => setActive(s, id)),
            selectSites: (siteIds: number[]) => run((s) => setSelection(s, siteIds)),
            undo: () => run(undo),
            redo: () => run(redo),
        }),
        [run],
    );

    // One keyboard path for undo/redo, whichever surface produced the edit.
    // Guarded so the chords still belong to a focused text field.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement | null;
            const typing =
                !!target &&
                (target.tagName === "INPUT" ||
                    target.tagName === "TEXTAREA" ||
                    target.isContentEditable);
            const mod = event.metaKey || event.ctrlKey;
            if (!mod || event.key.toLowerCase() !== "z") return;
            if (typing) return;
            event.preventDefault();
            if (event.shiftKey) api.redo();
            else api.undo();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [api]);

    const activeDoc = getActive(state);

    return {
        state,
        activeDoc,
        active: resolve(activeDoc),
        sessionName,
        setSessionName,
        savedAt,
        restoredFrom,
        dismissRestoreNotice: () => setRestoredFrom(null),
        startFresh: () => {
            clearStorage();
            setState(createInitialState());
            setSessionName("Untitled session");
            setRestoredFrom(null);
        },
        canUndo: canUndo(state),
        canRedo: canRedo(state),
        error,
        clearError: () => setError(null),
        ...api,
    };
}

export { createMaterialDoc };
