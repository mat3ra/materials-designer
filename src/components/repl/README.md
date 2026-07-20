# Python REPL (in-browser Pyodide)

A terminal-like panel that runs `mat3ra.made.tools` (e.g. `create_supercell`, `create_interface_simple`)
in an in-process Pyodide, and auto-syncs any `Material` created/reassigned in the namespace back into
the designer's material list and 3D viewer.

-   `PyodideReplSession.ts` — Pyodide orchestration (singleton). No React/cove.js imports, so it is
    unit-/integration-testable in Node. Owns the persistent namespace and the `variableName → clientId` map.
-   `PythonRepl.tsx` — layout-agnostic UI (loader + CodeMirror editor + output).
-   `PythonReplPanel.tsx` — placement wrapper (Phase 1: bottom dock, viewer stays visible).
-   `constants.ts` — the spike-verified `made`-profile package set (single source of truth).

The reducer `materialsApplyReplSync` (in `src/reducers/Material.ts`) applies the synced operations,
keyed by the stable `MDMaterial.replClientId` (which never serializes into exports).

## Provisioning the wheels (required for the panel to work)

The environment is NOT `mat3ra-made[tools]` (pymatgen/ase/scipy don't build in Pyodide). It mirrors the
production JupyterLite recipe: pinned PyPI deps + prebuilt pure-Python wheels for the non-buildable ones
(`pymatgen`, `spglib`, `pydantic`, `pydantic_core`, `ruamel.yaml`).

Because the REPL loads Pyodide directly (no JupyterLite `emfs:/drive/`), those wheels must be served over
HTTP at `REPL_DEFAULT_WHEEL_BASE_URL` (default `/repl-wheels`, same-origin). Copy them from the
`jupyterlite` repo's `content/packages` into `public/repl-wheels/` (git-ignored):

```bash
REPL_WHEELS_DIR=/path/to/jupyterlite/content/packages
mkdir -p public/repl-wheels
cp "$REPL_WHEELS_DIR"/{pymatgen-2024.4.13,spglib-2.0.2,pydantic-2.7.1,pydantic_core-2.18.2,ruamel.yaml-0.17.32}-py3-none-any.whl public/repl-wheels/
```

Or point `PyodideReplSession.configure({ wheelBaseUrl })` (via the `wheelBaseUrl` prop) at a
CORS-enabled host that already serves them.

## Tests

-   `npm run test:unit` — fast Vitest unit tests (reducer sync logic, `replClientId` no-leak). Always runs.
-   `npm run test:pyodide` — end-to-end: loads real Pyodide, installs the recipe, runs `create_supercell`,
    asserts the `to_dict()` → JS `Material` round-trip. Opt-in; needs `npm i -D pyodide@0.24.0` and
    `REPL_WHEELS_DIR` set. Skips cleanly otherwise.
