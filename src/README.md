# Layout

MD 2.0 lives in `core` / `kit` / `shell` / `domain` / `embed`; v1 is still `components/`,
`reducers/`, `MaterialsDesigner*` and is served at `/` until the flip.

| Directory | Rule                                                               | Contents                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `core/`   | headless: no React, no DOM, nothing from the UI above it           | the operation-log spine — `types`, `session`, `replay`, `persist`, plus `registry` and `io`, which are the made.js-specific pair                                            |
| `kit/`    | cove-bound: React, MUI and cove only — never MD's kernel or domain | `theme/tokens.ts`, `command/CommandPalette`, `BridgedIframe`; the atoms and molecules move here as they are extracted, and from here into cove                              |
| `shell/`  | the designer template: generic over what fills its regions         | `commands.ts` today — id, label, shortcut, availability, and the keyboard that runs them. `DesignerShell` and `host.ts` land here as the regions are lifted out of `domain` |
| `domain/` | MD proper: may use everything except `embed`                       | the app — `MaterialsDesigner`, viewport, navigator, timeline, `inspector/`, `panels/`, `console/`                                                                           |
| `embed/`  | adapters for the platform                                          | `MaterialsDesignerContainer`, `docs.ts`; `domain/mdState.ts` is the view it hands the save dialog                                                                           |
| `styles/` | plain CSS on custom properties                                     | `md2.css`; its `:root` block is generated from `kit/theme/tokens.ts`                                                                                                        |

`config.ts` sits outside the layers on purpose: build-time environment values that any of them may
read, and the one place `process.env` is named.

`import/no-restricted-paths` in `.eslintrc.json` enforces every rule above, so the boundaries are
checked rather than merely intended. Getting a component into cove later should be a `git mv`.

## Why `core` is not yet split into generic and material halves

The plan calls for `core/log` (generic over a document type) beside `core/material` (made.js). Every
module except `persist.ts` names `Material` today, so that split is a genericisation over a type
parameter, not a move — and this is the most heavily tested code in the repo. It is worth doing when
a second consumer (a Workflow Designer operation log) exists to prove the shape. Until then the
boundary that pays for itself is the one above: nothing in `core` may reach into the UI.
