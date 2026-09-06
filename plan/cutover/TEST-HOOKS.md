# Test hooks — the contract between the UI and the suites

v1's specs reach the UI by walking menus: `selectMenuItemByNameAndItemNumber("Advanced", 6)`. MD 2.0
retires the menu bar, so that coupling has to go — but it must go *without* changing anything other
repositories can see.

## What is frozen

web-app's Cypress suite globs MD's step definitions out of `node_modules`; **62 of its feature files
invoke MD's Gherkin phrases**, and its `MaterialDesignerWidget` subclasses ours. So these are a
published API:

- **The 57 Gherkin phrases**, verbatim, including their data-table column names (`| name | basis |`).
- **File paths** under `tests/cypress/support/step_definitions/` and `tests/cypress/support/widgets/`.
- **Public method names** on the widgets.
- **`window.MDState`'s shape** — `{ index, isLoading, materials, updatedIndices }`.

Phrases known to be used by web-app, with the number of its features that use each:
`I Run All Cells` (29) · `I create materials with the following data` (17) · `I upload files` (11) ·
`I see material designer page` (5) · `I create a surface with the following data` (3) ·
`I open Standata dialog` (2) · `I add boundary conditions with the following data` (1).

`scripts/check-test-contract.sh` fails CI on a rename or deletion in those directories unless a
commit on the branch says `[contract-change]`.

## What is free

Every **step-definition body** and every selector. Retargeting
`I create materials with the following data` from a menu walk to a command ID is invisible to those
62 features — which is the whole reason the cutover is safe.

## Command IDs

One registry in `src/shell/commands.ts`. Every trigger — menu item, palette row, toolbar button,
keyboard shortcut — carries `data-command="<id>"`, and `CommandsWidget.run(id)` is how specs invoke
one. IDs are stable; labels are not.

| Group | IDs |
|---|---|
| File | `file.import` · `file.save` · `file.exit` · `file.export-json` · `file.export-poscar` · `file.export-all` |
| Edit | `edit.undo` · `edit.redo` |
| Material | `material.new` · `material.clone` · `material.rename` · `material.remove` · `material.next` · `material.previous` |
| Create | `create.standard-library` · `create.from-file` |
| Operations | `op.supercell` · `op.surface` · `op.boundary-conditions` · `op.combinatorial-set` · `op.interpolated-set` |
| Structure | `structure.conventional-cell` · `structure.toggle-periodicity` |
| History | `history.revert-origin` · `history.edit-step` · `history.fork` |
| Console | `console.toggle` · `console.script` · `console.log` · `console.notebook` · `console.repl` |
| View | `view.toggle-navigator` · `view.toggle-timeline` · `view.toggle-inspector` · `view.toggle-console` · `view.theme` |
| Global | `global.palette` · `global.shortcuts` |

A command that cannot run reports why: `data-command-disabled-reason` carries the text, which is
what `toolbar/control-availability.feature` asserts.

## Test IDs

Regions: `data-testid="workspace-bar" | "navigator" | "viewport" | "timeline" | "inspector" |
"console-dock" | "status-bar" | "catalog" | "command-palette"`.

Rows and panels: `material-row-<index>` (1-based, the material's real index — it does **not**
renumber under a filter, which `materials-list/filter-and-count.feature` checks explicitly) ·
`timeline-chip-<step>` · `panel-<operation-type>` · `panel-apply` · `panel-cancel` ·
`console-<tab>` · `status-<group>`.

