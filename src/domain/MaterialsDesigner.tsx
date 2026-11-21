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

import { exportMaterials, readFiles, toImportableConfig } from "../core/io";
import { replay, resolve } from "../core/replay";
import { applySetOperation, createMaterialDoc, editOperation } from "../core/session";
import type { MaterialDoc } from "../core/types";
import { useSession } from "../core/useSession";
import { CommandPalette } from "../kit/command/CommandPalette";
import { toMuiTheme } from "../kit/theme/tokens";
import { resolveCommands, useCommandShortcuts } from "../shell/commands";
import { AppMenu } from "./AppMenu";
import { CombinatorialPanel } from "./CombinatorialPanel";
import { type CommandContext, type HostActions, type RegionName, COMMANDS } from "./commands";
import { type ConsoleTab, BRIDGED_TABS, ConsoleDock, TALL_TABS } from "./console/ConsoleDock";
import type { CodeSurface, NotebookInput, NotebookOutput } from "./console/NotebookTab";
import { ImportReview } from "./ImportReview";
import { Inspector } from "./Inspector";
import { toMDState } from "./mdState";
import { Navigator } from "./Navigator";
import { buildPaletteItems } from "./paletteSources";
import { CatalogLite, PANELS } from "./panels";
import { InterpolatedSetPanel } from "./panels/InterpolatedSetPanel";
import { loadStandata, StandataPanel } from "./StandataPanel";
import { StatusBar } from "./StatusBar";
import { Timeline } from "./Timeline";
import { Viewport } from "./Viewport";
import { WorkspaceBar } from "./WorkspaceBar";

type Theme = "dark" | "light";

/** Operations whose panel lives in the shell rather than the parameter kit. */
const STANDATA = loadStandata();

/**
 * Below this, there is not room for the viewport and more than one side panel at once.
 * Expanding one rails the others rather than letting the 3D view be squeezed to nothing.
 */
const NARROW_WIDTH = 1000;

/** The three regions that flank the centre column, and so compete for its width. */
const SIDE_REGIONS: RegionName[] = ["navigator", "timeline", "inspector"];

/** Read once at mount. Guarded for the non-DOM environments the kernel tests run in. */
function initialWidth(): number {
    return typeof window === "undefined" ? 1600 : window.innerWidth;
}

const SHELL_PANELS = new Set([
    "standard-library",
    "combinatorial-set",
    "interpolated-set",
    "import-review",
]);

/** Apply-button wording: an edit says how much history it will re-run. */
function editApplyLabel(editing: boolean, downstream: number): string | undefined {
    if (!editing) return undefined;
    if (!downstream) return "Apply";
    return `Apply & replay ${downstream} step${downstream === 1 ? "" : "s"}`;
}

/** Steps whose parameters can be re-opened and replayed. */
const EDITABLE_TYPES = new Set(Object.keys(PANELS));

/* eslint-disable react/no-unused-prop-types */
export interface MaterialsDesignerProps {
    /** Seeds the session; the platform's materials arrive as step-0 origins. */
    initialDocs?: MaterialDoc[];
    isLoading?: boolean;
    isConventionalCellShown?: boolean;
    maxCombinatorialBasesCount?: number;
    /** File-level actions the platform injects; each command self-disables when absent. */
    host?: HostActions;
    persistence?: "local" | "none";
}

