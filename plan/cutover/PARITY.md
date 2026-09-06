# Parity ledger — v1 → MD 2.0

The cutover flips when every row here is **done** or **deferred with an owner**. Not on a date.

Seeded from PROPOSAL §12, which says what each v1 capability's 2.0 home is; this file adds what
that document deliberately left out — whether the thing exists yet, and which test proves it.

Status: **done** · **partial** (something is there, but a v1 user would notice the difference) ·
**absent** · **deferred** (agreed not to do now; names an owner).

The covering test is the contract. A row is not done because the code looks right; it is done when
a named spec passes. Specs tagged `@parity_2_0` are harvested from PR #299 and run with
`TAGS='@parity_2_0'` — drop the tag from a feature when its row lands.

## Platform contract — never descoped

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Import via host modal (`openImportModal`) | `file.import` command, host-injected, self-disabling | **done** — adapter in `src/embed` | `menu/input-output/add-remove-import-files`; embed unit tests |
| Save / Exit (`openSaveActionDialog`, `onExit`) | `file.save` (⌘S) / `file.exit`; save is handed `toMDState(session)` | **done** | web-app's own suite (gate 2); embed unit tests |
| `initialMaterials` → step-0 origins | `toMaterialDoc()` — one origin op each, `externalId` preserved | **done** | embed unit tests |
| `window.MDState` shape | derived in an effect; a material that cannot serialise is skipped rather than crashing the app | **done** | drives most `@parity_2_0` specs |
| `isConventionalCellShown`, `initialViewSettings`, `maxCombinatorialBasesCount` | cap is wired; the two viewport props are accepted and **inert**, pending wave.js taking them as controlled props | **partial** — deliberately, and documented at the type | web-app's own suite (gate 2) |
| Upload from disk (POSCAR/JSON) | Catalog › From file + global drag-and-drop | **done** | `menu/input-output/add-remove-import-files` |
| Import from Standata (74 configs) | Catalog › Create › Standard library | **done** | `menu/input-output/import-from-standata` |
| Export JSON / POSCAR / all | ☰ › Export | **done** | md2 smoke (to port) |

## Operations

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Supercell (3×3, det≠0) | Catalog › Build › Supercell panel | **done** | `menu/advanced/supercell` |
| Surface / slab (hkl, layers, vacuum) | Catalog › Build › Surface panel | **done** | `menu/advanced/surface` |
| Boundary conditions (pbc/bc1–3 + offset) | Inspector › Structure | **done** | `menu/advanced/boundary_conditions` |
| Combinatorial set (XYZ syntax, cap, naming) | Catalog › Sets › Combinatorial → set folder | **done** | md2 smoke (to port) |
| **Interpolated set / NEB** | Catalog › Sets › NEB, **both** endpoints picked in-panel | **done** — images are set children with their own origins; the forecast is the interpolation actually run, so an impossible pair is explained before Apply rather than throwing after it | smoke (both paths) |
| Use conventional cell | Inspector › Structure › Cell, recorded as an op | **partial** — op registered, Inspector references it; needs a control and a test | *(needs one)* |
| Toggle isNonPeriodic + saved-material guard | Inspector › Structure › Periodicity, guard → disabled-with-reason | **partial** — op registered; guard not implemented | *(needs one)* |
| Clone | Navigator fork (fork-origin chip) | **done** | `menu/edit/reset-clone-undo-redo` |
| Undo / Redo — one stack | Timeline steps + ⌘Z everywhere | **done** | `menu/edit/reset-clone-undo-redo`, `toolbar/quick-actions` @parity_2_0 |
| Reset | Timeline › revert to step 0 | **done** | `menu/edit/reset-clone-undo-redo` |
| Delete material (undoable) | Navigator row action | **done** | `3d-editor/delete-material`, `materials-list/filter-and-count` @parity_2_0 |
| Rename material | Navigator inline rename | **done** — double-click a name, or the `material.rename` command; a no-op rename records nothing | `materials-list/filter-and-count` @parity_2_0, smoke |

