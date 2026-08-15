# UI/UX Improvement Proposals

A brainstorm of UI/UX improvements for Materials Designer, grounded in the current codebase, the
TODO list in `README.md` (§2.2), and the workflows exercised by the Cypress/notebook tests.

**Quick mockups** for the highest-impact proposals live in [`mockups/`](mockups/index.html) —
self-contained HTML files, no build step needed:

| Mockup | Shows |
| --- | --- |
| [`mockups/01-workspace.html`](mockups/01-workspace.html) | Redesigned workspace: quick-action toolbar, smarter sidebar, status footer, dirty-state chip, undo snackbar, light/dark theme toggle |
| [`mockups/02-command-palette.html`](mockups/02-command-palette.html) | ⌘K command palette with fuzzy search over actions, materials, and Standata imports |
| [`mockups/03-transformations-gallery.html`](mockups/03-transformations-gallery.html) | "Transform" gallery unifying the Advanced menu with notebook-only workflows |
| [`mockups/04-basis-table.html`](mockups/04-basis-table.html) | Basis table editor + bidirectional selection sync between editor and 3D viewer |

---

## 1. Where the current UI stands

Observations from the code (paths relative to `src/`):

1. **The footer is empty.** `components/3d_editor_selection_info/EditorSelectionInfo.jsx` renders a
   bare 54 px `Box` — prime screen real estate reserved for "selection info" that never materialized.
2. **Every action hides behind a menu.** All operations — including undo/redo — take two clicks
   through the five menus in `components/header_menu/HeaderMenuToolbar.jsx`. There is no toolbar,
   and no keyboard shortcuts except an undocumented `Shift+U`/`Shift+D` material switcher buried in
   `components/items_list/ItemsList.jsx`.
3. **Zero tooltips.** No `Tooltip` usage anywhere in `src/` — icon-only buttons (including the
   cryptic wave.js side toolbar) are unlabeled.
4. **The materials list is minimal.** No count/index display, no search, no "new material" button,
   and the trash icon deletes instantly with no confirmation or undo. Combinatorial sets can create
   ~100 materials at once, which this list handles poorly (and
   `MaterialsDesigner.shouldComponentUpdate` JSON-stringifies all materials on every render).
5. **The basis is text-only.** `source_editor/BasisText.jsx` is a CodeMirror XYZ buffer. Great for
   power users; hostile for quick edits (change one coordinate, fix one element). Notably,
   `@mui/x-data-grid` is already a dependency (used by the import dialogs) but not used here.
6. **No link between editors.** Selecting an atom in 3D doesn't highlight its line in the basis, and
   vice versa (README TODO).
7. **Advanced workflows are invisible.** Interfaces, defects, nanoribbons, passivation etc. exist
   only as JupyterLite notebooks behind *Advanced → JupyterLite Transformation*. The test suite
   health-checks ~25 of these notebooks — none are discoverable from the main UI.
8. **No dirty-state affordance.** Edited materials turn orange and stay orange (README TODO:
   "switch the color back to white when the material is back to the original").
9. **Dark theme only.** `settings.js` hard-codes `DarkMaterialUITheme`.
10. **No shareable state.** README TODO: encode materials + view settings in a URL.

---

## 2. Proposals

### Theme A — Surface state and selection (quick wins)

#### A1. Status bar in the empty footer  *(Mockups 01, 04)*
Fill `EditorSelectionInfo` with a live status bar:
- **Selection readout:** `1 atom: Si @ (0.25, 0.25, 0.25)` → for 2 atoms add distance `d = 2.35 Å`,
  for 3 add the angle. wave.js already knows the selection; this is the missing display surface.
- **Material facts:** formula, atom count, lattice type, and material position (`2 / 6` — README TODO).
- **Hints:** contextual shortcut hints on the right (e.g. `⌘K commands`).

*Impact: high — turns dead space into the main feedback channel for 3D editing. Effort: low.*

#### A2. Dirty-state chip with one-click revert  *(Mockup 01)*
Replace the bare orange tint with an explicit `Modified` chip next to the material name
(header or sidebar item) plus a revert action. Clear it automatically when the material deep-equals
its original (README TODO). The existing `updatedIndices` reducer state already tracks this.

*Impact: medium. Effort: low.*

#### A3. Tooltips everywhere + shortcut cheatsheet
Wrap every icon button in `Tooltip` (with shortcut hint where applicable); add a `?`-key overlay
listing all shortcuts. Make `Shift+U/D` discoverable.

*Impact: medium (onboarding). Effort: trivial.*

### Theme B — Make frequent actions one interaction

#### B1. Quick-action toolbar  *(Mockup 01)*
A slim second row under the menu bar: Undo/Redo, Import, Export, Supercell, Surface, Transform
gallery, view-panel toggles, theme toggle, Share. Menus stay for completeness; the toolbar carries
the ~8 actions that account for most clicks.

*Impact: high. Effort: low-medium.*

#### B2. Command palette (⌘K)  *(Mockup 02)*
One searchable entry point over: all menu actions, materials in the session ("jump to…"), and
Standata imports ("import Graphene"). MUI `Autocomplete` in a modal is enough; every action is
already a callback prop on `HeaderMenuToolbar`.

*Impact: high — discoverability for ~30 scattered actions. Effort: medium.*

#### B3. Real keyboard shortcuts
`⌘Z/⌘⇧Z` undo/redo, `⌘K` palette, `⌘S` save, `⌥↑/↓` switch material, `Del` remove selected atoms.

