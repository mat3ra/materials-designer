/**
 * MD 2.0 shell.
 *
 * Every mutation in this component goes through `session.apply(...)`, which
 * appends one operation to the active material's log. That single write path is
 * the whole point: the Timeline, the undo stack, autosave and (later) the
 * assistant all read the same record, so no surface can hold private history.
 */
import type Material from "@mat3ra/made/dist/js/Material";
import React, { useCallback, useEffect, useState } from "react";

import { CatalogLite, PANELS } from "../panels";
import { replay } from "../state/replay";
import { applySetOperation, createMaterialDoc, editOperation } from "../state/session";
import { useSession } from "../state/useSession";
import { CombinatorialPanel } from "./CombinatorialPanel";
import { ConsoleDock } from "./ConsoleDock";
import { Inspector } from "./Inspector";
import { Navigator } from "./Navigator";
import { StandataPanel } from "./StandataPanel";
import { StatusBar } from "./StatusBar";
import { Timeline } from "./Timeline";
import { Viewport } from "./Viewport";
import { WorkspaceBar } from "./WorkspaceBar";

type Theme = "dark" | "light";

/** Operations whose panel lives in the shell rather than the parameter kit. */
const SHELL_PANELS = new Set(["standard-library", "combinatorial-set"]);

/** Apply-button wording: an edit says how much history it will re-run. */
function editApplyLabel(editing: boolean, downstream: number): string | undefined {
    if (!editing) return undefined;
    if (!downstream) return "Apply";
    return `Apply & replay ${downstream} step${downstream === 1 ? "" : "s"}`;
}

/** Steps whose parameters can be re-opened and replayed. */
const EDITABLE_TYPES = new Set(Object.keys(PANELS));

