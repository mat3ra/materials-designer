# MD 2.0 MVP — what was built, what it proved, what it cost

Companion to [`PROPOSAL.md`](PROPOSAL.md). Written at the end of the build session so the
estimate in §14.1 can be checked against what actually happened.

**Where it lives:** `src/v2/`, served at `/v2.html` by the existing dev server (`npm start`).
The v1 app at `/` is untouched — verified running, 6 menus, `window.MDState` intact, no console
errors — so the Cypress suite keeps passing and the platform embed contract is unchanged.

---

## 1. What the MVP set out to test

The proposal rests on one claim: **making every edit a recorded operation** dissolves v1's two
competing undo stacks, makes provenance visible, and turns transforms into previewable,
non-blocking panels. That is cheap to falsify in code and expensive to argue about on paper.

**It holds.** The evidence is `tests/playwright/md2-smoke.mjs` — 23 checks driving a real browser
against the real domain layer (made.js maths, wave.js WebGL, cove) — plus 29 unit tests over the
spine. Both suites are green. The load-bearing checks:

| Claim | How it is checked |
|---|---|
| Every edit is one recorded step | A supercell applied through a panel and a conventional-cell edit from the Inspector each add exactly one Timeline chip |
| One history, whatever the surface | The same `Cmd+Z` undoes both, in order, and stops at the origin; `Shift+Cmd+Z` redoes |
| Preview before commit | The panel reads `→ 2 → 16 atoms · 1 material` before Apply, and the viewport stays visible and orbitable while configuring |
| Sets are lineage, not list spam | A combinatorial batch collapses into one folder row under its source, and **one** undo removes the whole batch |
| Three projections, one selection | Clicking an atom in the 3D canvas updates the app's status bar (`1 of 2 selected`) |
| The recipe is the artifact | The Console's Script tab renders the log as runnable Python |
| A refresh does not cost the session | Reload restores 16 atoms and says so, with a "Start fresh" escape |
| One token set, two themes | Light theme renders across the app chrome |

## 2. What shipped

**Spine** (`src/v2/state/`, 29 unit tests) — `Operation`/`MaterialDoc`/`Change` types; a registry
wrapping made.js (supercell, surface, boundary conditions, conventional cell, periodicity, basis,
lattice, manual patch, origins, set markers) with `label`/`digest`/`predict`; `replay(log, upTo)`
with identity-keyed caching; pure session reducers with one undo stack, gesture coalescing, fork,
revert-to-step and set-producing composites; localStorage autosave of **logs, not structures**
(a 432-atom supercell costs a 3×3 matrix on disk — asserted at < 8 KB).

**Shell** (`src/v2/shell/`) — Workspace Bar, Navigator (lineage tree + set folders + revert-aware
modified dot), Viewport (wave.js via `onEditCommit`), Timeline (chips, engine badges, deltas,
revert, fork), Inspector (structure facts, conventional cell, periodicity, basis text), Console
dock (Script + Log live), Status Bar, and one token set for dark/light.

**Panels** (`src/v2/panels/`, `src/v2/shell/*Panel.tsx`) — Supercell, Slab/Surface, Boundary
conditions, Combinatorial set, Standard library; each with v1's defaults and validation plus a
predicted result. Catalog-lite with engine badges and disabled-with-reason entries.

## 3. What was deliberately left out

Ghost-atom previews (the panels predict numerically, they do not render the result); edit-a-past-
step with downstream replay and stale resolution (the Timeline reverts and forks, it does not
re-parameterise); the Assistant; share links and named sessions beyond a single autosave; the
read-only viewer and picker modes; editable lattice fields with symmetry locking; the 3×3 vector
form; NEB interpolation; file import/export; REPL and Notebook docking (both are labelled
not-wired in the Console rather than faked).

## 4. Findings that change the plan

1. **`onEditCommit` and `onSelectionChanged` already exist in the pinned wave.js (`2026.8.19-0`).**
   The proposal treated adopting them as future work and the earlier UIUX plan treated a wave
   release as a P0 gate. Neither is true: the canvas/app contract is available today, and v1
   simply never used it (it still listens on the legacy `onUpdate`). **This removes the MVP's
   biggest external dependency.**
2. **Wave still owns chrome the app should own.** There is no prop to hide its toolbar or its
   internal undo/redo buttons, so the MVP defensively ignores `onEditCommit` with
   `source: undo|redo` — MD's history stays authoritative, but a user pressing wave's own undo
   button will desync the canvas from the app until the next prop push. Fixing this properly
   needs a wave-side prop (`chrome`/`showToolbar`/`historyMode`). **This is now the only
   wave-side ask, and it is smaller than the "extract all chrome" spike the proposal sized.**
3. **Wave does not follow host theming.** It wraps itself in its own dark theme, so in light mode
   the canvas stays dark. Cosmetic in the MVP, but the mode matrix promises host-token theming
   for embeds, so it belongs in the same wave-side conversation as (2).
4. **Selection has wave-side preconditions.** Picking requires the viewer to be interactive *and*
   in edit mode. The design's "click an atom, see its basis line" needs the app to drive those
   modes rather than leaving them to the user — a small addition, but it was not in the plan.
5. **`CombinatorialBasis` returns bare arrays.** Its configs carry plain `elements`/`coordinates`
   with no lattice, so children must be rebuilt via `Basis.fromElementsAndCoordinates` against the
   source cell — exactly what v1's dialog did. Passing the raw config to `new Material(...)` fails
   schema validation at replay. Any set-producing operation needs this adapter.
6. **ESSE schemas must be registered before any `toJSON()`/`clone()`.** Unit tests need the same
   bootstrap the standalone host does; without it replay fails with
   `ESSE schema not found: material-enhanced-hashed`. Worth documenting for anyone testing
   made.js in isolation.
7. **The lint gate does not see `.jsx`, but does see `.ts(x)`.** The bugfix memo on #299 predicted
   this; writing v2 in TypeScript meant the pre-commit hook caught four real errors (including a
   use-before-define and a strict-null violation) that the equivalent `.jsx` files would have
   sailed past. An argument for the TS migration independent of the redesign.

## 5. Effort, measured against the estimate

§14.1 priced the MVP at **9–10 engineer-weeks**, with a note that this team's AI-assisted mode
might reach 3–4 calendar weeks. This session produced the spine, the shell, five panels, the
catalog, sets, the standard library, 29 unit tests and a 23-check browser suite in **roughly two
hours of agent time** (one parallel subagent for the panels).

The honest reading is not "the estimate was 20× too high":

- The **Cypress migration (1–1.5 wks)** was avoided entirely, not done, by building beside v1
  rather than replacing it. It comes due the moment v2 becomes the default.
- Ghost previews, replay-of-past-steps and the notebook/REPL docking — the parts that need care
  rather than typing — are all still ahead.
- What was written is a **skeleton that stands up**, not a shippable product: no error taxonomy,
  no perf work on large structures, thin a11y, no design QA, no review.

A fair revision: the *scaffolding* is far cheaper than estimated; the *finishing* is not. Plan
Phase 0 + Phase 1 in days rather than weeks, and keep the original estimate for everything with a
correctness or UX-quality bar attached.

## 6. How to run it

```bash
npm install --legacy-peer-deps     # CI uses the same flag
npm start                          # v1 at /, MD 2.0 at /v2.html
npm run test:unit                  # 29 spine tests
npm run test:md2-smoke             # 23 browser checks (needs the dev server up)
```
