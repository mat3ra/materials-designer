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
| Upload from disk (POSCAR/JSON) | Upload quick action, Catalog › From file, ☰, and global drag-and-drop | **done** — the first three open the review; a drop imports directly, because the drop *is* the decision. An imported material takes the structure's own name, not the file's, which is what the platform's fixtures pin | `menu/input-output/add-remove-import-files` **green against 2.0** |
| Import from Standata (73 configs) | Catalog › Create › Standard library | **done** — listed by material name (it was showing file names until the spec said otherwise), and every entry imports: one names an `external.source` outside the schema's enum, so that block alone is dropped for that entry | `menu/input-output/import-from-standata`, `toolbar/command-palette` **green against 2.0**; 6 unit tests |
| Export JSON / POSCAR / all | ☰ › Export | **done** | md2 smoke (to port) |

## Operations

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Supercell (3×3, det≠0) | Catalog › Build › Supercell panel | **done** | `menu/advanced/supercell` **green against 2.0** |
| Surface / slab (hkl, layers, vacuum) | Catalog › Build › Surface panel | **done** | `menu/advanced/surface` **green against 2.0** |
| Boundary conditions (pbc/bc1–3 + offset) | Inspector › Structure | **done** | `menu/advanced/boundary_conditions` **green against 2.0** |
| Combinatorial set (XYZ syntax, cap, naming) | Catalog › Sets › Combinatorial → set folder | **done** — the batch is one operation, so one Cmd+Z removes it | `sets/combinatorial` @parity_2_0 |
| **Interpolated set / NEB** | Catalog › Sets › NEB, **both** endpoints picked in-panel | **done** — images are set children with their own origins, inserted after the material they came from; the forecast is the interpolation actually run, so an impossible pair is explained before Apply rather than throwing after it | `menu/advanced/interpolated-set` **green against 2.0**, smoke (both paths) |
| Use conventional cell | Inspector › Structure › Cell, recorded as an op | **done** — a labelled control on the Structure tab, `structure.conventional-cell` in the registry | md2 smoke (2 checks); no Cypress feature yet — v1 had none either |
| Toggle isNonPeriodic + saved-material guard | Inspector › Structure › Periodicity, guard → disabled-with-reason | **partial** — op registered; guard not implemented | *(needs one)* |
| Clone | Navigator fork (fork-origin chip) | **done** | `menu/edit/reset-clone-undo-redo` |
| Undo / Redo — one stack | Timeline steps + ⌘Z everywhere | **done** | `timeline/one-undo-stack`, `menu/edit/reset-clone-undo-redo`, `toolbar/quick-actions` |
| Reset | `edit.reset` — the session back to how it opened, undo stack included | **done** — this was wrong until the spec said so: 2.0 had only a per-material revert, and v1's Reset was always session-level | `menu/edit/reset-clone-undo-redo` **green against 2.0** |
| Delete material (undoable) | Navigator row action | **done** | `3d-editor/delete-material`, `materials-list/filter-and-count` @parity_2_0 |
| Rename material | Navigator inline rename | **done** — double-click a name, or the `material.rename` command; a no-op rename records nothing | `materials-list/filter-and-count` @parity_2_0, smoke |

## Editing surfaces

| v1 capability | 2.0 home | Status | Covering test |
|---|---|---|---|
| Lattice form (type/a/b/c/α/β/γ, units, scale-vs-preserve) | Inspector › Structure › Edit lattice | **done** — disclosed form, staged edits, preserve-vs-scale kept, and the dependent parameters re-derived from the Bravais type on apply (choosing TET fixes the angles at 90° and ties b to a) | `menu/advanced/interpolated-set`, `menu/edit/reset-clone-undo-redo` **green against 2.0** |
| Basis XYZ text (constraints, validation, crystal/cartesian) | Basis table + text view on `#basis-xyz` | **done** — both views write one `set-basis` op; constraints appear only when something is constrained | `source-editor/basis-table` @parity_2_0 (4/4) |
| Upload review grid | Import review, on the Catalog's overlay rather than the 300px panel zone | **done** — v1's DOM contract kept whole (`#defaultImportModalDialog`, the DataGrid's `role="cell"`/`data-field` cells, `#<file>-remove-button`, the submit and cancel ids), so the feature passes against 2.0 with only the step that *opens* it retargeted | `menu/input-output/add-remove-import-files` **green against 2.0**; 6 unit tests; 10 smoke checks |
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
| JupyterLite Transformation (`materials_in`/`materials_out`) | Console › Notebook, same bridge | **done** — same wrapper id, `data-tid`s and iframe id, so `JupyterLiteTransformationDialogWidget` and `JupyterLiteSession` drive it unchanged; only the step that *opens* it moved to `console.notebook`. Results land as `notebook-result` origins at the top level — which materials went in is in the operation's params, which the chip prints; `parentId` is fork lineage and a code result is not a fork. Adopting closes the dock, as v1's modal did, so re-opening starts a fresh notebook | the 53 `@notebook_healthcheck` features; 12 unit tests; 9 smoke checks |
| JupyterLite session drawer | Console › Notebook | **done** — one surface instead of a drawer plus a modal | `I see JupyterLite session` (web-app) |
| Python REPL | Console › REPL | **done** — JupyterLite's own `/repl/` app through `BridgedIframe`, bound to `materials_in`/`materials_out` over the same bridge as the notebook. The deployment's `data_bridge` extension is federated at the root and the REPL app inherits it (its own `jupyter-lite.json` overrides only `disabledExtensions`), so `get_materials` / `set_materials` from `mat3ra.notebooks_utils` work at the prompt unchanged; the tab prints the lines. Adopting a result leaves the dock **open**, unlike the notebook, which closes on submit for v1 parity: the notebook wants a fresh session on re-open, the REPL has one running and the frame is the kernel. The in-page REPL — cove's `PythonRepl` over `InPageTransport`, `feature/SOF-7961` — remains the end state: a direct call instead of a message, and no frame | `console/repl` (the designer's side, with a synthetic frame message); the round-trip against the live kernel is checked by hand on the deploy preview, because the sandbox cannot reach the frame |
| History as script | Console › Script (`logAsPython`) | **done** — the operations, not the coordinates: configs and bases are elided so the recipe stays readable | 2 unit tests |
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

