# In-flight work reconciled against the MD 2.0 cutover

Recorded 2026-09-05. Re-run the sweep at every phase boundary — `git ls-remote --heads` plus the
open-PR list for **every repo touched**, not just the default branches. An earlier survey that read
only default branches concluded "pyodide-repl is a README-only stub"; it is in fact a complete
package on four unmerged branches, and the same blind spot hid cove's two live branches and MD's
fifteen open PRs.

## materials-designer

| PR | Branch | Disposition | Why |
|---|---|---|---|
| **#301** | `claude/md2-mvp-20260829-0936` | **Merge to `dev` first**, then rebase the cutover branch onto `dev` | Additive and green (v1 untouched); carries the design record — PROPOSAL, DESIGN-LANGUAGE, MVP-NOTES, 7 mockups, tokens + contrast suite. Closing it would strand those docs. Not ours to merge — needs the owner. |
| **#300** | `claude/md-ts-migration` | **Leave open, untouched.** Revisit once the parity ledger shows whether the cutover lands on schedule | It types the v1 code the cutover deletes, so merging it may be wasted work — but if the cutover slips, a fully-typed v1 is worth having. Do not rebase or build on it. Overlaps #299, which carries its own TS-porting commits. |
| **#299** | `claude/md-ux-consolidated` | **Do not merge. Harvest the `tests/` half; reimplement the functionality in 2.0** | Its `src/` half improves a v1 that is being deleted. Its *tests* are executable user stories for behaviour 2.0 already largely has. Harvested in this branch (below). Its three recorded follow-ups — session persistence, rename-back marker, shallow-compare fix — are already 2.0 items. |
| **#294** | `feature/SOF-7961-v1` | **Close as superseded** | Minimal Python REPL. The REPL now lives in cove (`feature/SOF-7961`: `PythonRepl`, `ReplConsole`, `PyodideSession`, `IframeTransport` + `InPageTransport`) and in the `pyodide-repl` deploy. Merging a third implementation into MD would be the wrong direction. |
| **#279** | `feature/SOF-7961` | **Close as superseded** | Same as #294 ("Material REPL"). |
| **#284** | `build/serve-tests-tarball-from-publish-dir` | **Prioritise** | Serving the tests tarball from the publish dir is exactly what cutover gate 2 needs — validating web-app against WIP tarballs of both packages before MD publishes. |
| **#296** | `feature/SOF-8034` | Triage with its author | Not yet assessed against the cutover. |
| **#263** | `feature/SOF-7685` | Triage with its author | Not yet assessed against the cutover. |
| #99–#108 | dependabot, codespaces, XYZ import | No action | Long-dormant; unrelated to the cutover. |

### What was harvested from #299

The `tests/` half only — no `src/` changes. These files are the Phase-2 specification: each one is
red against 2.0 today and turns green as its feature lands.

**Features (8)** — `tests/cypress/e2e/`:
`materials-list/filter-and-count.feature` · `materials-list/updated-marker.feature` ·
`source-editor/basis-table.feature` · `status-bar/status-bar.feature` ·
`toolbar/command-palette.feature` · `toolbar/control-availability.feature` ·
`toolbar/keyboard-shortcuts.feature` · `toolbar/quick-actions.feature`

**Step definitions (6 new, 1 modified)** — `I filter materials list` · `I use the command palette` ·
`I press key` · `I see status bar showing` · `I edit the basis table` ·
`material with index is marked as updated` · (M) `I set material basis and lattice with the following data`

**Widgets (3 new, 1 modified)** — `BasisTableWidget` · `CommandPaletteWidget` · `StatusBarWidget` ·
(M) `ItemsListWidget`

No new dependencies: every import resolves to `@badeball/cypress-cucumber-preprocessor`,
`@mat3ra/tede`, or a sibling widget. `tests/package.json`'s `@exabyte-io`→`@mat3ra` rename and its
8.9k-line lockfile were **not** taken — that rename already exists on this branch.

Some steps still name v1 surfaces (`.materials-designer-source-editor`, the `SourceEditor` panel
toggle). Their **bodies** get retargeted to 2.0 command IDs in Phase 3; the Gherkin phrases stay
frozen, because phrases — not implementations — are what other repos consume.

## cove — two live branches, neither ours to merge

| Branch | What it does | How MD relates |
|---|---|---|
| `feature/SOF-7961` (latest commit marked `[release]`, so a WIP tarball exists) | Moves the REPL into cove: `other/pyodide/PyodideSession.ts`, `other/repl/{PythonRepl,ReplConsole}.tsx`, and splits `IframeToFromHostMessageHandler` into `IframeTransport` + `InPageTransport`. 1,942 insertions incl. 699 lines of tests | MD's Console › REPL consumes it via the WIP tarball and codes against the transport interface. Fallback if it stalls: point the same tab at the live `https://jupyterlite.mat3ra.com/repl/index.html` via `IframeTransport` — a URL change, not a rewrite |
| `claude/designer-tokens-and-dark-palette` | `palette/designer.ts` (unit-type/canvas/node tokens), `palette/contrast.ts`, the `paletteDark` completion, `contrastText` fixes, `tests/designerTokens.tests.ts` | Already implements most of what this plan would have proposed. **Help land it rather than opening a competing PR.** It deliberately leaves brand hue alone — "gated on design/marketing sign-off (SOF-8024 portion 2 §2)" |

Still genuinely missing from cove, and worth one new PR: a root barrel + `exports` map (today
`main: dist/index.js` resolves to nothing and every consumer deep-imports `dist/…`), an RTL test
harness, gallery coverage for the 24 unlisted components, and an **array-preserving `shadows`** fix —
web-app reads `theme.shadows.mainShadow` in `MainLayout.tsx:39` and `PageContent.tsx:30`, so that
property must survive.

## pyodide-repl — built, unmerged

`feature/SOF-7961` (plus staged `-1-setup`, `-2-repl-and-bridge`, `-3-environment-and-completions`);
`main` holds only the README. 31 files: `session/PyodideSession.ts`, `bridge/`, `environment/madeProfile.ts`,
`completions/`, `ui/`, `app/MaterialsReplApp.tsx`, wheel provisioning, Netlify deploy, tests.
Publishes both an npm package (peers `react ^17` + `@mat3ra/cove` + MUI 5 — MD's exact stack) and a
deployable page. Wheels that cannot build under Pyodide (`pymatgen`, `spglib`, `pydantic`) ship
inside that deploy so **hosts never serve wheels** — which is what decides in-page vs iframe for MD's
Console: in-page for the light `made` profile, iframe against the deploy for the heavy one.

Confirm ownership before assuming any of this lands; none of it is ours to merge.

## Mat3rial D3sign → SOF-8024

The token set is going forward as the proposed canonical platform palette rather than staying
MD-local. It composes with cove's designer branch rather than competing: Mat3rial D3sign supplies
`palette` (surfaces/text/border/accent), that branch supplies `theme.designer.*` (unit types, canvas,
wires, nodes); both are validated by the same measured-contrast method. Nothing in the cutover waits
on the outcome — MD applies the tokens locally either way, and a hue change is an edit to
`tokens.ts` values re-validated by the existing suite.

### How the harvested specs are gated

They are tagged **`@parity_2_0`** and excluded from the default Cypress run in `tests/run-tests.sh`.
Untagged, they would have run against v1 on the next push and turned CI red — they describe
behaviour that does not exist yet. They are the parity specification, so they are meant to be red;
the tag keeps that from blocking everyone else. Run them deliberately with `TAGS='@parity_2_0'`,
and drop the tag from each feature as its implementation lands in Phase 2. When the last tag is
gone, parity is closed.
