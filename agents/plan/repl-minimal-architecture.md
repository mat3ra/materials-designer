# Minimal Materials REPL — architecture memo

2026-08-24 · SOF-7961 · after review refused MD #279 / cove #96 as too large.
**Status: v1 built — PR #294 (branch `feature/SOF-7961-v1`). Each temporary in the code carries a
`TODO(repl-vN)` marker pointing at the ladder in §5 — `grep -rn "TODO(repl-" src scripts` lists them.**

## 1. The one-minute version

The REPL is four parts:

1. **Interpreter** — Pyodide (CPython→wasm), loaded once per page from CDN, kept for the session.
2. **Environment** — the `mat3ra.made` toolchain: NumPy/SciPy from Pyodide, PyPI pins, plus five
   prebuilt wheels (pymatgen, spglib, pydantic…, **9.7 MB**) that pip cannot build for the browser.
   The only genuinely hard part.
3. **Surface** — a drawer with editor, Run, plain output.
4. **Sync** — before each run the designer's materials become `materials_in`; after each run every
   public `Material` variable flows back, merged under a replaceable `python-repl` scope.

v1 ships exactly these four parts: **1 repo (MD), ≈8 files, ≈400 lines, 0 cove/AX changes** —
reusing components cove already publishes (CodeMirror, ResizableDrawer).
Autocomplete, editable environments, preloading, cove/AX extraction: separate PRs after.

## 2. One run, end to end

User Shift+Enter → JS pushes `materials_in` / `material` into interpreter globals → user code runs
in the persistent namespace (stdout captured; exception text is the output) → ~20 lines of Python
scan public `Material` variables to `{name, config}` JSON → `materialsSyncScope` reducer merges →
list + 3D viewer update.

**The one invariant (syncScope):** round-tripped results (`_id` present) upsert in place; REPL-created
ones are tagged `python-repl` and replace the previous batch (re-runs never duplicate); everything
outside the scope is untouched. The tag is runtime-only, never exported to ESSE.

## 3. Moving parts and end-state owners

| Part | End-state owner | In v1 |
| --- | --- | --- |
| Pyodide loader | cove, once it accepts an `indexURL` | ~25 lines in MD — cove's loader omits `indexURL`; under this app's node polyfills Pyodide then resolves assets to a filesystem path (caught by the e2e) |
| Environment recipe | AX `config.yml` profile (shared with JupyterLite) | constants file in MD, proven order hardcoded |
| Editor/drawer | cove (published) | used as-is |
| Session + panel | cove (`PythonRepl`, v3) | ~120-line panel in MD |
| Materials binding | AX notebooks-utils once released (v4) | ~20 lines inline Python in MD, marked temporary |
| `materialsSyncScope` | MD forever (domain) | as already written |
| Completions | cove (v2) | — |
| Requirements editor | cove UI + AX installer (v5) | — |

## 4. Bottlenecks

- **First load**: ≈30 s warm / ≈55 s cold to Ready. It's downloads (wasm + SciPy stack + 9.7 MB
  wheels; pymatgen alone 7.6 MB), not code. Mitigate by caching (wheel names are versioned),
  keeping the panel mounted (done), preload opt-in later.
- **Deployment**: wheels must be same-origin unless the host sends CORS. Today every embedding app
  must serve `/repl-wheels` (web-app doesn't yet → 404). **One infra change removes this
  everywhere: enable CORS on jupyterlite.mat3ra.com/files/packages** — provisioning becomes an
  optional cache.
- **Review load**: the refused PRs = ≈65 files / ≈4.3k lines across 3 repos because the end state
  shipped at once (completions + requirements tab + preload + cross-repo API + toolchain detours).
  Rule: one concern per PR, one repo per PR, dependency bumps where repos must move together.
- **Runtime**: one interpreter per page (JupyterLite coexists — iframe = separate page); one run at
  a time; wasm memory never shrinks — the interpreter persists once loaded, by design.

## 5. Build order

| Step | Ships | Where | ≈size | Notes |
| --- | --- | --- | --- | --- |
| v1 | Bare REPL end to end | MD | 400 | supersedes open PRs; no new deps |
| v2 | Autocomplete (Jedi + CM source) | cove | 200 | |
| v3 | Generic PythonRepl/session → cove | cove, MD | −100 in MD | the callback API, re-landed focused |
| v4 | AX manifest + released bindings | AX, MD | 150 | deletes inline Python + hardcoded recipe |
| v5 | Requirements tab, preload, tracebacks | cove, MD | 300 | each droppable |

v3/v4 can swap. Each step usable, reviewable, revertable alone.

**v1 file budget (MD):** PythonReplPanel ~120 · pyodideEnvironment ~90 · materialsBinding ~60 ·
reducer +40 · MDMaterial +10 · wiring +30 · provision script ~40 · e2e feature (exists).

## 6. Salvage from the refused PRs

Keep verbatim: syncScope reducer + marker, e2e feature, environment recipe (as constants).
Re-land later: cove callback API (v3), AX preamble/enums + get/sync (v4, behind a release).
Already merged stack-wide: `[release]` WIP-tarball flow — how v1 gets tested in web-app.
Shelve: requirements tab, completions, wheel-pin machinery (return in v2/v5).
