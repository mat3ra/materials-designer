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
| Import via host modal (`openImportModal`) | ☰ + palette, host-injected, self-disabling | **absent** | `menu/input-output/add-remove-import-files` |
| Save / Exit (`openSaveActionDialog`, `onExit`) | ☰ + ⌘S; `toMDState(session)` view | **absent** | web-app's own suite (gate 2) |
| `initialMaterials` → step-0 origins | `createMaterialDoc("create-from-config")` | **absent** | web-app's own suite (gate 2) |
| `window.MDState` shape | derived in an effect from the session | **absent** | `material with following data exists in state` |
| `isConventionalCellShown`, `initialViewSettings`, `maxCombinatorialBasesCount` | pass-through to Viewport / combinatorial cap | **absent** | web-app's own suite (gate 2) |
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
| **Interpolated set / NEB** | Catalog › Sets › NEB, endpoints picked in-panel | **partial** — registered in `registry.ts` but `apply` is `(m) => m`, no panel, not in the Catalog | `menu/advanced/interpolated-set` |
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
| Lattice form (type/a/b/c/α/β/γ, units, scale-vs-preserve) | Inspector › Lattice + 3×3 toggle + symmetry locks | **absent** — Inspector renders read-only rows | `I set material basis and lattice with the following data` |
| Basis XYZ text (constraints, validation, crystal/cartesian) | Basis table + code toggle, units global | **partial** — one textarea in Inspector, no table, no constraint columns | `source-editor/basis-table` @parity_2_0 |
| Upload review grid | Import-review panel | **absent** | `menu/input-output/add-remove-import-files` |
| Materials list: filter, count, empty state | Navigator filter + count | **done** | `materials-list/filter-and-count` @parity_2_0 |
| Modified / updated marker | Navigator dot, revert-aware | **done** — content comparison against the material as it entered the session; materials derived in-session stay marked | `materials-list/updated-marker` @parity_2_0, 6 unit tests |
| Status bar (v1 footer was empty) | Status Bar segments | **partial** — bar exists; needs the group/text shape the spec asserts | `status-bar/status-bar` @parity_2_0 |
| Command palette | ⌘K over the command registry | **partial** — registry exists (`shell/commands.ts` + `domain/commands.ts`); ⌘K still opens the Catalog rather than a palette over actions/materials/Standata | `toolbar/command-palette` @parity_2_0 |
| Quick actions row | Workspace Bar | **partial** — undo/redo/clone/Standata render from the registry with `data-command` ids and disabled-with-reason; panel toggles not yet in the row | `toolbar/quick-actions` @parity_2_0 |
| Keyboard shortcuts + control availability | command registry + disabled-with-reason | **partial** — chords bound through the registry with one typing guard; `[`/`]` cycling and the last-panel rule are declared but their UI is not wired | `toolbar/keyboard-shortcuts`, `toolbar/control-availability` @parity_2_0 |
| Shift+U/D cycling (broken while typing) | `[` / `]` with field-focus guards | **partial** — `material.next`/`material.previous` bound to `]`/`[` behind the typing guard | `toolbar/keyboard-shortcuts` @parity_2_0 |
| View menu panel toggles | Alt+1…5 layout toggles | **absent** | `toolbar/quick-actions` @parity_2_0 |

## Code surfaces

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| JupyterLite Transformation (`materials_in`/`materials_out`) | Console › Notebook, same bridge | **absent** — tab renders "Not wired in the MVP" | the 53 `@notebook_healthcheck` features |
| JupyterLite session drawer | Console › Notebook | **absent** | `I see JupyterLite session` (web-app) |
| Python REPL | Console › REPL — cove `PythonRepl` over `InPageTransport` | **absent** | *(needs one)* |
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

## Descope order if Phase 2 slips

Cut from the bottom, and record the deferral with an owner here:
Catalog depth for notebook workflows → Console › REPL → set/combinatorial panel polish →
interpolated-set (fall back to porting the v1 dialog verbatim behind a command ID).

**Never cut**: anything in *Platform contract*, the lattice form, the basis editor, or any
step-definition retarget. Those are what other repositories depend on.
