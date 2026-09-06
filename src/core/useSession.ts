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

import { type PersistedSession, clear as clearStorage, load, save } from "./persist";
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
    fork: (id: string, upToStep?: number, options?: { select?: boolean; name?: string }) => void;
    revert: (id: string, step: number) => void;
    select: (id: string) => void;
    selectSites: (siteIds: number[]) => void;
    undo: () => void;
    redo: () => void;
    error: string | null;
    clearError: () => void;
    /** Escape hatch for composite reducers (e.g. set-producing operations). */
    run: (fn: (state: SessionState) => SessionState) => void;
}

export interface UseSessionOptions {
    /** Seeds a fresh session; ignored when a stored one is adopted. */
    initialDocs?: MaterialDoc[];
    /**
     * "none" skips both restoring and autosaving.
     *
     * The embedded costume uses it: the platform hands over the materials it wants edited, and a
     * session left in this browser from some other visit must not overwrite them.
     */
    persistence?: "local" | "none";
}

export function useSession({
    initialDocs,
    persistence = "local",
}: UseSessionOptions = {}): UseSession {
    // A stored session is only usable if it still replays: a dependency bump can
    // leave an operation unreplayable, and rendering an unresolvable material
    // would white-screen the app on every load with no way back. Check before
    // adopting it, and fall back to a fresh session with an explanation.
    const [restored] = useState<(PersistedSession & { unusable?: string }) | null>(() => {
        if (persistence === "none") return null;
        const payload = load();
        if (!payload) return null;
        try {
            payload.materials.forEach((doc) => resolve(doc));
            return payload;
        } catch (e) {
            return { ...payload, unusable: e instanceof Error ? e.message : String(e) };
        }
    });
    const usable = Boolean(restored && !restored.unusable);
    const [state, setState] = useState<SessionState>(() =>
        restored && usable
            ? createInitialState(restored.materials, {
                  sets: restored.sets,
                  activeId: restored.activeId,
              })
            : createInitialState(initialDocs),
    );
    const [sessionName, setSessionName] = useState(
        restored && usable ? restored.name : "Untitled session",
    );
    const [savedAt, setSavedAt] = useState<number | null>(
        restored && usable ? restored.savedAt : null,
    );
    const [restoredFrom, setRestoredFrom] = useState<string | null>(
        restored && usable ? new Date(restored.savedAt).toLocaleString() : null,
    );
    const [error, setError] = useState<string | null>(
        restored && !usable
            ? `Your saved session could not be reopened (${restored.unusable}), so this is a fresh one. The saved data is untouched in storage.`
            : null,
    );
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Autosave on idle. Restoring silently would be worse than not restoring —
    // the notice is dismissed explicitly by the user (see restoredFrom).
    useEffect(() => {
        if (persistence === "none") return undefined;
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            if (save(state, sessionName)) setSavedAt(Date.now());
        }, AUTOSAVE_DEBOUNCE_MS);
        return () => {
            if (timer.current) clearTimeout(timer.current);
        };
    }, [state, sessionName, persistence]);

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
            fork: (id: string, upToStep?: number, options?: { select?: boolean; name?: string }) =>
                run((s) => forkMaterial(s, id, upToStep, options)),
            revert: (id: string, step: number) => run((s) => revertTo(s, id, step)),
            select: (id: string) => run((s) => setActive(s, id)),
            selectSites: (siteIds: number[]) => run((s) => setSelection(s, siteIds)),
            undo: () => run(undo),
            redo: () => run(redo),
        }),
        [run],
    );

    // Undo/redo shortcuts are not bound here.
    //
    // They belong to the command registry (`shell/commands.ts`), which owns every chord in one
    // place along with the typing guard and the enabled-state check. Binding them here as well
    // meant a single ⌘Z ran undo twice — the browser dispatches to both listeners — which walked
    // the history back two steps at a time.

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
        run,
        error,
        clearError: () => setError(null),
        ...api,
    };
}

export { createMaterialDoc };
