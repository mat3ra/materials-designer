# Layout

MD 2.0 lives in `core` / `kit` / `domain`; v1 is still `components/`, `reducers/`, `MaterialsDesigner*`
and is served at `/` until the flip. `shell/` and `embed/` appear when there is code that belongs in
them — an empty directory promising a boundary is worth nothing.

| Directory | Rule | Contents |
|---|---|---|
| `core/` | headless: no React, no DOM, nothing from the UI above it | the operation-log spine — `types`, `session`, `replay`, `persist`, plus `registry` and `io`, which are the made.js-specific pair |
| `kit/` | cove-bound: React, MUI and cove only — never MD's kernel or domain | `theme/tokens.ts` today; the atoms and molecules move here as they are extracted, and from here into cove |
| `shell/` | *(not yet)* the designer template: generic over what fills its regions | `DesignerShell`, `commands.ts`, `host.ts` |
| `domain/` | MD proper: may use everything except `embed` | the app — `MaterialsDesigner`, viewport, navigator, timeline, inspector, console, panels |
| `embed/` | *(not yet)* adapters for the platform | `MaterialsDesignerContainer`, the `MDState` view, bridge payloads |
| `styles/` | plain CSS on custom properties | `md2.css`; its `:root` block is generated from `kit/theme/tokens.ts` |

`import/no-restricted-paths` in `.eslintrc.json` enforces every rule above, so the boundaries are
checked rather than merely intended. Getting a component into cove later should be a `git mv`.

## Why `core` is not yet split into generic and material halves

The plan calls for `core/log` (generic over a document type) beside `core/material` (made.js). Every
module except `persist.ts` names `Material` today, so that split is a genericisation over a type
parameter, not a move — and this is the most heavily tested code in the repo. It is worth doing when
a second consumer (a Workflow Designer operation log) exists to prove the shape. Until then the
boundary that pays for itself is the one above: nothing in `core` may reach into the UI.