## What 2.0 adds that v1 had no equivalent for

These are not parity rows — there is nothing to be at parity with. They are here because they are
the reasons for the rewrite, and each one now has a spec rather than a claim.

| 2.0 behaviour | Covering test |
|---|---|
| A transform is forecast before it is applied, with the material still on screen | `timeline/edit-a-past-step` |
| A past step can be edited in place; everything after it replays, for one undo | `timeline/edit-a-past-step` |
| One undo stack across every surface (v1 had two, and they could resurrect each other's state) | `timeline/one-undo-stack` |
| A refresh does not lose the session, and the app says it restored rather than doing it silently | `session/autosave-and-restore` |
| A batch is one operation: one folder, one undo | `sets/combinatorial` |
| Files are reviewed before they enter the session, and cancelling leaves nothing behind | `menu/input-output/import-review-cancel` |
| Files can be dropped anywhere on the window, and a cancelled drag leaves no overlay behind | `session/drag-and-drop` |
| Code surfaces are tabs of one dock; switching leaves exactly one frame mounted | `console/repl`, `console/notebook` |

## Cutover gate 1 — the v1 suite against 2.0

Run on 2026-09-06 with `--env APP=v2`: **all eight specs CI gates on pass**, and no feature file
was edited to get there. What changed is step-definition bodies and widget selectors, which is
what freezing the phrases rather than the implementation is for. The whole suite against 2.0 —
these eight plus the harvested specs — is 37 passing, 0 failing.

| Spec | Result against 2.0 |
|---|---|
| `3d-editor/delete-material` | ✔ |
| `menu/input-output/add-remove-import-files` | ✔ |
| `menu/input-output/import-from-standata` | ✔ |
| `menu/advanced/supercell` | ✔ |
| `menu/advanced/surface` | ✔ |
| `menu/advanced/boundary_conditions` | ✔ |
| `menu/advanced/interpolated-set` | ✔ |
| `menu/edit/reset-clone-undo-redo` | ✔ |

Gate 2 — the 62 web-app features against WIP tarballs of both packages — is still to run, and is
the one that decides the flip.

## The embedded stylesheet (closed 2026-09-08, before the export switch)

The container imports `md2.css` for its side effect, so anything unscoped in that file is a rule
applied to web-app's page. It opened with `*`, `html, body, #root` and a `body` background: the
embed would have repainted the platform navy and restyled its buttons. Gate 2 would have caught it,
at the cost of a full round trip.

`page.css` now holds the reset, the root sizing, the page background and the `:root` tokens and is
imported only by the standalone entry; `md2.css` holds the app and names nothing but `.md2-app`,
which carries the tokens and paints its own ground, colour and type. A vitest case rejects any
selector in md2.css outside `.md2-`, and `npm run test:host-leak` mounts the real component in a
host page and asks the browser which stylesheet supplies each declaration on the host's elements.

One leak is left, and it is not ours: `@mat3ra/wave.js` imports a stylesheet setting
`body { font-family; margin; overflow: hidden }`, which reaches any importer — v1's
`ThreeDEditorFullscreen` included. The check reports it and does not assert on it. Worth raising
against wave.js separately; it is not a cutover blocker, because the platform already has it.

## The flip, and what moved

v1 is deleted. `index.html` loads `src/index.tsx`, `/v2.html` is gone, and `src/exports.ts` is the
published surface. Where each export went:

| Export | Before | After |
|---|---|---|
| `MaterialsDesignerContainer` | `src/MaterialsDesignerContainer.tsx` | `src/embed/MaterialsDesignerContainer.tsx` |
| `MDMaterial` | `src/MDMaterial.ts` | unchanged — it was already v1-free |
| `ActionDialog` | `src/components/include/` | `src/compat/ActionDialog.jsx` |
| `BasisText` | `src/components/source_editor/` | `src/compat/BasisText.jsx` |
| `ThreeDEditorFullscreen` | `src/components/3d_editor/` | `src/compat/ThreeDEditorFullscreen.jsx` |
| `MDState` type | `src/reducers/Material.ts` | same path, now a type-only re-export of `MDStateView` |
| `CodeMirror`, wave view-settings helpers | re-exports | unchanged |

The three `src/compat` files are kept, not rewritten: they are standalone code another repository
renders, and 2.0 does not use them. `BasisText`'s two `displayMessage()` calls are inlined, which
retired `src/i18n` as the plan intended.

Two deliberate deviations from the plan, both because a published path cannot be proven unused
from inside this repository:

- **`src/stylesheets/main.css` stays**, and `copy-css` still ships it to `dist/stylesheets/`.
  v1's container never imported it — only its page entry did — so it may well be dead, but if
  web-app imports the path directly, deleting it changes that page's layout silently. Confirming
  and then deleting it is a gate-2 item. Note it targets `.three-renderer` with v1's header and
  footer heights, so if web-app does load it, it now applies to 2.0's viewport as well.
- **`StandataDialogWidget`'s three v1 methods keep their names** (web-app subclasses these
  widgets) but throw a message naming `pickFromLibrary` instead of timing out on a selector that
  no longer exists. `HeaderMenuWidget` and the `headerMenu` property survive untouched for the
  same reason, even though nothing routes through them any more.