*Impact: medium. Effort: low.*

### Theme C — Materials list that scales  *(Mockup 01)*

- **C1. Header with count + search.** `Materials (6)` + filter box (name/formula) + sort. Addresses
  README TODO "show the total number of materials in the list and the current index".
- **C2. "+" button** for new-from-scratch / import / Standata (README TODO "skeleton material with
  (+) button").
- **C3. Delete = undoable, not instant.** Snackbar "Deleted Si FCC — UNDO" (notistack is already a
  dependency) instead of irreversible one-click delete.
- **C4. Richer rows.** Lattice-type + spacegroup chips, atom count, dirty dot; hover actions
  (clone, export, delete) instead of a permanent trash icon.
- **C5. Drag & drop files onto the list** (README TODO; POSCAR/JSON parsers already exist in
  made.js). Full-window drop target with an overlay.
- **C6. Virtualize the list** and stop `JSON.stringify`-diffing all materials per render, so
  100-material combinatorial sets stay smooth.

*Impact: high (this is the primary navigation surface). Effort: medium.*

### Theme D — A friendlier source editor

#### D1. Basis table view (text ⇄ table toggle)  *(Mockup 04)*
A `DataGrid` alternative to raw XYZ: element autocomplete, numeric coordinate cells, per-axis
constraint checkboxes, add/duplicate/delete row. Text view stays one toggle away; both edit the
same state.

*Impact: high — makes single-atom edits safe and obvious. Effort: medium (dependency already present).*

#### D2. Bidirectional selection sync  *(Mockup 04)*
Click atom in 3D → highlight row/line in basis editor; select row/line → highlight atom in 3D
(README TODO). Combine with A1's selection readout.

*Impact: high. Effort: medium (needs a small selection-state bridge between wave.js and the editor).*

#### D3. Lattice editor upgrades
- Show the current **a/b/c/α/β/γ summary on the accordion header** so values are visible without
  expanding.
- **Live preview** of lattice edits (debounced apply to the 3D viewer, `Apply` commits).
- **3×3 lattice-vectors matrix input** as an alternative tab (README TODO).
- Re-enable symmetry-aware field disabling (`isDisabled()` currently returns `false` — see TODO in
  `LatticeConfigurationDialog.jsx`).

*Impact: medium. Effort: medium.*

### Theme E — Discoverable advanced workflows

#### E1. "Transform" gallery  *(Mockup 03)*
Replace the flat Advanced menu with a searchable gallery of cards: Supercell, Surface/Slab,
Interface (ZSL), Point defect, Grain boundary, Nanoribbon, Nanowire, Passivation, Perturbation,
Combinatorial set, Interpolated set, Custom Python. Native dialogs badge "Instant"; notebook-backed
ones badge "Notebook" and open JupyterLite with the current material preloaded. One mental model
for all structure generation, and the ~25 notebook workflows finally become visible.

*Impact: high — this is where the platform's depth is hiding. Effort: medium (catalog + routing; the
notebooks already run via the existing JupyterLite drawer).*

#### E2. Previews inside dialogs
- Supercell: show resulting atom count and cell dimensions before applying ("2×2×2 → 64 atoms").
- Surface/slab: mini sketch of the Miller plane orientation.
- Guard rails: warn before generating >N-atom structures.

*Impact: medium. Effort: medium.*

### Theme F — Persistence, sharing, polish

- **F1. Shareable URL state** (README TODO): encode materials + view settings; "Copy link" in the
  toolbar. Consider a `#`-fragment payload to stay backend-free.
- **F2. Session restore:** autosave the redux store to localStorage; offer "Restore previous
  session" on load.
- **F3. Light theme + toggle** *(Mockup 01 — the toggle works)*: publish-ready for embedding in
  light-themed hosts; `ThemeProvider` already accepts a theme.
- **F4. Empty state / onboarding:** when the list is empty, show a drop zone + "Import from
  Standata" call-to-action instead of a blank panel; first-run coach marks for the three panels.
- **F5. Fix fullscreen** (README TODO) and responsive behavior of the three-panel grid.
- **F6. A11y pass:** aria-labels on icon buttons, focus states, menu keyboard navigation.

---

## 3. Suggested rollout

| Phase | Contents | Rationale |
| --- | --- | --- |
| 1 — Quick wins | A1 status bar, A2 dirty chip, A3 tooltips, C1 count+search, C3 undoable delete, B3 shortcuts | Small PRs, immediately felt, several close README TODOs |
| 2 — Navigation | B1 toolbar, B2 command palette, C2 add button, C5 drag-drop import | One-interaction access to everything |
| 3 — Editing depth | D1 basis table, D2 selection sync, D3 lattice upgrades, E2 dialog previews | Core editing loop becomes precise and forgiving |
| 4 — Reach | E1 transform gallery, F1 share links, F3 light theme, F2 session restore | Exposes advanced capability, enables sharing/embedding |

## 4. README TODOs covered

| README §2.2 TODO | Proposal |
| --- | --- |
| Switch color back when material reverts | A2 |
| Show total number of materials + current index | A1 / C1 |
| Fix fullscreen support | F5 |
| Lattice vectors 3×3 form | D3 |
| Highlight atoms 3D ⇄ source editor | D2 |
| Drop files onto the materials list | C5 |
| Skeleton material with (+) button | C2 |
| Shareable URL state | F1 |
