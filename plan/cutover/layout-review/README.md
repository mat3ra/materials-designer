# Layout review — screenshots

The state of the shell at three widths plus the maximised console, captured from the running app
for the review on the cutover PR. They exist because the collapse behaviour is width-dependent and
a diff cannot show it.

| File | What it shows |
|---|---|
| `01-1024-narrow.png` | 1024×768 — timeline and inspector railed, 3D view still ~695px, workspace toggle row hidden below 1150px |
| `02-1280-default.png` | 1280×800 — timeline railed (seeded below 1400px), inspector open |
| `03-1920-full.png` | 1920×1080 — nothing railed |
| `04-console-maximised.png` | Console maximised: all three side regions railed, viewport hidden, the frame never moved in the DOM |
| `05-apply-no-wrap.png` | Supercell panel at 1280 — Cancel keeps its width, Apply takes the rest, one line |
| `06-toggles-pressed.png` | workspace bar at 1600 with the Timeline toggled off — the four shown regions read as pressed |
| `07-catalog-standata.png` | the Catalog card, now titled *Import from Standata* like the command it runs |
| `08-notebook-result-top-level.png` | Navigator after *Add to session* — the notebook's result is a row of its own, not a child of its input |
| `09-repl-bound.png` | Console › REPL bound to the session: selectors, *Add to session*, the lines to paste. The frame is dark only because the sandbox cannot reach jupyterlite.mat3ra.com |
| `10-standata-panel.png` | the library panel after the self-review — its lone Cancel fills the row again, which giving Cancel its own width had quietly taken away |
| `11-repl-chip-and-open-console.png` | a REPL result in the Timeline: *From REPL* with the engine badge in `--ok`, and the dock still open behind it — adopting must not cost the kernel |

Regenerate with `npm start` and the snippet in the PR thread; they are review artefacts, not
fixtures, and nothing asserts on them.