## Still open

- The in-page REPL (cove's `feature/SOF-7961`). The frame route is bound; the direct-call route is
  what replaces it.
- Gate 2, below. Nothing is published and no pin is bumped until it passes.

## Cutover gate 2 — the platform's own suite

Gate 1 is closed: every v1 spec CI gates on passes against 2.0 (see above). Gate 2 is the half that
cannot run from this repository, because it needs web-app's stack. **Nothing is published, no pin
is bumped, and this branch does not merge until it passes.**

The 62 feature files in web-app that consume this repository's step definitions are the
specification. They exercise MD through the platform — the import modal, the save dialog, the
materials the platform seeds — which is exactly the surface unit tests here cannot reach.

1. **Build both WIP tarballs.**
   ```
   npm run transpile && npm pack          # → mat3ra-materials-designer-<version>.tgz
   ```
   Do the same in cove if a cove change is in flight; otherwise pin the released version.

2. **Confirm the surface before handing it over.** These are the paths web-app resolves, and the
   CSS path is load-bearing because `src/embed` imports it relatively:
   ```
   dist/exports.js
   dist/exports.d.ts
   dist/embed/MaterialsDesignerContainer.js
   dist/reducers/Material.d.ts        # the MDState type
   dist/compat/{ActionDialog,BasisText,ThreeDEditorFullscreen}.js
   dist/styles/md2.css
   ```

3. **Pin the tarballs in web-app** (`file:` dependencies), install, and build it.

4. **Run its 62 consuming features.** They are the gate. A failure here is a 2.0 defect until
   proven otherwise — that was true of all seven defects gate 1 exposed.

5. **Check the embed does not restyle the platform** in the running app, not just in this
   repository's harness: the platform's own page background, type and buttons must not move. See
   *The stylesheet must not touch the host* in TEST-HOOKS.md for what is known to leak and what
   is not ours.

Only when 4 and 5 are clean:

6. `npm publish` this repository, then bump the pin in web-app's `package.json`.
7. Merge this branch.

### Three things to settle while you are in web-app

- **Does anything import `dist/stylesheets/main.css`?** It is v1's page stylesheet, kept only
  because that cannot be answered from this repository. If nothing does, delete `src/stylesheets/`
  and drop it from `copy-css`. If something does, note that it sets
  `.three-renderer { height: calc(100vh - <v1's header and footer>) }`, which now lands on 2.0's
  viewport.
- **Does its widget subclass call `headerMenu` or `StandataDialogWidget`'s dropdown methods?**
  The menu bar is gone; those three methods now throw a message naming `pickFromLibrary`. Both are
  kept for the subclass, and both can be deleted with a `[contract-change]` commit once the answer
  is known.
- **`isConventionalCellShown` and `initialViewSettings` are accepted and ignored**, pending wave.js
  taking them as controlled props. If web-app's suite asserts on either, that is the one expected
  class of failure — record it here rather than working around it in the adapter.

## Descope order if Phase 2 slips

Cut from the bottom, and record the deferral with an owner here:
Catalog depth for notebook workflows → Console › REPL → set/combinatorial panel polish →
interpolated-set (fall back to porting the v1 dialog verbatim behind a command ID).

**Never cut**: anything in *Platform contract*, the lattice form, the basis editor, or any
step-definition retarget. Those are what other repositories depend on.