export function App() {
    const session = useSession();
    const [theme, setTheme] = useState<Theme>("dark");
    const [catalogOpen, setCatalogOpen] = useState(false);
    const [catalogQuery, setCatalogQuery] = useState("");
    const [notice, setNotice] = useState<string | null>(null);
    const [panelType, setPanelType] = useState<string | null>(null);
    /** Set while re-editing a step already in the timeline. */
    const [editingStep, setEditingStep] = useState<number | null>(null);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // The palette chord opens the same Catalog the toolbar does — one command
    // surface, several doors into it.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setCatalogOpen(true);
            }
            if (event.key === "Escape") {
                setCatalogOpen(false);
                setPanelType(null);
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const { apply, applyCoalescing } = session;

    /**
     * Canvas edits arrive already classified by wave (drag, gizmo, add, ...).
     * Only the basis can differ, so that is what the step stores; a burst of
     * drag commits coalesces into one chip and one undo.
     */
    const handleCanvasEdit = useCallback(
        (updated: Material, source: string) => {
            applyCoalescing(
                "manual-patch",
                { basis: updated.basis, note: `${source} in 3D` },
                { source: "gesture", engine: "manual", label: "Manual edit" },
            );
        },
        [applyCoalescing],
    );

    const handleApply = useCallback(
        (type: string, params: unknown) => {
            apply(type, params, { source: "form" });
            setPanelType(null);
        },
        [apply],
    );

    /**
     * Applying from an *edit* replaces the step in place and replays what
     * follows, rather than appending a new one. Steps that cannot survive the
     * change come back as `staleSteps` and are reported, not hidden.
     */
    const handleApplyEdit = useCallback(
        (_type: string, params: unknown) => {
            const step = editingStep;
            if (step === null) return;
            const materialId = session.state.activeId;
            session.run((state) => {
                const { state: next, staleSteps } = editOperation(state, materialId, step, params);
                if (next === state) {
                    throw new Error(
                        "That change makes the step itself invalid, so the edit was refused.",
                    );
                }
                if (staleSteps.length) {
                    window.setTimeout(
                        () =>
                            setNotice(
                                `Replayed. ${staleSteps.length} later step(s) could not survive the change and were skipped — see the timeline.`,
                            ),
                        0,
                    );
                }
                return next;
            });
            setEditingStep(null);
            setPanelType(null);
        },
        [editingStep, session],
    );

    const panel = panelType ? PANELS[panelType] : undefined;
    const PanelComponent = panel?.Component;

    /** Panels that are part of the shell rather than the numeric-parameter kit. */
    function renderShellPanel() {
        if (panelType === "standard-library") {
            return (
                <StandataPanel
                    onCancel={() => setPanelType(null)}
                    onPick={(entry) => {
                        session.add([
                            createMaterialDoc("create-from-config", {
                                config: entry.config,
                                source: `${entry.name} (standard library)`,
                            }),
                        ]);
                        setPanelType(null);
                    }}
                />
            );
        }
        if (panelType === "combinatorial-set") {
            return (
                <CombinatorialPanel
                    material={session.active.material}
                    onCancel={() => setPanelType(null)}
                    onApply={(configs, xyz) => {
                        session.run((state) =>
                            applySetOperation(state, "combinatorial-set", { xyz }, configs, {
                                setLabel: "Combinatorial set",
                            }),
                        );
                        setPanelType(null);
                    }}
                />
            );
        }
        return null;
    }

    const shellPanel = renderShellPanel();

    /**
     * The right pane shows an operation panel while one is being configured and
     * the Inspector otherwise — the modeless-configure half of the design.
     */
    function renderRightPane() {
        if (shellPanel) return <div className="md2-inspector">{shellPanel}</div>;
        if (PanelComponent) {
            const editing = editingStep !== null;
            const downstream = editing
                ? session.activeDoc.log.length - 1 - (editingStep as number)
                : 0;
            return (
                <div className="md2-inspector">
                    <PanelComponent
                        material={
                            // An edit is configured against the state the step
                            // originally ran on, not against the current tip.
                            editing
                                ? replay(session.activeDoc.log, editingStep as number)
                                : session.active.material
                        }
                        initialParams={
                            editing
                                ? session.activeDoc.log[editingStep as number]?.params
                                : undefined
                        }
                        applyLabel={editApplyLabel(editing, downstream)}
                        onApply={editing ? handleApplyEdit : handleApply}
                        onCancel={() => {
                            setPanelType(null);
                            setEditingStep(null);
                        }}
                    />
                </div>
            );
        }
        return (
            <Inspector
                material={session.active.material}
                digest={session.active.digest}
                selection={session.state.selection}
                onApply={handleApply}
            />
        );
    }

    return (
        <div className="md2-app">
            <WorkspaceBar
                sessionName={session.sessionName}
                onRename={session.setSessionName}
                savedAt={session.savedAt}
                canUndo={session.canUndo}
                canRedo={session.canRedo}
                onUndo={session.undo}
                onRedo={session.redo}
                onOpenCatalog={() => setCatalogOpen(true)}
                theme={theme}
                onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            />

            {session.restoredFrom && (
                <div className="md2-notice" data-testid="restore-notice">
                    <span>
                        Restored your last session (saved {session.restoredFrom}). Restoring
                        silently would be worse than not restoring at all.
                    </span>
                    <button type="button" onClick={session.startFresh}>
                        Start fresh
                    </button>
                    <button type="button" onClick={session.dismissRestoreNotice}>
                        Keep it
                    </button>
                </div>
            )}
            {notice && (
                <div className="md2-notice" data-testid="notice">
                    <span>{notice}</span>
                    <button type="button" onClick={() => setNotice(null)}>
                        Dismiss
                    </button>
                </div>
            )}
            {session.error && (
                <div className="md2-notice md2-error" data-testid="error-notice">
                    <span>{session.error}</span>
                    <button type="button" onClick={session.clearError}>
                        Dismiss
                    </button>
                </div>
            )}

            <div className="md2-main">
                <Navigator
                    state={session.state}
                    onSelect={session.select}
                    onRemove={session.remove}
                    onFork={(id) => session.fork(id)}
                    onNew={() => session.add([createMaterialDoc("create-default", {})])}
                />

                <div className="md2-center">
                    <Viewport
                        material={session.active.material}
                        onEdit={handleCanvasEdit}
                        onSelectionChanged={session.selectSites}
                    />
                    <ConsoleDock
                        doc={session.activeDoc}
                        materialName={session.active.material.name ?? "material"}
                    />
                </div>

                <Timeline
                    doc={session.activeDoc}
                    editableTypes={EDITABLE_TYPES}
                    editingStep={editingStep}
                    onEditStep={(step) => {
                        setEditingStep(step);
                        setPanelType(session.activeDoc.log[step].type);
                    }}
                    onRevertTo={(step) => session.revert(session.activeDoc.id, step)}
                    onFork={(step) => session.fork(session.activeDoc.id, step)}
                />

                {renderRightPane()}
            </div>

            <StatusBar
                digest={session.active.digest}
                selection={session.state.selection}
                stepCount={session.activeDoc.log.length}
                materialIndex={session.state.materials.findIndex(
                    (m) => m.id === session.state.activeId,
                )}
                materialCount={session.state.materials.length}
                saved={session.savedAt !== null}
            />

            {catalogOpen && (
                <div
                    className="md2-scrim"
                    role="presentation"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setCatalogOpen(false);
                    }}
                >
                    <CatalogLite
                        query={catalogQuery}
                        onQueryChange={setCatalogQuery}
                        onClose={() => setCatalogOpen(false)}
                        onPick={(type) => {
                            setCatalogOpen(false);
                            if (PANELS[type] || SHELL_PANELS.has(type)) setPanelType(type);
                            else apply(type, {}, { source: "form" });
                        }}
                    />
                </div>
            )}
        </div>
    );
}
