/**
 * Session persistence.
 *
 * v1 kept nothing: a refresh, a crashed tab or a sleeping laptop cost the whole
 * session silently. Storing the operation logs (not replayed structures) keeps
 * the payload small — a 400-atom supercell is a 3x3 matrix on disk.
 */
import type { MaterialDoc, SessionState, SetDoc } from "./types";

export const STORAGE_KEY = "md2.session.v1";
const SCHEMA_VERSION = 1;

export interface PersistedSession {
    version: number;
    savedAt: number;
    name: string;
    materials: MaterialDoc[];
    sets: SetDoc[];
    activeId: string;
}

function safeStorage(): Storage | null {
    try {
        return typeof window !== "undefined" ? window.localStorage : null;
    } catch (e) {
        return null; // private mode / blocked site data
    }
}

export function serialize(state: SessionState, name = "Untitled session"): PersistedSession {
    return {
        version: SCHEMA_VERSION,
        savedAt: Date.now(),
        name,
        materials: state.materials,
        sets: state.sets,
        activeId: state.activeId,
    };
}

/**
 * Undo history is deliberately not persisted: it is session-scoped, would
 * dominate the payload, and restoring it would let Cmd+Z walk into a state the
 * user never saw in this browser session.
 */
export function save(state: SessionState, name?: string, storage?: Storage): boolean {
    const store = storage ?? safeStorage();
    if (!store) return false;
    try {
        store.setItem(STORAGE_KEY, JSON.stringify(serialize(state, name)));
        return true;
    } catch (e) {
        // Quota exceeded or storage blocked: keep the in-memory session rather
        // than leaving a half-written entry behind.
        try {
            store.removeItem(STORAGE_KEY);
        } catch {
            /* storage is gone entirely; nothing to clean up */
        }
        return false;
    }
}

export function load(storage?: Storage): PersistedSession | null {
    const store = storage ?? safeStorage();
    if (!store) return null;
    try {
        const raw = store.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedSession;
        if (parsed.version !== SCHEMA_VERSION) return null; // old payloads are dropped, not migrated
        if (!Array.isArray(parsed.materials) || !parsed.materials.length) return null;
        if (!parsed.materials.every((m) => Array.isArray(m.log) && m.log.length)) return null;
        return parsed;
    } catch (e) {
        return null;
    }
}

export function clear(storage?: Storage): void {
    const store = storage ?? safeStorage();
    try {
        store?.removeItem(STORAGE_KEY);
    } catch {
        /* nothing to do */
    }
}