## Editing surfaces

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Lattice form (type/a/b/c/α/β/γ, units, scale-vs-preserve) | Inspector › Structure › Edit lattice | **done** — disclosed form, staged edits, preserve-vs-scale kept | `materials-list/*` @parity_2_0 (drives it via the create path) |
| Basis XYZ text (constraints, validation, crystal/cartesian) | Basis table + text view on `#basis-xyz` | **done** — both views write one `set-basis` op; constraints appear only when something is constrained | `source-editor/basis-table` @parity_2_0 (4/4) |
| Upload review grid | Import-review panel | **absent** | `menu/input-output/add-remove-import-files` |
| Materials list: filter, count, empty state | Navigator filter + count | **done** | `materials-list/filter-and-count` @parity_2_0 |
| Modified / updated marker | Navigator dot, revert-aware | **done** — content comparison against the material as it entered the session; materials derived in-session stay marked | `materials-list/updated-marker` @parity_2_0, 6 unit tests |
| Status bar (v1 footer was empty) | Status Bar segments | **done** — `#materials-designer-status-bar` with `.status-material` and `.status-position` groups; clone grows the list without moving the position | `status-bar/status-bar` @parity_2_0, smoke |
| Command palette | ⌘K over actions, session materials and Standata | **done** — library searched only once a query is typed | `toolbar/command-palette` @parity_2_0 (4/4) |
| Quick actions row | Workspace Bar | **done** — undo/redo/clone/Standata as `.quick-action-<key>`, plus the panel toggles, all from the registry with disabled-with-reason | `toolbar/quick-actions`, `toolbar/control-availability` @parity_2_0, smoke |
| Keyboard shortcuts + control availability | command registry + disabled-with-reason | **done** | `toolbar/keyboard-shortcuts` (3/3), `toolbar/control-availability` (3/3) @parity_2_0 |
| Shift+U/D cycling (broken while typing) | `[` / `]` with field-focus guards | **done** | `toolbar/keyboard-shortcuts` @parity_2_0 |
| View menu panel toggles | Workspace Bar toggles (`.panel-toggle-<region>`) | **done** — five regions collapse to zero width while staying mounted; the last visible one refuses to hide | `toolbar/quick-actions`, `toolbar/control-availability` @parity_2_0, smoke |

## Code surfaces

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| JupyterLite Transformation (`materials_in`/`materials_out`) | Console › Notebook, same bridge | **done** — same wrapper id, `data-tid`s and iframe id, so `JupyterLiteTransformationDialogWidget` and `JupyterLiteSession` drive it unchanged; only the step that *opens* it moved to `console.notebook`. Results land as `notebook-result` origins under the input they came from | the 53 `@notebook_healthcheck` features; 12 unit tests; 9 smoke checks |
| JupyterLite session drawer | Console › Notebook | **done** — one surface instead of a drawer plus a modal | `I see JupyterLite session` (web-app) |
| Python REPL | Console › REPL — cove `PythonRepl` over `InPageTransport` | **absent** — the tab exists and says so; `kit/BridgedIframe` and `domain/console/payload.ts` are the halves it will reuse | *(needs one)* |
| History as script | Console › Script (`logAsPython`) | **done** | md2 smoke (to port) |
| Orphaned in-page Pyodide dialog | retired | **done** (not carried over) | — |

## Viewport (wave.js)

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Selection, gizmos, add/clone/delete atoms | Viewport canvas | **done** | `3d-editor/*`, md2 smoke selection sync |
| Bonds / labels / repetitions / camera | Viewport Toolbar + Inspector › Display | **partial** — wave owns this chrome until the theming/chrome asks land | — |
| Measurements (distance/angle/copy coords) | Measure tool + Selection readouts | **absent** | *(needs one)* |
| Screenshot / figure / GIF | Viewport Toolbar › Snapshot | **absent** | *(needs one)* |
| Keyboard sheet | app-owned `?` overlay | **absent** | *(needs one)* |
| Multi-material 3D combine (removed with wave's Outliner) | Combine v2 as a 2-input Catalog card | **deferred** — owner: post-cutover, per PROPOSAL ⟲ | — |
| Fullscreen (broken in v1) | replaced by costumes | **done** | — |

## Still open

- The published `src/exports.js` still points `MaterialsDesignerContainer` at v1. It switches at the
  flip; until then the 2.0 adapter is reachable at `dist/embed/MaterialsDesignerContainer` for
  anyone who wants to try the embedded costume.
- Import-review panel and Console › REPL.

## Descope order if Phase 2 slips

Cut from the bottom, and record the deferral with an owner here:
Catalog depth for notebook workflows → Console › REPL → set/combinatorial panel polish →
interpolated-set (fall back to porting the v1 dialog verbatim behind a command ID).

**Never cut**: anything in *Platform contract*, the lattice form, the basis editor, or any
step-definition retarget. Those are what other repositories depend on.
