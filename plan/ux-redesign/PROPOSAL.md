# Materials Designer 2.0 — a ground-up UX redesign

**Status: proposal for review · v2 track · stack-agnostic (implementation path decided separately)**
**Companion mockups:** [`mockups/index.html`](mockups/index.html) — six screens + hub, self-contained HTML, no build step, dark + light.

**Reading guide.** Five minutes: §1 (summary) + §4 (the five decisions) + the mockups. Thirty minutes: add §3 (concepts), §7 (architecture), §14 (MVP + roadmap). Full review before implementation: everything, with §12 (parity) checked against your own workflows.

---

## 1. Executive summary

Materials Designer today is a capable but fragmented tool: five menus over three fixed columns, blocking modal dialogs for every transformation, ~25 advanced workflows invisible inside JupyterLite notebooks, two independent undo stacks (the app's and the 3D viewer's), no persistence (a refresh loses the session), a text-only basis editor, and no link between the 3D view and the editors. The incremental v1.x track (PR [#299](https://github.com/mat3ra/materials-designer/pull/299): status bar, ⌘K palette, materials-list upgrades, basis table, resizable panels, undo fixes) relieves the sharpest pains but cannot change the shape of the product.

**MD 2.0 is a different shape: a parametric CAD studio for crystals.** The reframing underneath it: **the document is not a structure — it is a derivation**, a material *plus the operation log that produced it*. Almost every v1 pain traces back to treating structures as bare coordinate blobs; once the log is the document, one history, lineage navigation, re-editable steps, recipe sharing, and safe AI assistance all fall out of one mechanism instead of being five separate features.

Concretely, 2.0 delivers four pillars on that spine:

1. **Parametric provenance** — every edit (gesture, form, notebook run, accepted AI proposal) is a recorded operation in a per-material **Timeline**: re-editable, replayable, forkable, exportable as a runnable script.
2. **One Catalog, many engines** — every way to create or transform a structure is a card in one searchable gallery; native/notebook/code is a badge, not a different door. Blocking dialogs become non-blocking **Operation Panels** with live ghost previews and predicted results.
3. **An Assistant with a contract** — natural language compiles to the same whitelisted operation vocabulary, previewed as a ghost diff, never auto-applied, recorded with its prompt.
4. **Sessions, sharing, and four product modes** — autosave always; share links that encode the recipe; one core wearing four costumes (standalone IDE, platform-embedded editor, read-only MaterialGeometry viewer, micro picker).

The design assumes only a capable modern web stack, a WebGL canvas emitting edit-commit events (wave.js provides `onEditCommit(material, source)` in the currently pinned release), and an in-browser Python sandbox (JupyterLite/Pyodide today). **An MVP demonstrating the new shape — spine + shell + non-blocking transforms + autosave — is ~9–10 engineer-weeks (§14.1).** Greenfield-vs-evolve is a separate decision; §14.3 supplies the inputs.

---

## 2. Where v1 stands — audit summary

Grounded in the current code (`dev` @ `9660a81`); every claim verified in-session.

### What works and must be preserved

- **The domain layer is excellent and reusable.** All crystallography lives in `@mat3ra/made` (supercell/surface/interpolation math, XYZ/POSCAR parsers, lattice types, consistency checks); the entire 3D viewer in `@mat3ra/wave.js`; UI primitives in `@mat3ra/cove`. The app itself is only 44 files — the rewrite surface is small.
- **wave.js post-rewrite is strong in-canvas**: marquee/click selection, translate/rotate gizmos, measurements, per-element selection chips, camera presets, figure/GIF export, a keyboard sheet — and a documented `onEditCommit` channel with sources (`drag|gizmo|add|remove|clone|undo|redo|…`) built precisely so a host can own history.
- **The embedding contract** (host injects `openImportModal`, `openSaveActionDialog(mdState)`, `onExit`; menu items self-disable standalone) works and the platform depends on it (`src/exports.js`, `src/MaterialsDesignerContainer.tsx:92-103`).

### Structural limits no incremental fix removes

| Limit | Evidence |
|---|---|
| **Two undo stacks over one material** | Header Edit ▸ Undo drives `useUndoableState` (50 whole-state snapshots, present held in a ref); the viewer's ⌘Z drives wave.js's own `historyStack`. They disagree by design. |
| **Modal ceiling on transformations** | Supercell/Surface/Combinatorial/Interpolate/Boundary dialogs block the viewport; no previews; "→ how many atoms?" is answered only after Apply. |
| **Invisible depth** | ~25 notebook workflows (interfaces/ZSL, defects, nanoribbons, passivation, perturbation…) reachable only via *Advanced → JupyterLite Transformation*; the Pyodide script dialog is orphaned code; the REPL (PR [#294](https://github.com/mat3ra/materials-designer/pull/294)) adds a third disconnected code surface. |
| **A list where lineage belongs** | Combinatorial sets emit up to ~100 materials into a flat, unvirtualized list; a slab stores its bulk only as a metadata id; no grouping, no derivation trail. |
| **Nothing persists** | No localStorage/router; a refresh loses everything; the URL-state TODO covers view settings only. |
| **Editing surfaces disconnected** | No 3D↔text selection sync (top README TODO); lattice symmetry-locking stubbed out (`LatticeConfigurationDialog.jsx:79-83`); no 3×3 vector form; dirty state tracked but visually absent. |
| **Chrome inside the canvas** | wave.js renders its own toolbar/status/inspector — unthemeable, untestable from the app, duplicating what app chrome must also say. |

### What the v1.x track already fixes (and 2.0 absorbs, evolved)

#299 ships: footer status bar; list count/filter/add-menu/undoable delete; a quick-action toolbar and ⌘K palette over a single action registry; an XYZ basis table; resizable persisted panels; truthful undo/redo; a revert-aware "edited" marker. 2.0 keeps all these concepts as first-class citizens of the new shell.

---

## 3. The conceptual model — five nouns

The UX is built from five concepts. Everything visible in the mockups is a projection of these.

1. **Operation** — the atom of the system. A drag gesture, a lattice-form edit, a supercell, a notebook run, an accepted AI proposal: all compile to one recorded op `{type, params, engine, result}`. *Why:* the only clean resolution of the dual-undo problem — and exactly what wave.js's `onEditCommit` channel was built for (v1 ignores it in favor of legacy `onUpdate`).
2. **Material with lineage** — materials form a derivation tree; set-producing ops make **set folders** (one row for 100 combinatorial children). *Why:* derivation is how scientists actually name their materials ("the 3×3 of the (111) slab of that bulk"), and it is the only navigation model that survives 100-material sets.
3. **Projection** — the 3D viewport, structured forms, and code are three synchronized views of one model sharing **one selection**. *Why:* v1's top README TODO (3D↔text highlighting) is a symptom of editors that don't share state; a first-class shared `SelectionModel` fixes the class of problem, not the instance.
4. **Engine** — native / notebook / REPL / AI / manual is a *badge on an operation*, not a different door. *Why:* v1 hides ~25 workflows behind *Advanced → JupyterLite* purely because they execute differently; users choose *what* (an interface, a defect), not *how it runs*.
5. **Costume (product mode)** — standalone IDE, platform-embedded editor, read-only viewer, picker: one core, chrome and permissions vary. *Why:* v1 already lives two of these lives, and the platform wants the other two (MaterialGeometry view, material picker). Designing all four up front keeps every later feature honestly suppressible instead of hacked off per embed.

---

## 4. Load-bearing decisions (the review targets)

Five decisions carry the design. Each is stated with the alternative we rejected — these are the right places to push back; most of the rest of the document is consequence rather than choice.

| # | Decision | Rejected alternative, and its cost |
|---|---|---|
| **D1** | **Provenance is the spine.** The per-material operation log is the document; the Timeline renders it; undo, Reset, lineage, recipes, and AI safety are all views of it. *(Mockup 03.)* | Plain linear undo + a passive history log — cheaper, but forfeits re-editing, lineage, reproducibility, and the AI contract; the dual-history debt returns with new chrome. |
| **D2** | **Menus are retired.** One ☰ app menu keeps file-level + host-injected actions; everything else lives in Catalog / palette / toolbar / context menus over a stable command registry. *(Mockups 01–02.)* | A slim menu bar preserved for muscle memory — it re-fragments the action surface the Catalog and palette just unified, and keeps tests coupled to menu geometry. |
| **D3** | **Timelines stay linear; branching = fork a sibling material** with shared ancestry drawn by the Navigator. *(Mockup 03 B.)* | A DAG in one rail — more "correct", unreadable in practice; a research project where a tree view already does the job. |
| **D4** | **Fixed named regions; resize/collapse only — no free-form docking.** *(Mockup 01.)* | A tiling window manager — flexibility that four product modes, onboarding, documentation, and persisted-layout QA would pay for forever. |
| **D5** | **Catalog: browse is modal, configure is modeless.** Choosing a transform gets a focused overlay; tuning it gets a side panel beside the live, orbitable viewport. *(Mockup 02 A/B.)* | Fully modeless browsing (a permanent library panel) — steals permanent width for an occasional activity; fully modal configuration (v1 dialogs) — makes previews impossible. |

**Second-tier decisions** (consequences of the above, listed for completeness): app owns all chrome, canvas owns rendering/camera/picking (themability, testability, one history owner) · camera and display state are never in history (mixing view and model state is what makes v1's stacks feel broken) · selection is a shared store with a hover channel · every command has a stable ID in one registry (palette, keyboard, onboarding, telemetry, AI all consume it) · one token set drives dark and light (embeds override tokens, never components).

---

## 5. Vision and design principles

**Working metaphor: a parametric CAD studio for crystals** (Onshape/Fusion's feature timeline, adapted to materials science).

1. **Every edit is an operation.** *Consequence: exactly one history; the canvas/app contract falls out of this rule.*
2. **The recipe is the artifact.** The timeline is the editable source the structure is computed from — and it exports as a runnable script. *Consequence: Reset, Clone, "how did I make this?" become timeline verbs.*
3. **Preview before commit.** Ghost atoms, dashed future cells, predicted outputs before Apply. *Consequence: engines that cannot preview must say so and predict what they can.*
4. **One catalog, many engines.** *Consequence: notebook workflows stop being a separate universe.*
5. **Three projections, one selection.** *Consequence: site index ↔ table row ↔ code line, both directions.*
6. **Design for sets and lineage, not lists.** *Consequence: trees, set folders, roll-ups, virtualization by default.*
7. **Crystallographic honesty on screen.** Units always visible; crystal vs cartesian is a global mode; symmetry locks dependent lattice fields visibly; conventional vs primitive is labeled; constraints are first-class selection properties.
8. **Same core, four costumes.** *Consequence: nothing in the core may assume a costume.*

---

## 6. Users and the workflows the design is judged by

Computational materials scientists and engineers, on the Mat3ra platform and standalone. Eight benchmark workflows (six traced in §9):

1. Import → inspect → adjust → export
2. Build a slab from a bulk (Miller indices, thickness, vacuum)
3. Defect studies (vacancy/substitution/interstitial, then constraints for relaxation)
4. NEB chains (two endpoints → interpolated set)
5. Combinatorial screening (template → ~100 materials → triage)
6. Measurement and geometry checks (distances, angles, coordination)
7. Constraints and boundary conditions for downstream simulation
8. "Make it reproducible" — hand a colleague the exact derivation

---

## 7. Information architecture — the building blocks and why they have their shape

Fixed named regions with resizable/collapsible panels (D4).

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ WORKSPACE BAR  ☰ · Session ▾ · Saved ● · ↶ ↷ │ ⌘K search │ ✦ Assistant · Share │
├──────────┬───────────────────────────────────────┬──────────┬────────────────┤
│ NAVIGATOR│ VIEWPORT TOOLBAR (app-owned)          │ TIMELINE │ INSPECTOR      │
│ lineage  │ ──────────────────────────────────────│ operation│ Structure ·    │
│ tree +   │              VIEWPORT                 │ chips,   │ Selection ·    │
│ set      │           (wave.js canvas;            │ scrubber,│ Display        │
│ folders  │        ghost previews render here)    │ 48px dot │ (or OPERATION  │
│          │                                       │ collapse)│ PANEL)         │
├──────────┴───────────────────────────────────────┴──────────┴────────────────┤
│ CONSOLE  ▷ REPL · 📓 Notebook · ⌁ Script · ☰ Log            (collapsible dock)│
├──────────────────────────────────────────────────────────────────────────────┤
│ STATUS   formula · atoms · lattice/space group · selection · units · autosave │
└──────────────────────────────────────────────────────────────────────────────┘
Overlays: CATALOG (browse) · COMMAND PALETTE (⌘K) · ASSISTANT flyout (⌘J) · Share
```

| Block (evolves from) | Its job | Why this shape and not another |
|---|---|---|
| **Navigator** (materials list + #299 filter/count) | Materials as lineage tree + set folders; filter; count; + New; multi-select feeds bulk and 2-input ops | Flat lists collapsed under derived materials and 100-material sets; the tree is also where forks (D3) land. A flat A-Z toggle preserves the v1 mental model |
| **Viewport + Viewport Toolbar** (wave.js editor + its in-canvas toolbar) | Canvas renders, orbits, picks, drags; the app-owned strip carries select/move/rotate · atom ops · measure · bonds/labels/repetitions · camera · snapshot · ⚡Transform | Chrome leaves the WebGL canvas because in-canvas chrome cannot be themed, tested, localized, or kept consistent with app state — and one history needs one owner |
| **Timeline** (new; replaces Edit ▸ Undo semantics) | The operation log as chips: scrub, edit-past-and-replay, fork, export as script; collapses to a dot strip | The spine (D1) made visible. Vertical because recipes read top-to-bottom like the script they export to; placed beside the Inspector so chip → parameters follows reading direction |
| **Inspector / Operation Panel** (source-editor column + wave's selection inspector + all five modal dialogs) | Structure (lattice + symmetry locks + 3×3 vectors, cell, periodicity, boundary conditions) · Selection (species, coords, constraints, measurements) · Display; transforms configure here | Configuring a transform must not hide the 3D view or previews are impossible (D5); properties and operations share one zone because both are "details of the current focus" |
| **Catalog** (Advanced menu + Standata dialog + notebook picker) | Every create/transform op as searchable cards: engine badges, input requirements, disabled-with-reason, Recents | One door for all generation (concept 4); modal to browse, modeless to configure (D5); zero-results hand off to the Assistant |
| **Console** (JupyterLite drawer + transformation dialog + #294 REPL) | One dock: REPL · Notebook · Script (history-as-code) · Log | Three bolted-on code surfaces become one projection (concept 3); Script is where "Copy as script" lands, closing the reproducibility loop |
| **Workspace Bar + Status Bar** (header + five menus / empty footer) | Session identity, ☰ file menu, one undo pair, ⌘K, ✦, Share / live facts, selection count, global units, autosave truth | The bar shrinks because menus retire (D2); the footer fills because v1 reserved 54 px for selection info that never shipped |
| **Command Palette** (#299 ⌘K) | Everything, typed; argument parsing ("supercell 3 3 1"); "go to step"; zero-results → Assistant | One registry of stable command IDs feeds palette, keyboard map, onboarding, telemetry, and AI compilation |
| **Assistant** (new) | Right flyout: NL → Proposal Card → ghost-diff preview → apply as ordinary history | A flyout, not a chat page, because proposals must sit beside the preview they describe; it compiles to the Catalog vocabulary so it can never do what the UI cannot |

### 7.1 Navigation model

- **One active material** drives Viewport/Timeline/Inspector; the Navigator switches it; multi-select enables bulk actions and 2-input ops (interface/ZSL).
- **The tree is lineage.** Roots = imported/created; children = derived; set-producing ops render one virtualized **set folder** row with a roll-up badge and bulk actions. Filter flattens to matches.
- **Derivation breadcrumb** tops the Timeline ("From: Si bulk › Si(111) slab · 4L"), clickable.

### 7.2 Command surfaces

No menu bar (D2). Commands live in the Catalog (create/transform), Inspector/Operation Panels (properties), Viewport Toolbar (tools), palette (everything), context menus (selection- and chip-scoped), and the single ☰ app menu (file-level + host-injected Import/Save/Exit — the unchanged embed contract).

### 7.3 Feature landing map (summary; full parity in §12)

Import/Save/Exit → ☰ + palette (host-injected as today) · Standata → Catalog › Create · Upload → Catalog › From file + global drag-drop · Export → ☰ + Share › Download · Undo/Redo → unified stack · Reset → revert to step 0 · Clone → Navigator context menu · Conventional cell / non-periodic → Inspector › Structure (recorded as ops) · Advanced dialogs → Catalog cards + Operation Panels · JupyterLite + REPL → Console · Lattice form → Inspector with symmetry locks + 3×3 toggle · Basis text/table → basis table with code toggle; units go global · wave 3D tools → Viewport Toolbar + Display tab · dirty state → revert-aware dot.

---

## 8. The system spine (stack-agnostic)

### 8.1 The operation model

```
Operation {
  id, materialIds[], type,            // "supercell", "substitute", "manual-patch", …
  params,                             // typed per operation
  engine:  native | notebook | repl | manual | ai,
  source:  gesture | form | code | assistant | import,
  label, resultDigest { formula, atomCount, lattice },
  status:  ok | stale | error,
  provenance { prompt?, notebookRef?, versions, inputHash, outputHash }
}
```

- **Per-material operation log**; current structure = `replay(log)`. Parametric ops recompute via made.js; **manual ops** (gestures, direct basis edits) store minimal site-diff patches; imports store payload + hash.
- **Session undo stack** = ordered references into logs. ⌘Z undoes the most recent operation regardless of surface; gestures coalesce (one drag = one op); form fields commit on blur/Enter.
- **Camera and display state are never history** — they are session view settings; undo never moves the camera.
- **Editing the past** replays downstream; failures mark chips **stale** with explicit resolution (re-map by proximity / skip / fork). Branching = forking a sibling material (D3).

### 8.2 Selection as shared state

`SelectionModel { materialId, siteIds[], anchor }` in the app store; Viewport, Selection tab, basis table, and basis code read/write it; hover mirrors transiently. Canvas→app arrives via wave's selection events; app→canvas needs the controlled-selection prop wave's own TODO acknowledges (`ThreeDEditor.jsx:318`) — the one wave-side ask beyond chrome suppression. Measurements are selections of arity 2/3. The Assistant receives the selection as context.

### 8.3 Product modes (the platform contract)

| Surface | Standalone IDE | Embedded editor | Read-only viewer | Picker |
|---|---|---|---|---|
| Workspace Bar | full | slim, host Save/Exit | title strip | host dialog chrome |
| Navigator | lineage tree | ✓ | optional flat list | search + list |
| Timeline | ✓ editable | ✓ editable | read-only dots | — |
| Inspector / Op Panels | ✓ | ✓ | read-only Structure | — |
| Catalog / transforms | ✓ | ✓ | — | Standata + upload |
| Console | ✓ | policy flag | — | — |
| Assistant | ✓ | policy flag | — | — |
| Persistence | local sessions | host save + local draft | none | selection via callback |
| Theme | user choice | host tokens | host tokens | host tokens |

The viewer mode is the platform's MaterialGeometry view; the picker modernizes v1's injected import modal. *(Mockup 06.)*

---

## 9. Key flows (walkthroughs)

1. **First run → slab.** Empty state offers "Start with Silicon / Browse library / Import / Ask the Assistant"; a skippable 60-second guided build makes a slab through real operations — the first artifact has a real timeline.
2. **Configure a supercell** *(mockup 02)*: ⚡Transform → Catalog → Supercell → Operation Panel with the 3×3 matrix; ghosts + dashed cell + "→ 72 atoms" live; Apply appends one chip.
3. **Edit the past** *(mockup 03 A/C)*: select the Supercell chip → pre-filled panel → 4×4×1 → "replays 3 downstream steps" → replay streams progress; the manual-edit chip flags stale and offers re-map/skip/fork.
4. **AI-assisted defect** *(mockup 04)*: "substitute one surface Si with P and pin the bottom two layers" → clarifying chip (which site?) → Proposal Card (2 ops, digest, ghost diff) → Apply all → two ordinary chips with ✦ badges and the prompt stored.
5. **Combinatorial screen at 100 materials**: Sets › Combinatorial (same XYZ syntax, cap honored) → predicted "→ 100 materials (set)" → one virtualized set folder + one set chip on the source; bulk export/delete/tag on the folder.
6. **Share read-only** *(mockups 05/06)*: Share → Link → read-only scope → the URL encodes the recipe; the receiver gets the MaterialGeometry view with provenance dots and "Open in Designer."
7. **Code round-trip**: Timeline → Copy as script → Console › Script → edit in REPL → run → results sync back per the #294 contract → new `repl`-engine chips.

---

## 10. Extension specs

### 10.1 Parametric provenance — the Timeline

Vertical rail between Viewport and Inspector, collapsible to a 48 px dot strip.

- **Anatomy**: lineage breadcrumb → chips in creation order → NOW → export row ("⌁ Copy as script · ⇩ Export recipe"). Chip = icon · label · params digest · engine badge · status dot · result delta on hover. **Step 0 is always the origin** ("Created: Si (Standata)" / "Imported: quartz.poscar · hash"); Reset becomes "revert to step 0."
- **Interactions**: click = select (summary + Edit parameters); drag scrubber = **time-travel preview** (banner: "Viewing step 2 of 4 — Return to latest · Fork from here"; the past is never silently editable); context menu = Edit · Disable (suppress; downstream replays without it) · Duplicate · Copy as code · Fork from here · Flatten (explicit "loses parametricity") · Delete (with downstream impact).
- **Manual chips** coalesce consecutive gestures, are not re-parameterizable, and resolve invalidation explicitly.
- **Set-producing chips** live on the source material and deep-link to the set folder; each child's timeline starts with "Derived by …".
- **Replay determinism**: native ops recompute exactly; notebook/AI steps replay pinned versions and hash-check outputs — a mismatch flags the chip rather than substituting a different result.

### 10.2 The Catalog

- **Categories**: Create (Standard library · From file · From code) · Build (Supercell, Slab/Surface, Interface/ZSL, Nanoribbon, Grain boundary…) · Defects (vacancy, substitution, interstitial, passivation) · Sets (Combinatorial, NEB, Perturbation) · Properties (Boundary conditions, Constraints, Conventional cell, Periodicity) · Code (REPL snippets, user scripts, blank notebook) · Recents pinned.
- **Card contract**: icon · name · one-liner · engine badge (NATIVE = instant preview · NOTEBOOK = sandboxed run, seconds · CODE = opens Console · AI = generative) · input requirements · **disabled-with-reason**.
- **Operation Panel contract**: parameter form with units and inline validation, symmetry-aware fields, "last used" recall · live preview (ghosts + dashed result cell; above ~2 000 atoms degrade to outline + counts; counts-only beyond) · predicted output line · Apply (= exactly one chip) / Cancel. Notebook panels render a generated form when the notebook declares parameter metadata; otherwise an inline run cell with progress and an honest "preview unavailable — predicted count only."
- **Entry points**: Navigator + New · ⚡Transform · ⌘K type-through · Assistant · empty states. Zero-results → "Ask the Assistant."

### 10.3 The Assistant

Right flyout (✦, ⌘J); also hooked into ⌘K zero-results, error toasts ("explain this failure"), and the selection context menu ("explain selection").

**The loop: suggest → preview → apply → recorded.** A Proposal Card carries: restated interpretation · the compiled operation list (each row a real Catalog op with params, or a sandboxed snippet for uncovered cases) · predicted digest · ghost-diff preview toggle · Apply all / Step-by-step / Edit as code / Discard.

**Guardrails (design commitments):** never auto-applies; compiles only to the whitelisted op vocabulary or dry-runs code on a copy in the sandbox; oversized results require explicit confirmation; applied steps are ordinary, undoable history tagged ✦ with the prompt stored; "explain" answers cite facts computed by the same analysis code the Inspector uses; ambiguity produces one inline clarifying question with option chips, not a guess.

### 10.4 Sessions, sharing & embed

- **Autosave, always**; embedded mode shows a second, distinct state ("Platform save pending · ⌘S" → the host's injected save flow). Restore-on-refresh kills v1's biggest trust gap.
- **Sessions are documents**: named, listed, renamed, duplicated; they hold materials + logs + view settings + Console state.
- **Share dialog**: Link (Editable copy / Read-only viewer × Whole session / Current material; **the link encodes the recipe** with an explicit coordinates-only fallback) · Embed (iframe snippet with mode/theme/chrome params) · Download (JSON/POSCAR; zip for multi — the parity home of Export).
- **Theming**: one token set, dark default, full light parity; embeds override tokens. *(Proven in mockup 06 by forcing one frame light.)*

---

## 11. Interaction systems

- **Keyboard, two layers.** Global chords: ⌘K · ⌘J · ⌘Z/⇧⌘Z · ⌘S · [ / ] cycle materials · Alt+1…5 panels · ? shortcuts · Esc. Viewport-focused (visible focus ring): A select-all · G move · R rotate · D duplicate · X delete · M measure · F frame · digits = camera presets. The shortcuts overlay is app-owned and mode-aware. No bare-letter global hotkeys that steal typing (v1's Shift+U/D bug class is structurally excluded).
- **Palette**: sections (Actions · Create/Transform · Materials · Steps · Sessions · Library · Help); argument parsing; "go to step"; zero-results → Assistant.
- **States**: dirty = revert-aware per-material dot; saved = session chip + status bar; empty states for no-materials, fresh timeline, filtered-empty, first Console open; errors carry "explain this failure."
- **Onboarding**: one skippable 60-second guided first build through real ops; contextual one-time tips (max one per session); "?" menu with shortcuts/docs/tour/samples. Never on embed modes.
- **Accessibility**: the basis table is the canonical accessible projection of the canvas; roving tabindex in Navigator/Timeline; aria-live announcements; every op reachable without pointer (select-by-species/range replaces marquee); AA contrast in both themes; color-blind-safe element palette option; reduced motion honored.
- **Responsive**: ≥1440 full layout · 1024–1439 Timeline auto-collapses to dots · 768–1023 Navigator/Inspector become edge-tab drawers · <768 viewer-only. Picker fixed ~480×640.
- **Scale**: virtualized Navigator and basis table; the preview degradation ladder; set operations stream progress with cancel; timeline chips lazy-load.

---

## 12. Functionality parity matrix

Every v1 capability and its v2 home. **Nothing is silently dropped**; two items are explicitly rebuilt/retired (⟲/†).

| v1 (where) | v2 home |
|---|---|
| Import via host modal (I/O menu) | ☰ app menu + palette; host-injected, self-disabling — unchanged contract |
| Import from Standata (74 configs) | Catalog › Create › Standard library; Picker mode |
| Upload from disk (POSCAR/JSON) | Catalog › From file + global drag-and-drop with format sniff; CIF/XYZ when made.js implements the stubs |
| Export JSON/POSCAR, all-items | ☰ › Export + Share › Download; zip bundling for multi (closes the v1 TODO) |
| Save / Exit (host-injected) | ☰ + ⌘S; embedded save-state chip *(mockup 05)* |
| Undo / Redo (Edit menu) | One unified stack = Timeline steps; Workspace Bar buttons + ⌘Z everywhere |
| Reset | Timeline › revert to step 0 (explicit, previewable) |
| Clone | Navigator context menu + palette (recorded as a fork-origin chip) |
| Use Conventional Cell | Inspector › Structure › Cell, recorded as an op |
| Toggle isNonPeriodic (incl. saved-material guard) | Inspector › Structure › Periodicity; the guard becomes disabled-with-reason |
| View menu panel toggles + JupyterLite drawer | Alt+1…5 layout toggles; drawer → Console › Notebook |
| Supercell dialog (3×3 matrix, det≠0) | Catalog › Build › Supercell → Operation Panel with live preview *(mockup 02 B)* |
| Surface/slab dialog (hkl, layers, vacuum, vx/vy; bulkId metadata) | Catalog › Build › Slab/Surface panel; provenance replaces ad-hoc metadata |
| Boundary conditions dialog (pbc/bc1/bc2/bc3 + offset) | Inspector › Structure › Boundary conditions (also a Properties card) |
| Combinatorial set dialog (XYZ syntax, cap, naming) | Catalog › Sets › Combinatorial; same syntax; result = set folder + set chip |
| Interpolated set / NEB dialog | Catalog › Sets › NEB; endpoints picked in-panel (any two materials, not "i and i+1") |
| JupyterLite Transformation (materials_in/out) | Catalog cards with NOTEBOOK badge → panel with inline run; same postMessage contract |
| Python REPL (#294) | Console › REPL, same contract; sync-backs recorded as `repl` chips |
| Lattice form (type/a/b/c/α/β/γ, units, scale-vs-preserve) | Inspector › Lattice + **3×3 vector toggle** + **symmetry locking un-stubbed** (both v1 TODOs) |
| Basis XYZ text w/ constraints, validation, crystal/cartesian | Basis table (per #299) + code toggle; constraint columns; units go global; same made.js validation |
| wave.js: selection, gizmos, add/clone/delete atoms | Viewport (canvas) + app-owned Viewport Toolbar |
| wave.js: bonds/labels/repetitions/camera/ortho | Viewport Toolbar + Inspector › Display (view settings, not history) |
| wave.js: measurements (distance/angle/copy coords) | Measure tool + Selection tab readouts; Status Bar echoes |
| wave.js: screenshot / figure / GIF export | Viewport Toolbar › Snapshot group |
| wave.js: keyboard sheet | App-owned "?" shortcuts overlay (mode-aware) |
| Materials list rows: rename, formula, saved badge, delete | Navigator rows: inline rename, meta, host-persisted badge, undoable delete, modified dot |
| Shift+U/D material cycling (broken while typing) | [ / ] chords with field-focus guards |
| Fullscreen (broken), footer (empty) | Modes replace fullscreen-as-hack; Status Bar fills the footer |
| ⟲ Multi-material 3D combine (removed with wave's Outliner) | **Combine v2, MD-native**: 2-input Catalog card (pick B, offset in crystal/cartesian, atom-count preview, merge via made.js) — per wave decision D-2, on the operation/preview rails this design provides |
| † Polymer/Nanotube placeholders, orphaned Pyodide dialog | Retired; their intents live as Catalog categories fed by notebooks/code |

**New beyond v1**: provenance timeline + history-as-script + recipes · live previews · lineage navigation + set folders · Assistant · sessions/autosave · share links · embed/viewer/picker modes · light theme · a11y baseline · symmetry-locked lattice editing · 3×3 vectors · zip export · global units mode · select-by-species/range.

---

## 13. Mockup guide

`mockups/` — self-contained HTML; dark/light toggle (persisted, `?theme=` deep-link); state switcher on multi-state screens (`?state=`); numbered annotation pins with a collapsible legend; one narrative dataset throughout (session "Silicon slab study": Si bulk → Si(111) slab 4L → ×3×3 supercell → P-substituted, constrained; SiO₂ upload; a 12-material P-substitution set).

| Screen | Proves |
|---|---|
| [`index.html`](mockups/index.html) | The vision, the principles, the map |
| [`01-workspace.html`](mockups/01-workspace.html) | The whole IA at rest; chrome boundary; unified undo; status truth |
| [`02-catalog.html`](mockups/02-catalog.html) | D5 in action; engine badges; disabled-with-reason; ghost preview + predicted result; the pending chip |
| [`03-timeline.html`](mockups/03-timeline.html) | D1/D3 in action; chip anatomy; edit-past + replay; safe time-travel; stale resolution; history-as-script |
| [`04-assistant.html`](mockups/04-assistant.html) | The proposal contract; clarifying questions; ghost diff; guardrails; AI steps as ordinary history |
| [`05-sessions.html`](mockups/05-sessions.html) | Autosave; sessions as documents; recipe-encoding links; dual save states when embedded |
| [`06-modes.html`](mockups/06-modes.html) | The four costumes; the mode matrix; theme parity (one frame forced light) |

The viewport is a static SVG of a real computed Si(111) slab standing in for wave.js; everything else — layout, chrome, both themes, interaction patterns — is the actual design.

---

## 14. MVP and roadmap

### 14.1 The MVP — the smallest honest slice (~9–10 engineer-weeks)

The MVP must include the operation-log spine — without it the result is #299 with a facelift, not 2.0. Everything else is cut or borrowed:

**In:** one operation log + unified undo (adopting wave's `onEditCommit`, already in the pinned `2026.8.19-0`) · the new shell (Workspace Bar + ☰, tokens) · Navigator with lineage indent + the combinatorial set-folder case · **read-only Timeline** (chips + click-to-revert; no edit-past/replay yet) · Inspector porting the lattice form + the #299 basis table · the 5 dialogs as non-blocking Operation Panels with **predicted-count lines** (no ghost previews) · Catalog-lite (searchable list, not the card gallery) · Console dock wrapping the JupyterLite drawer + the #294 REPL · autosave/restore (already spec'd in the #299 follow-ups) · the embed contract untouched.

**Out (deferred, not lost):** edit-past/replay + stale resolution · ghost previews · Assistant · share links · sessions beyond autosave · viewer/picker modes · history-as-script · light theme · 3×3 vectors + symmetry locks · editor→3D selection sync.

| Workstream | Estimate | Notes |
|---|---|---|
| Operation log + unified undo + state-layer rebuild | 2 wks | The 14 existing reducer functions map ~1:1 to op types; also replaces the ref-based `useUndoableState` and the `JSON.stringify` compare (both documented traps in `plan/upcoming/bugfixes-2026-08-29.md` on #299) |
| Shell, tokens, Workspace/Status bars, palette | 1 wk | Status bar, palette, resizable panels lift from #299 |
| Navigator v1 | 0.5 wk | |
| Read-only Timeline + revert | 1 wk | |
| Inspector port (lattice + basis table/text) | 1 wk | |
| 5 Operation Panels + predicted counts + Catalog-lite | 1.5 wks | Same made.js calls, same validation, new chrome |
| Console dock + autosave | 1 wk | |
| **Cypress migration** | 1–1.5 wks | The hidden long pole: the suite selects menu items by ordinal position; retiring menus breaks nearly every UI spec |
| Embed-contract smoke + integration fixes | 0.5 wk | |

**Staffing scenarios:** one developer ≈ 2–2.5 months · two parallel tracks (spine vs. shell) ≈ 5–6 calendar weeks · this team's AI-assisted mode (parallel agent branches in the style of #285–#297, human review as the bottleneck) plausibly ≈ 3–4 calendar weeks.

**MVP-specific risks:** (a) suppressing wave.js's internal undo may need a small wave PR + release if no prop exists — a day of code but a cross-repo release cycle; (b) the spine touches every editing path, which is why it ships first as an invisible, test-guarded step; (c) the Cypress ordinal coupling above. The degenerate "skip the spine, just reskin" MVP (~5–6 wks) is a false economy: it re-buys the dual-undo debt into the new chrome.

### 14.2 Phases (capability-based; each independently shippable)

- **Phase 0 — Spine (invisible).** Operation log + unified undo + shared SelectionModel bridged behind the current UI; wave's `onEditCommit` adopted; viewer history disabled/bridged; state layer rebuilt. *Exit: one ⌘Z everywhere; no visible UX change; existing tests green.*
- **Phase 1 — Shell.** Workspace regions + tokens (dark/light), Navigator with lineage + set folders, Status Bar, palette v2, ☰ replacing five menus. *Exit: navigation/command parity; Cypress off menu ordinals.*
- **Phase 2 — Catalog.** Operation Panels with previews replace the modals; notebook-op metadata contract; Console unifies REPL/Notebook/Script/Log; Combine v2. *Exit: no blocking transform modals; notebook workflows visible as cards.*
- **Phase 3 — Provenance & sessions.** Timeline UI over the Phase-0 log (edit-past, replay, fork, script export); autosave + sessions; share links; viewer/embedded/picker modes. *Exit: refresh-restore; a shared read-only link renders the MaterialGeometry-grade view.*
- **Phase 4 — Assistant & polish.** Proposal loop; onboarding; a11y completion.

**The MVP maps onto the phases as:** Phase 0 in full + most of Phase 1 + Phase 2 minus previews + the autosave slice of Phase 3.

### 14.3 Greenfield vs. evolve — decision inputs (deliberately open)

The React 17 pin is shared with cove and wave.js peers (`--legacy-peer-deps` in CI, `npm-link-shared` in prestart), and five components rely on `UNSAFE_componentWillReceiveProps` — evolving requires a coordinated three-repo React upgrade around Phase 1. Greenfield decouples that but must re-earn the Cypress suite and the platform embed contract from day one. **Phase 0 is identical under both answers, which is why it goes first** — the decision can be taken after Phase 0 with better information.

**Track relationship:** v1.x (#299) ships now and keeps shipping; 2.0 absorbs its concepts rather than reverting them; the follow-ups recorded on #299 (session persistence, rename-back marker, shallow-compare fix) are Phase 0/3 items here and land on either track without waste.

---

## 15. Risks and open questions

1. **Replay determinism of notebook/AI ops** — pinning + output hashing flags mismatches, but long-lived recipes crossing tool upgrades need a policy (freeze vs. migrate).
2. **Manual-patch invalidation** — re-map-by-proximity heuristics need tuning on real edits; the escape hatches (skip/fork) must stay one click away.
3. **wave.js chrome extraction vs. wrap** — moving toolbar/status/inspector to the app either lands upstream in wave (preferred; wave's spec already trends this way) or is wrapped via display-API suppression; a Phase 1 spike scopes it. The MVP needs only undo suppression (§14.1).
4. **URL recipe size** — logs compress well; imported-payload origins don't; mitigations: coordinates-only fallback + a server-side share id in platform mode.
5. **100-material set replay cost** — set folders virtualize the UI, but replaying a re-edited ancestor across a set needs batching and progress/cancel (designed in §10.1/§11; needs perf validation).
6. **Assistant vocabulary coverage** — the whitelist keeps it safe but bounds usefulness; "Edit as code" is the pressure valve; coverage should be telemetry-driven.
7. **Host theming constraints** — the token override API must satisfy the platform's brand without per-component forks.
8. **Migration of platform-saved materials** — they arrive without logs; step-0 "Imported" origins make them first-class, but bulk-open UX for dozens of hosted materials needs a pass with the web-app team.

---

## 16. Appendix

**Glossary:** Workspace Bar · Navigator · Viewport · Viewport Toolbar · Timeline · Inspector · Operation Panel · Console · Status Bar · Catalog · Command Palette · Assistant · Operation · Recipe · Set folder · Costume/mode.

**Keyboard map (summary):** ⌘K palette · ⌘J assistant · ⌘Z/⇧⌘Z undo/redo · ⌘S save · ⌘E export · [ / ] cycle materials · Alt+1…5 panels · ? shortcuts · Esc close/deselect · Viewport: A/G/R/D/X/M/F + digits.

**Sources:** full v1 functionality and architecture inventories (this session, `src/` @ `9660a81`); `UIUX_IMPROVEMENTS.md` + `mockups/` (brainstorm branch); PR #299 (+ `plan/upcoming/bugfixes-2026-08-29.md`); PR #294 (REPL contract); wave.js `2026.8.19-0` typings (`onEditCommit`, selection events, controlled-selection TODO); README §2.2 TODOs — each absorbed, closed, or explicitly retired by this design.