export function MaterialsDesigner({
    initialDocs,
    isLoading = false,
    maxCombinatorialBasesCount,
    host = {},
    persistence = "local",
}: MaterialsDesignerProps = {}) {
    const session = useSession({ initialDocs, persistence });
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

    /**
     * Closing a panel always forgets what it was editing.
     *
     * These two pieces of state are one idea, and separating them means the next panel opened from
     * any source is treated as an in-place edit of a step it has nothing to do with.
     */
    const closePanel = useCallback(() => {
        setPanelType(null);
        setEditingStep(null);
    }, []);
    /** Which regions are visible. The command registry refuses to hide the last one. */
    const [regions, setRegions] = useState<Record<RegionName, boolean>>({
        navigator: true,
        viewport: true,
        timeline: true,
        inspector: true,
        console: true,
    });
    /**
     * Which side regions are railed down to their glyph.
     *
     * Distinct from hidden, and both are worth having: collapsed means "I want the space back but
     * keep this reachable", hidden means "I do not need this panel". A collapsed region is still on
     * screen, which is why collapsing every one of them is allowed where hiding every one is not.
     *
     * Seeded from the window: 804px of side chrome (252 + 236 + 316) leaves a laptop nothing for
     * the 3D view. Measured once at mount rather than on every resize — a panel that re-collapses
     * itself while you are dragging the window is worse than one that simply started sensibly.
     */
    const [collapsed, setCollapsed] = useState<Record<RegionName, boolean>>(() => ({
        navigator: false,
        viewport: false,
        timeline: initialWidth() < 1400,
        inspector: initialWidth() < 1150,
        console: false,
    }));
    /** Which console tab is forward, and whether the dock is showing its body. */
    const [consoleTab, setConsoleTab] = useState<ConsoleTab>("script");
    const [consoleOpen, setConsoleOpen] = useState(false);
    /**
     * The layout the console was maximised over, or null when it is not.
     *
     * Maximising is a preset of the two states above, not a move in the tree: relocating the
     * console would remount its iframe and take a running kernel with it. So the dock stays
     * exactly where it is and everything around it collapses, which is also why restoring is
     * simply putting this snapshot back.
     */
    const [maximised, setMaximised] = useState<{
        regions: Record<RegionName, boolean>;
        collapsed: Record<RegionName, boolean>;
    } | null>(null);

    /**
     * Leave maximised, restoring the layout it covered.
     *
     * Every region control calls this first. Without it the workspace bar could un-hide the
     * viewport underneath a console that still calls itself maximised, and the two states would
     * drift apart with no way for the user to tell which was real.
     */
    const exitMaximised = useCallback(() => {
        setMaximised((snapshot) => {
            if (snapshot) {
                setRegions(snapshot.regions);
                setCollapsed(snapshot.collapsed);
            }
            return null;
        });
    }, []);
    /** Material whose name is being edited inline in the Navigator. */
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [paletteQuery, setPaletteQuery] = useState("");

    /**
     * The theme goes on the app's own root. It also goes on the document, but only when we own
     * the page: `persistence: "none"` is the embedded costume, and setting an attribute on a
     * host's `<html>` is exactly the kind of reaching-out that makes a component unwelcome.
     */
    const embedded = persistence === "none";
    useEffect(() => {
        if (!embedded) document.documentElement.setAttribute("data-theme", theme);
    }, [theme, embedded]);

    // Shell chrome reads the CSS tokens directly; cove/MUI components read this
    // theme. Both are generated from src/kit/theme/tokens.ts, so a component
    // dropped in from cove lands in Mat3rial D3sign rather than cove's violet.
    const muiTheme = useMemo(() => createTheme(toMuiTheme(theme)), [theme]);

    // Escape closes whatever overlay is open. The palette chord is not bound here: it belongs to
    // the command registry with every other shortcut, and binding it in both places opened the
    // Catalog on top of the palette.
    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setCatalogOpen(false);
                setPaletteOpen(false);
                closePanel();
                // Clearing the panel without clearing what it was editing leaves the next panel —
                // from any source — treated as an in-place edit of a step it has nothing to do
                // with, rewriting it with the wrong parameters.
                setEditingStep(null);
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
            closePanel();
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
            closePanel();
        },
        [editingStep, session],
    );

    /**
     * Import: each file becomes a material whose origin step holds the payload,
     * so provenance starts at "where it came from". Format detection is
     * made.js's, so the accepted set is exactly v1's (JSON and POSCAR).
     */
    const addImported = useCallback(
        (read: { name: string; content: string }[]) => {
            const docs: MaterialDoc[] = [];
            const failed: string[] = [];

            // One unreadable file must not cost the user the others. Each is turned into a
            // document on its own, and the failures are reported alongside what did come in.
            read.forEach(({ name, content }) => {
                try {
                    docs.push(createMaterialDoc("import-file", { name, content }));
                } catch {
                    failed.push(name);
                }
            });

            if (docs.length) session.add(docs);

            const imported = docs.length
                ? `Imported ${docs.length} material${docs.length === 1 ? "" : "s"}.`
                : "";
            const skipped = failed.length
                ? `${failed.length === read.length ? "" : " "}Could not read ${failed.join(
                      ", ",
                  )} — supported formats are JSON and POSCAR.`
                : "";
            setNotice(`${imported}${skipped}`.trim() || null);
        },
        [session],
    );

    /** Drag-and-drop onto the app: no review step, because the drop *is* the decision. */
    const importFiles = useCallback(
        async (files: FileList | File[]) => addImported(await readFiles(files)),
        [addImported],
    );

    /**
     * Bring a standard-library entry in.
     *
     * Both the panel and the palette land here rather than each building the document themselves,
     * so a config the schema will not accept fails the same way from either — as a notice naming
     * the entry, instead of an exception in a click handler.
     */
    const importStandata = useCallback(
        (entry: { name: string; config: Record<string, unknown> }) => {
            try {
                session.add([
                    createMaterialDoc("create-from-config", {
                        config: toImportableConfig(entry.config),
                        source: `${entry.name} (standard library)`,
                    }),
                ]);
            } catch {
                setNotice(`Could not import ${entry.name} — the library entry is not a structure.`);
            }
        },
        [session],
    );

    /**
     * `materials_in` for the code surfaces — the notebook and the REPL.
     *
     * Built only while one of them is showing: every material has to be replayed and serialised,
     * and doing that on every session change to feed a hidden surface is work nobody asked for.
     * (Gating this on the notebook alone is what left the REPL's picker empty.)
     */
    const bridgeOpen = consoleOpen && BRIDGED_TABS.includes(consoleTab);
    const notebookInputs = useMemo<NotebookInput[]>(() => {
        if (!bridgeOpen) return [];
        return session.state.materials.flatMap((doc) => {
            try {
                const { material } = resolve(doc);
                return [
                    {
                        id: doc.id,
                        name: material.name ?? "material",
                        config: material.toJSON() as unknown as Record<string, unknown>,
                    },
                ];
            } catch {
                // A material that cannot be serialised cannot be sent to a kernel either; leaving
                // it out of the picker is better than offering something that will fail on use.
                return [];
            }
        });
    }, [bridgeOpen, session.state]);

    /**
     * Adopting what a notebook or the REPL produced.
     *
     * Each output becomes its own material whose origin step records which surface made it and
     * from what — so the Timeline chip reads as notebook or REPL work rather than as an anonymous
     * import that appeared from nowhere. It lands as a row of its own: a code result is not a fork.
     */
    const handleNotebookOutputs = useCallback(
        (outputs: NotebookOutput[], inputs: NotebookInput[], from: CodeSurface) => {
            const docs: MaterialDoc[] = [];
            const failed: string[] = [];
            outputs.forEach((output) => {
                try {
                    docs.push(
                        createMaterialDoc(
                            // Named by the surface that ran the code, so the chip says which.
                            from.surface === "repl" ? "repl-result" : "notebook-result",
                            { config: output.config, inputs: inputs.map((one) => one.name) },
                            {
                                source: "code",
                                // No parentId: that is fork lineage, and a code result is not a
                                // fork. Which materials went in is in the params, where replay
                                // can see it and the chip prints it — so the row sits at the top
                                // level, as one with two inputs, or none, already did.
                                // Only the notebook has a file to record; the REPL is a
                                // prompt, and a sentinel in place of a path is a fake one.
                                provenance:
                                    from.surface === "notebook"
                                        ? { entryPath: from.entryPath }
                                        : undefined,
                            },
                        ),
                    );
                } catch {
                    failed.push(output.name);
                }
            });
            if (docs.length) session.add(docs);
            const fromRepl = from.surface === "repl";
            // v1 closed its dialog on submit, and the notebook keeps that: the materials just
            // landed in the Navigator, and re-opening it is what starts a fresh session.
            //
            // The REPL is the opposite. Closing unmounts the frame, and the frame is the kernel —
            // the imports, the variables, the packages the user waited to install. Adopting a
            // result is not a reason to throw the session away, so the dock stays open.
            if (!fromRepl) setConsoleOpen(false);
            const surface = fromRepl ? "the REPL" : "the notebook";
            const added = docs.length
                ? `Added ${docs.length} material${docs.length === 1 ? "" : "s"} from ${surface}.`
                : "";
            const skipped = failed.length ? ` Could not read ${failed.join(", ")}.` : "";
            setNotice(`${added}${skipped}`.trim() || null);
        },
        [session],
    );

    /**
     * Uploading from disk opens the review rather than the file picker.
     *
     * v1 did the same, and the reason survives the redesign: a file's format is detected, not
     * declared, so the list of what was understood is worth seeing before any of it becomes a
     * material. The picker is one click further in, behind the drop zone.
     */
    const pickFiles = useCallback(() => setPanelType("import-review"), []);

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
            // Standalone has no host, so each file-level command self-disables — exactly as v1's
            // menu items did when the platform did not inject them.
            host,
            ui: {
                openPanel: setPanelType,
                openCatalog: () => setCatalogOpen(true),
                openPalette: () => setPaletteOpen(true),
                pickFiles,
                exportActive: (format) => handleExport(format, false),
                exportAll: () => handleExport("json", true),
                toggleRegion: (region) => {
                    // Hide/show is a different intent from expand: the bar's toggle means "I do
                    // not need this panel", so restoring plainly and then applying it is right.
                    exitMaximised();
                    setRegions((current) => ({ ...current, [region]: !current[region] }));
                },
                toggleCollapsed: (region) => {
                    // Maximised, every side region is a rail, and a rail reads as "expand me".
                    // Restoring and then toggling would flip it straight back to collapsed, so the
                    // click would look like it did nothing. Honour the affordance instead: leave
                    // maximised and open the region that was clicked.
                    if (maximised) {
                        setRegions(maximised.regions);
                        setCollapsed({ ...maximised.collapsed, [region]: false });
                        setMaximised(null);
                        return;
                    }
                    setCollapsed((current) => {
                        const next = { ...current, [region]: !current[region] };
                        // Narrow: one side panel at a time. Expanding rails the others, so the
                        // viewport always keeps its room. The rule lives here rather than in a
                        // media query because a spec can only assert what the app decides.
                        if (!next[region] && window.innerWidth < NARROW_WIDTH) {
                            SIDE_REGIONS.filter((other) => other !== region).forEach((other) => {
                                next[other] = true;
                            });
                        }
                        return next;
                    });
                },
                toggleConsoleMaximised: () =>
                    setMaximised((snapshot) => {
                        if (snapshot) {
                            setRegions(snapshot.regions);
                            setCollapsed(snapshot.collapsed);
                            return null;
                        }
                        // Everything but the console gets out of the way. The dock does not move,
                        // so whatever is running inside it keeps running.
                        setRegions((current) => ({ ...current, viewport: false, console: true }));
                        setCollapsed((current) => ({
                            ...current,
                            navigator: true,
                            timeline: true,
                            inspector: true,
                        }));
                        setConsoleOpen(true);
                        return { regions, collapsed };
                    }),
                openConsole: (tab) => {
                    setConsoleTab(tab);
                    setConsoleOpen(true);
                    // Asking for a console tab while the console is hidden should show it, not
                    // silently succeed against something nobody can see.
                    setRegions((current) => ({ ...current, console: true }));
                },
                toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
                startRename: setRenamingId,
            },
        }),
        [session, regions, collapsed, maximised, exitMaximised, host, pickFiles, handleExport],
    );

    const commands = useMemo(() => resolveCommands(COMMANDS, commandContext), [commandContext]);

    // Shortcuts are off while a panel or overlay owns the keyboard.
    useCommandShortcuts(commands, !catalogOpen && !paletteOpen && panelType === null);

    // v1 published its reducer state here and the Cypress suite reads it; 2.0 publishes the same
    // shape, derived from the log rather than stored alongside it.
    useEffect(() => {
        (window as unknown as { MDState: unknown }).MDState = toMDState(session.state, isLoading);
    }, [session.state, isLoading]);

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
                        importStandata(entry);
                        closePanel();
                    }}
                />
            );
        }
        if (panelType === "combinatorial-set") {
            return (
                <CombinatorialPanel
                    material={session.active.material}
                    maxMaterials={maxCombinatorialBasesCount}
                    onCancel={() => setPanelType(null)}
                    onApply={(configs, xyz) => {
                        session.run((state) =>
                            applySetOperation(state, "combinatorial-set", { xyz }, configs, {
                                setLabel: "Combinatorial set",
                            }),
                        );
                        closePanel();
                    }}
                />
            );
        }
        if (panelType === "interpolated-set") {
            return (
                <InterpolatedSetPanel
                    material={session.active.material}
                    digest={session.active.digest}
                    docs={session.state.materials}
                    activeId={session.activeDoc.id}
                    onCancel={() => setPanelType(null)}
                    onApply={(params, children) => {
                        session.run((state) =>
                            applySetOperation(state, "interpolated-set", params, children, {
                                setLabel: "Interpolated set",
                            }),
                        );
                        closePanel();
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
                            closePanel();
                            setEditingStep(null);
                        }}
                    />
                </div>
            );
        }
        return (
            <Inspector
                collapsed={collapsed.inspector}
                onToggleCollapsed={() => commandContext.ui.toggleCollapsed("inspector")}
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
                data-theme={theme}
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
                        className={`md2-region${
                            collapsed.navigator ? " md2-region-collapsed" : ""
                        }${regions.navigator ? "" : " md2-region-hidden"}`}
                        data-region="navigator"
                        data-collapsed={collapsed.navigator ? "true" : "false"}
                    >
                        <Navigator
                            collapsed={collapsed.navigator}
                            onToggleCollapsed={() => commandContext.ui.toggleCollapsed("navigator")}
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

                    {/* Two independent regions share the centre column: hiding the 3D view must
                        not take the Console with it, which nesting them would. */}
                    <div className="md2-center">
                        <div
                            className={`md2-region-v md2-center-fill${
                                regions.viewport ? "" : " md2-region-hidden"
                            }`}
                            data-region="viewport"
                        >
                            <Viewport
                                material={session.active.material}
                                onEdit={handleCanvasEdit}
                                onSelectionChanged={session.selectSites}
                            />
                        </div>
                        <div
                            className={`md2-region-v${
                                consoleOpen && TALL_TABS.includes(consoleTab)
                                    ? " md2-console-region-tall"
                                    : ""
                            }${regions.console ? "" : " md2-region-hidden"}`}
                            data-region="console"
                        >
                            <ConsoleDock
                                doc={session.activeDoc}
                                materialName={session.active.material.name ?? "material"}
                                tab={consoleTab}
                                open={consoleOpen}
                                onTabChange={setConsoleTab}
                                onOpenChange={setConsoleOpen}
                                notebookInputs={notebookInputs}
                                activeMaterialId={session.activeDoc.id}
                                onAddFromNotebook={handleNotebookOutputs}
                                onError={setNotice}
                                maximised={maximised !== null}
                                onToggleMaximised={commandContext.ui.toggleConsoleMaximised}
                            />
                        </div>
                    </div>

                    <div
                        className={`md2-region${collapsed.timeline ? " md2-region-collapsed" : ""}${
                            regions.timeline ? "" : " md2-region-hidden"
                        }`}
                        data-region="timeline"
                        data-collapsed={collapsed.timeline ? "true" : "false"}
                    >
                        <Timeline
                            collapsed={collapsed.timeline}
                            onToggleCollapsed={() => commandContext.ui.toggleCollapsed("timeline")}
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
                        className={`md2-region${
                            collapsed.inspector ? " md2-region-collapsed" : ""
                        }${regions.inspector ? "" : " md2-region-hidden"}`}
                        data-region="inspector"
                        data-collapsed={collapsed.inspector ? "true" : "false"}
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

                {paletteOpen && (
                    <div
                        className="md2-scrim"
                        role="presentation"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setPaletteOpen(false);
                        }}
                    >
                        <CommandPalette
                            open
                            query={paletteQuery}
                            onQueryChange={setPaletteQuery}
                            placeholder="Search commands, materials and the standard library…"
                            items={buildPaletteItems(paletteQuery, {
                                commands,
                                materials: session.state.materials,
                                standata: STANDATA,
                                onSelectMaterial: session.select,
                                onImportStandata: importStandata,
                            })}
                            onClose={() => {
                                setPaletteOpen(false);
                                setPaletteQuery("");
                            }}
                        />
                    </div>
                )}

                {/* Not in the panel zone: the review is a table of four columns, and the zone is
                    three hundred pixels wide and belongs to the material behind it. */}
                {panelType === "import-review" && (
                    <div
                        className="md2-scrim"
                        role="presentation"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) closePanel();
                        }}
                    >
                        <ImportReview
                            onClose={closePanel}
                            onSubmit={(staged) => {
                                closePanel();
                                addImported(
                                    staged.map(({ fileName, text }) => ({
                                        name: fileName,
                                        content: text,
                                    })),
                                );
                            }}
                        />
                    </div>
                )}

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
                            materialCount={session.state.materials.length}
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