Preserved from v1 because existing specs select them: `#jupyter-lite-iframe` (and every JupyterLab
selector inside it) · `data-tid="materials-in-selector" | "materials-out-selector" | "select-material"` ·
`#basis-xyz` · both `#materials-designer` (MD's own `Page.ts`) and `.materials-designer`
(web-app's widget).

## Rule

A spec never selects by tag name, CSS class, DOM position, or visible label. Classes are styling and
change with the design language; labels change with the copy; positions change with the layout.
Command IDs and test IDs are the only supported handles, and they are chosen so that the flip is a
change of implementation rather than a change of contract.

## Running the parity specs (added 2026-09-06)

The suite drives both applications while they coexist. `cypress/support/app.ts` decides which:

```
cd tests && npx cypress run --env APP=v2,TAGS='@parity_2_0'
```

`APP=v2` points `MaterialDesignerPage.url` at `/v2.html` and switches the widgets to 2.0's
selectors; the default stays v1 at `/`, so every existing spec runs exactly as before. The whole
mechanism deletes itself at the flip, when v1 is gone and `/v2.html` becomes `/`.

Two environment notes, both of which cost an afternoon to discover:

- **The Cypress binary needs a resumable download here.** `npm install` fetched 188 MB of a 200 MB
  archive and failed the checksum. `curl -C - --retry` completed it, and the checksum then matched
  exactly — the artefact was fine, the transfer was not. Install with
  `CYPRESS_INSTALL_BINARY=/path/to/cypress.zip npx cypress install`.
- **Fixtures are Git LFS objects.** A clone made with `GIT_LFS_SKIP_SMUDGE=1`, or one where the
  smudge filter did not run, leaves them as pointer stubs, and specs fail with `cy.readFile ...
  failed` on a file that is plainly present. `git lfs pull` fixes it. CI checks out with
  `lfs: true`, so this only bites locally.
- **The viewport needs software rendering.** A headless container has no GPU, so wave.js fails on
  "Error creating WebGL context" before any assertion runs. `cypress.config.ts` now passes
  `--use-gl=swiftshader` for chromium browsers, which is what the Playwright smoke already did.
- **The notebook health-checks cannot run in this sandbox.** `https://jupyterlite.mat3ra.com`
  answers 200 to `curl`, but a browser's tunnel through the agent proxy is reset
  (`net::ERR_CONNECTION_RESET`), so the frame never loads. CI's Docker job is the authority for the
  53 `@notebook_healthcheck` features; locally, everything on MD's side of the bridge is covered by
  the smoke checks below, which speak the protocol at the app the way the frame would.

## What the parity specs say today

Run against 2.0 on 2026-09-06: **26 passing, 0 failing** — every harvested spec is green.

| Spec | Result |
|---|---|
| `toolbar/command-palette` | 4/4 |
| `toolbar/control-availability` | 3/3 |
| `toolbar/keyboard-shortcuts` | 3/3 |
| `toolbar/quick-actions` | 3/3 |
| `status-bar/status-bar` | 1/1 |
| `materials-list/filter-and-count` | 6/6 |
| `materials-list/updated-marker` | 2/2 |
| `source-editor/basis-table` | 4/4 |

They started at 3 passing. Closing the other 23 needed six product gaps filled — `window.MDState`,
the clone's name, the basis editor, the lattice form, the list's add menu, and the palette — plus
one crash the specs exposed that nothing else had: a Standard-library config carries an `external`
block that made.js accepts on the way in and rejects when serialising, so importing one and then
publishing `MDState` took the whole app down.


## Console › Notebook (added 2026-09-06)

The notebook surface keeps v1's DOM contract on purpose, so the 53 generated health-check features
and the four `.ftl` templates need **no change at all** — one step body moved, and nothing else:

| Handle | Where it is now |
|---|---|
| `#jupyterlite-transformation-dialog` | the Notebook tab's root |
| `iframe#jupyter-lite-iframe` | `kit/BridgedIframe`, opened at `made/Introduction.ipynb` |
| `[data-tid='materials-in-selector']` / `[data-tid='materials-out-selector']` | `domain/console/MaterialsSelector` |
| `[data-tid='select-material']`, `.MuiChip-root`, `.MuiAutocomplete-popper` | unchanged MUI markup |
| `#jupyterlite-transformation-dialog-submit-button` | the "Add to session" button |

What changed, and why each change was safe:

- `I open JupyterLite Transformation dialog` now calls
  `MaterialDesignerWidget.openJupyterLiteTransformation()`, which runs `console.notebook` under
  `APP=v2` and keeps the Advanced-menu path for v1. The phrase and the widget's method names are
  untouched.
- `I select materials in MaterialsSelector` clears the selection instead of removing a chip named
  "Silicon FCC". The old body assumed the surface always opened on the first material in the list;
  2.0 opens on the material you are looking at.
- `deselectAllMaterials()` removes the first chip and re-queries until none are left. Chip labels
  carry their own position (`0: Silicon FCC`), so collecting names up front and deleting them one
  by one worked for a single chip and silently missed the rest.

Two behaviours are load-bearing rather than cosmetic, both because the templates open the surface
up to three times in one scenario and assert `Introduction.ipynb` each time: the frame is mounted
only while the tab is showing, and "Add to session" closes the console. Together they reproduce
what a modal did by being unmounted.

## Reaching a command that has no button (added 2026-09-06)

Most operations have no permanent trigger — that is the point of a registry. `CommandsWidget.run`
therefore looks in three places, in the order a person would:

1. a visible `[data-command="<id>"]` — the quick-action row, the panel toggles, the console tabs;
2. the **Catalog**, opened by clicking, whose cards now carry the id of the command they are the
   face of;
3. the **command palette**, which lists the whole registry, for everything else — undo, reset,
   the view toggles.

The palette is opened for (3) by dispatching the chord at the document rather than typing it.
`cy.type` sends keys to whatever holds focus and the registry ignores chords typed into a field —
correctly, and `toolbar/keyboard-shortcuts` exists to pin that. A step whose intent is "run this
command" should not fail because the previous step left the cursor in a text box, so
`CommandPaletteWidget` has both: `openWithShortcut()` for the keyboard specs and `open()` for
everything else.

Two conventions came out of this, and both replace a bespoke id per dialog:

- every operation panel is `#panel-<type>` (`#panel-supercell`, `#panel-boundary-conditions`, …),
  rendered by `PanelFrame` from the operation it configures;
- its footer buttons are `[data-testid="panel-apply"]` and `[data-testid="panel-cancel"]`.

## What the v1 suite says against 2.0

The eight specs CI actually gates on, run with `--env APP=v2`. All eight pass, with **no feature
file changed** — only step-definition bodies and widget selectors, which is the whole point of
freezing the phrases rather than the implementation.

Closing them turned up seven defects that nothing else had caught — every one in the product,
not in the specs:

| What the spec found | Where it was |
|---|---|
| A step could be recorded that produced a material nothing could serialise. made.js validates lazily, so `apply` succeeded and the 3D view crashed several frames later, cloning it on a prop change. | `core/session.ts` — the write path now serialises before recording, so the edit is refused with a reason instead |
| Set children were appended to the end of the list; v1 inserted them after the material they came from, which is what the fixtures count on | `core/session.ts` |
| The standard library listed file names (`C-[Graphene]-HEX_[P6%2Fmmm]…json`) instead of material names | `domain/StandataPanel.tsx` |
| Choosing a Bravais type left the previous type's angles in the form, producing a lattice that contradicted its own symmetry | `domain/inspector/LatticeForm.tsx` |
| Reset reverted the active material; v1's Reset restored the whole session and emptied the undo stack | new `edit.reset` command |
| Clearing the basis text box committed a material with no atoms | `domain/inspector/BasisEditor.tsx` |
| `external` was being stripped from every imported config on the theory that made.js could not serialise it. It can: exactly **one** of the seventy-three library entries names an `external.source` outside the schema's enum, and dropping the block from all of them cost the other seventy-two the provenance the specs assert on | `core/io.ts` — `toImportableConfig` now drops it only when it is what makes the config unusable, with a test that pins the count |

## Porting the browser smoke into Cypress (added 2026-09-06)

The Playwright smoke was the MVP's oracle because Chromium happened to be pre-installed; the plan
always had it becoming Cypress features so CI would run them. What it covered and nothing else did
is now six features, all `@parity_2_0` because they describe behaviour v1 does not have:

| Feature | What it pins |
|---|---|
| `timeline/edit-a-past-step` | a transform is forecast before it is applied; editing step 2 replaces it in place, replays what follows, and costs one undo |
| `timeline/one-undo-stack` | an edit from a panel and an edit from the Inspector are one history — v1 had two stacks |
| `session/autosave-and-restore` | work survives a reload, the app says it was restored, and "start fresh" discards it |
| `sets/combinatorial` | a batch folds into one set folder beside its source and one Cmd+Z removes it |
| `console/repl` | switching console tabs leaves exactly one frame mounted |
| `menu/input-output/import-review-cancel` | nothing enters the session until you say so |
| `session/drag-and-drop` | a drop imports directly; a drag that leaves takes its overlay with it |

Three things learned writing them, all worth keeping:

- **The save chip cannot gate a reload.** It reads "Saved · just now" for the save *before* a change
  as readily as the one after, so a spec that waits for it still races the debounce. The step reads
  the autosaved payload instead, which is both a reliable wait and the assertion the scenario is
  actually about.
- **`CombinatorialPanel` was the one panel not on the `#panel-<type>` convention** — it predates
  `PanelFrame` and rolled its own footer. It carries the id and the `panel-apply` / `panel-cancel`
  hooks now, so every panel is addressed the same way.
- **Two step definitions can claim the same sentence, and only a run finds out.** A new
  `I do not see the {string} panel` for operation panels collided with the existing one for
  regions, and cucumber reported it on `toolbar/quick-actions` — a spec that had nothing to do with
  either change. `scripts/check-test-contract.sh` now fails on a duplicate phrase, so the clash is
  caught where it was written.

The Playwright script stays until the remaining checks (viewport selection sync, drag-and-drop,
theme) have features of their own; it is not in CI, and `npm run test:md2-smoke` runs it locally.

## Both suites, side by side

Run on 2026-09-06, after the retarget:

```
# MD 2.0 — everything CI would gate on, harvested specs included
npx cypress run --env APP=v2,TAGS='not @ignore and not @quarantine and not @notebook_healthcheck'
                                                          # 37 passing, 0 failing, 57 pending

# v1 — what CI runs today, unchanged
npx cypress run --env TAGS='not @ignore and not @quarantine and not @notebook_healthcheck and not @parity_2_0'
                                                          # 8 passing, 0 failing
```

The 57 pending are the tag-filtered health-checks and the `@ignore`d specs, exactly as in CI.

That v1 still passes is the point: every change so far is additive, and the same step definitions
drive both applications until the flip removes the need for the switch.
