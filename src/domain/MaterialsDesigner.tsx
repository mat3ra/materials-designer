/**
 * MD 2.0 shell.
 *
 * Every mutation in this component goes through `session.apply(...)`, which
 * appends one operation to the active material's log. That single write path is
 * the whole point: the Timeline, the undo stack, autosave and (later) the
 * assistant all read the same record, so no surface can hold private history.
 */
import CoveThemeProvider from "@mat3ra/cove/dist/theme/provider/ThemeProvider";
import type Material from "@mat3ra/made/dist/js/Material";
import { createTheme } from "@mui/material/styles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { exportMaterials, readFiles } from "../core/io";
import { replay, resolve } from "../core/replay";
import { applySetOperation, createMaterialDoc, editOperation } from "../core/session";
import { useSession } from "../core/useSession";
import { toMuiTheme } from "../kit/theme/tokens";
import { resolveCommands, useCommandShortcuts } from "../shell/commands";
import { AppMenu } from "./AppMenu";
import { CombinatorialPanel } from "./CombinatorialPanel";
import { type CommandContext, type RegionName, COMMANDS } from "./commands";
import { ConsoleDock } from "./ConsoleDock";
import { Inspector } from "./Inspector";
import { toMDState } from "./mdState";
import { Navigator } from "./Navigator";
import { CatalogLite, PANELS } from "./panels";
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
    const [menuOpen, setMenuOpen] = useState(false);
    const [dragging, setDragging] = useState(false);
    /** Nested dragenter/dragleave pairs; the overlay hides only at zero. */
    const dragDepth = useRef(0);
    const [panelType, setPanelType] = useState<string | null>(null);
    /** Set while re-editing a step already in the timeline. */
    const [editingStep, setEditingStep] = useState<number | null>(null);
    /** Which regions are visible. The command registry refuses to hide the last one. */
    const [regions, setRegions] = useState<Record<RegionName, boolean>>({
        navigator: true,
        viewport: true,
        timeline: true,
        inspector: true,
        console: true,
    });
    /** Material whose name is being edited inline in the Navigator. */
    const [renamingId, setRenamingId] = useState<string | null>(null);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    // Shell chrome reads the CSS tokens directly; cove/MUI components read this
    // theme. Both are generated from src/kit/theme/tokens.ts, so a component
    // dropped in from cove lands in Mat3rial D3sign rather than cove's violet.
    const muiTheme = useMemo(() => createTheme(toMuiTheme(theme)), [theme]);

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

    /**
     * Import: each file becomes a material whose origin step holds the payload,
     * so provenance starts at "where it came from". Format detection is
     * made.js's, so the accepted set is exactly v1's (JSON and POSCAR).
     */
    const importFiles = useCallback(
        async (files: FileList | File[]) => {
            try {
                const read = await readFiles(files);
                const docs = read.map((file) =>
                    createMaterialDoc("import-file", {
                        content: file.content,
                        name: file.name.replace(/\.[^.]+$/, ""),
                    }),
                );
                session.add(docs);
                setNotice(`Imported ${docs.length} material${docs.length === 1 ? "" : "s"}.`);
            } catch (e) {
                setNotice(
                    `Import failed: ${
                        e instanceof Error ? e.message : String(e)
                    }. Supported formats are JSON and POSCAR.`,
                );
            }
        },
        [session],
    );

    const pickFiles = useCallback(() => {
        const input = document.createElement("input");
        input.type = "file";
        input.multiple = true;
        input.accept = ".json,.poscar,.vasp,.txt,application/json,text/plain";
        input.onchange = () => {
            if (input.files?.length) {
                importFiles(input.files).catch(() => setNotice("Import failed."));
            }
        };
        input.click();
    }, [importFiles]);

    const handleExport = useCallback(
        (format: "json" | "poscar", all: boolean) => {
            const docs = all ? session.state.materials : [session.activeDoc];
            exportMaterials(
                docs.map((doc) => {
                    const { material } = resolve(doc);
                    return { material, name: material.name ?? "material" };
                }),
                format,
            );
            setMenuOpen(false);
        },
        [session.state.materials, session.activeDoc],
    );

    // One registry behind every trigger: the bar's buttons, the palette, the keyboard and the
    // Cypress suite all address the same ids, so rearranging the UI does not disturb any of them.
    const commandContext = useMemo<CommandContext>(
        () => ({
            session,
            regions,
            // Standalone has no host; each file-level command self-disables, exactly as v1's
            // menu items did when the platform did not inject them.
            host: {},
            ui: {
                openPanel: setPanelType,
                openCatalog: () => setCatalogOpen(true),
                openPalette: () => setCatalogOpen(true),
                pickFiles,
                exportActive: (format) => handleExport(format, false),
                exportAll: () => handleExport("json", true),
                toggleRegion: (region) =>
                    setRegions((current) => ({ ...current, [region]: !current[region] })),
                toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
                startRename: setRenamingId,
            },
        }),
        [session, regions, pickFiles, handleExport],
    );

    const commands = useMemo(() => resolveCommands(COMMANDS, commandContext), [commandContext]);

    // Shortcuts are off while a panel or overlay owns the keyboard.
    useCommandShortcuts(commands, !catalogOpen && panelType === null);

    // v1 published its reducer state here and the Cypress suite reads it; 2.0 publishes the same
    // shape, derived from the log rather than stored alongside it.
    useEffect(() => {
        (window as unknown as { MDState: unknown }).MDState = toMDState(session.state);
    }, [session.state]);

    const panel = panelType ? PANELS[panelType] : undefined;
    const PanelComponent = panel?.Component;

    /**
     * An edit is configured against the state the step originally ran on.
     * Memoised: replay() is uncached, and a fresh object identity on every
     * render resets panels that re-initialise when the material changes.
     */
    const editBaseMaterial = useMemo(
        () => (editingStep === null ? null : replay(session.activeDoc.log, editingStep)),
        [editingStep, session.activeDoc.log],
    );

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
                        material={editBaseMaterial ?? session.active.material}
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
                onApplyCoalescing={(type, params) => session.applyCoalescing(type, params)}
                theme={theme}
            />
        );
    }

    return (
        <CoveThemeProvider theme={muiTheme}>
            <div
                // Both hooks are part of the published test contract: MD's own Page selects the
                // id, web-app's widget subclass selects the class.
                id="materials-designer"
                className="md2-app materials-designer"
                onDragOver={(event) => {
                    if (!event.dataTransfer.types.includes("Files")) return;
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={(event) => {
                    // Track depth rather than trusting the target: the overlay
                    // itself becomes the event target the moment it appears, so a
                    // drag that leaves the window without dropping would otherwise
                    // leave the overlay up forever, blocking the whole app.
                    dragDepth.current = Math.max(0, dragDepth.current - 1);
                    if (dragDepth.current === 0) setDragging(false);
                }}
                onDragEnter={(event) => {
                    if (event.dataTransfer.types.includes("Files")) dragDepth.current += 1;
                }}
                onDrop={(event) => {
                    dragDepth.current = 0;
                    setDragging(false);
                    // Only claim file drops; text dropped into a field is the
                    // browser's to handle.
                    if (!event.dataTransfer.files?.length) return;
                    event.preventDefault();
                    importFiles(event.dataTransfer.files).catch(() => setNotice("Import failed."));
                }}
            >
                <WorkspaceBar
                    sessionName={session.sessionName}
                    onRename={session.setSessionName}
                    savedAt={session.savedAt}
                    commands={commands}
                    onOpenCatalog={() => setCatalogOpen(true)}
                    onOpenMenu={() => setMenuOpen((open) => !open)}
                    theme={theme}
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
                {menuOpen && (
                    <AppMenu
                        anchorSelector='[data-testid="app-menu-button"]'
                        materialCount={session.state.materials.length}
                        onImport={() => {
                            setMenuOpen(false);
                            pickFiles();
                        }}
                        onExport={handleExport}
                        onClose={() => setMenuOpen(false)}
                    />
                )}
                {dragging && (
                    <div className="md2-dropzone" data-testid="dropzone" aria-hidden="true">
                        Drop JSON or POSCAR files to import
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
                    <div
                        className={`md2-region${regions.navigator ? "" : " md2-region-hidden"}`}
                        data-region="navigator"
                    >
                        <Navigator
                            state={session.state}
                            onSelect={session.select}
                            onRemove={session.remove}
                            onFork={(id) => session.fork(id)}
                            onNew={() => session.add([createMaterialDoc("create-default", {})])}
                            onRename={(id, name) =>
                                session.apply("rename", { name }, { materialId: id })
                            }
                            onImportStandata={() => setPanelType("standard-library")}
                            onImportFile={pickFiles}
                            renamingId={renamingId}
                            onRenamingIdChange={setRenamingId}
                        />
                    </div>

                    <div
                        className={`md2-center md2-region${
                            regions.viewport ? "" : " md2-region-hidden"
                        }`}
                        data-region="viewport"
                    >
                        <Viewport
                            material={session.active.material}
                            onEdit={handleCanvasEdit}
                            onSelectionChanged={session.selectSites}
                        />
                        <div
                            className={`md2-region-v${regions.console ? "" : " md2-region-hidden"}`}
                            data-region="console"
                        >
                            <ConsoleDock
                                doc={session.activeDoc}
                                materialName={session.active.material.name ?? "material"}
                            />
                        </div>
                    </div>

                    <div
                        className={`md2-region${regions.timeline ? "" : " md2-region-hidden"}`}
                        data-region="timeline"
                    >
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
                    </div>

                    <div
                        className={`md2-region${regions.inspector ? "" : " md2-region-hidden"}`}
                        data-region="inspector"
                    >
                        {renderRightPane()}
                    </div>
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
                                if (type === "import-file") pickFiles();
                                else if (PANELS[type] || SHELL_PANELS.has(type)) setPanelType(type);
                                else apply(type, {}, { source: "form" });
                            }}
                        />
                    </div>
                )}
            </div>
        </CoveThemeProvider>
    );
}
