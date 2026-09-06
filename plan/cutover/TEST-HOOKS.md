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
- **The viewport needs software rendering.** A headless container has no GPU, so wave.js fails on
  "Error creating WebGL context" before any assertion runs. `cypress.config.ts` now passes
  `--use-gl=swiftshader` for chromium browsers, which is what the Playwright smoke already did.

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
