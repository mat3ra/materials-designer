# Mat3rial D3sign

*The visual language of Materials Designer 2.0.*

Companion to [PROPOSAL.md](./PROPOSAL.md): the proposal decides **what the product is**
(five nouns, five load-bearing decisions, eight principles); this document decides
**what it looks like**, and only in service of making those concepts visible. Where the two
appear to disagree, the proposal wins and this file is wrong.

---

## 1. Stance

A calm, dense, navy instrument in which **colour is reserved for meaning**.

The structure on screen is the brightest thing in the room; chrome recedes to a
near-black navy so a 72-atom slab does not compete with its own toolbar. Surfaces are
separated by borders rather than shadows, values are set in mono with their units
attached, and every saturated colour on screen is spent on exactly one idea. If a new
element needs a colour that means nothing, it does not get one — it gets a border.

The palette is derived from the Mat3ra brand: navy surfaces (`#0f1a2f`, the brand
blue-black, is literally the panel colour), action blue `#045aff`, and the signature
cyan `#2effec`. Before this document existed there was no design system anywhere in the
stack to inherit: cove ships one violet plus stock MUI, with the dark palette
structurally absent; wave.js hard-codes its own theme; the brand lived only on the
marketing site. The MVP ran on an improvised palette that turned out, on inspection, to
be GitHub Primer's. Mat3rial D3sign closes that gap and is enforced by tests.

---

## 2. Concepts → encodings

This is the load-bearing table. Each row is a concept from the proposal and the single
visual device that carries it. A device appears in exactly one row — that is what makes
the screen readable at a glance.

| Concept (PROPOSAL) | Encoding | Rule |
|---|---|---|
| **Selection** — the one thing shared by all three projections (§3.3) | Cyan `--sel` | Reserved. 3D rings, table rows, code gutters, the Selection tab, the status count — all cyan, and *nothing else on screen is cyan*. Seeing cyan anywhere means "this is selected". |
| **Engine** — a badge on an operation, not a different door (§3.4) | Badge hue family | native = accent blue · notebook = `--nb` orange · REPL = `--ok` green · manual/code = `--code` slate · AI = `--ai` violet. Always a tinted pill with the engine's name; never a different chip shape. |
| **Preview before commit** (principle 3) | `--ghost` green, **always dashed or translucent** | A ghost is never a solid fill. Dashed outline = proposed geometry; the same green labels predicted results. Solid green means success, never proposal. |
| **Provenance / AI authorship** (§10.3) | `--ai` violet + ✦ badge on an ordinary timeline chip | AI-produced steps look like every other step, because they *are* every other step. The badge records authorship; it never gets a special lane. |
| **Crystallographic honesty** (principle 7) | Mono type + visible unit slot | Every scientific quantity renders in `--font-mono` with its unit in the field's unit slot (`11.6016  Å`). A bare number is a bug. Derived/locked fields show the lock and the reason (`🔒 = a`). |
| **Costumes** — one core, four skins (§3.5) | Token overrides only | An embed restyles by overriding custom properties. Nothing may fork a component to change a colour; nothing may hardcode one. |
| **Cost stated up front** (voice) | Verb-first labels carrying their consequence | "Apply — adds 1 step", "Apply & replay 3 steps". Disabled controls state the reason in their tooltip ("Nothing to redo"), never grey out silently. |
| **Tools vs. state** (viewport toolbar) | Icons are tools; text is a current value | A tool is an icon whose active state is a highlight. Text in the strip is always the *value* of a setting: `dist`, `El`, `1·1·1`, `persp`. |

---

## 3. Colour

Three layers: brand reference → semantic tokens → domain tokens. Only the semantic and
domain names may be referenced by components; the reference layer exists to explain
where the values came from.

### 3.1 Reference (brand)

| Brand value | Use here |
|---|---|
| `#0f1a2f` blue-black | Dark-mode panel surface (`--bg1`), and light-mode body text |
| `#070f4b` / `#011f53` navy | Ancestors of the dark surface ramp |
| `#045aff` action blue | `--accent-strong` (dark) and `--accent` (light) — the primary action colour |
| `#2effec` cyan | `--sel` in dark mode: selection, and only selection |
| `#f0f2f6` white smoke | Light-mode app background (`--bg0`) |
| `#6e7191` muted | Light-mode `--text-faint` |

### 3.2 Semantic tokens — the contract

Generated into CSS from `src/v2/styles/tokens.ts`. **These hexes are outputs, not
opinions**: each one is whatever passed `tests/vitest/v2/design-language.test.ts`.

| Token | Dark | Light | Meaning |
|---|---|---|---|
| `--bg-page` | `#070d18` | `#dde3ec` | Behind the app frame (stage, embed letterboxing) |
| `--bg0` | `#0a1220` | `#f0f2f6` | App background and canvas ground |
| `--bg1` | `#0f1a2f` | `#ffffff` | Panels |
| `--bg2` | `#16233c` | `#f6f8fb` | Raised: inputs, chips, badges |
| `--bg3` | `#1e2e4d` | `#e8edf5` | Hover / active |
| `--border` | `#2a3d61` | `#c6d1e2` | Structural separation |
| `--border-soft` | `#1b2a47` | `#dfe5ef` | Within-group separation |
| `--text` | `#e8eef9` | `#0f1a2f` | Body and values |
| `--text-dim` | `#a6b4cb` | `#46536e` | Labels, secondary |
| `--text-faint` | `#7b88a6` | `#6e7191` | Non-essential metadata only — **never a value** |
| `--accent` | `#5c94ff` | `#045aff` | Links, active state, focus |
| `--accent-strong` | `#045aff` | `#0341bd` | Filled primary actions (white text) |
| `--accent-soft` | `rgba(92,148,255,.16)` | `rgba(4,90,255,.10)` | Accent tint fills |
| `--sel` | `#2effec` | `#00787f` | **Selection. Reserved.** |
| `--sel-soft` | `rgba(46,255,236,.16)` | `rgba(0,120,127,.14)` | Selected-row fill |
| `--ok` | `#35cc7f` | `#157f3a` | Success, saved, REPL engine |
| `--warn` | `#f5b13d` | `#8f5600` | Warning, stale step |
| `--err` | `#ff7a75` | `#c5262d` | Error, destructive |
| `--ghost` | `#5ee39b` | `#0b7d45` | Previewed, not applied |
| `--ai` | `#a98cf5` | `#6438cf` | AI engine — deliberately near cove's `#7c5fcd` so the two systems rhyme |
| `--nb` | `#f2913d` | `#b2470c` | Notebook engine (Jupyter orange family) |
| `--code` | `#9aa8c2` | `#46536e` | Manual / code engine |
| `--vp-bg`, `--bond`, `--cellline` | — | — | Viewport ground and rendered geometry |
| `--shadow`, `--scrim` | — | — | Overlay elevation and modal dimming |

Light mode cannot use the brand cyan directly — on white it is invisible (1.26:1), so
`--sel` becomes the deepest cyan that stays unmistakably cyan next to the greens.
That substitution is the one place the brand is bent, and it is bent to keep the
*meaning* intact.

### 3.3 Enforcement

`tests/vitest/v2/design-language.test.ts` asserts, for both modes:

- body and dimmed text ≥ **4.5:1** on every surface; faint text ≥ **3:1** (and the
  language forbids putting values in it);
- accent ≥ 4.5:1 on panels, raised surfaces **and hover rows** — the hover row is what
  forced light-mode `--bg3` to `#e8edf5`;
- white on `--accent-strong` ≥ 4.5:1 (filled buttons);
- status, engine-badge and selection colours ≥ **3:1** (UI components) on their backgrounds;
- borders ≥ 1.3:1 against both neighbours, because this language draws structure with borders;
- `--sel` distinguishable from `--ok`, `--ghost` and `--accent` by luminance **or** ≥ 25° of hue;
- md2.css and every committed mockup contain the *generated* token block verbatim;
- no stylesheet names a colour outside that block, except `#fff` on filled accent
  buttons and lines carrying a `/* not-a-token: <reason> */` justification (element
  colours belong to chemistry, not to the theme).

A hex that fails is a failing build. That is the point: **the design language is executable.**

---

## 4. Typography

- **Sans:** `Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif` —
  cove's exact string, so standalone MD and the platform set type identically.
  Self-hosted via `@fontsource/roboto` (400/500/700).
- **Mono:** `Menlo, Monaco, Consolas, "Courier New", monospace` — cove's stack.

| Size | Role |
|---|---|
| 11px / 700 / .07em caps | Section and region labels (`LATTICE`, `TIMELINE`) |
| 11–12px mono | Values, deltas, digests, keyboard hints |
| 12.5px | Body, controls, list rows |
| 13.5px / 600 | Chip titles, emphasis |
| 15px | Dialog and panel titles |

**The mono rule:** every scientific quantity — lengths, angles, counts, formulas,
tolerances, matrix entries — renders in mono with its unit visible. Prose renders in
sans. This is how principle 7 ("crystallographic honesty") becomes a typographic
decision rather than a wish.

---

## 5. Space, size, shape, elevation

- **4px grid** — a subdivision of MUI/cove's 8, because scientific chrome is denser than
  application chrome. Padding, gaps and offsets are multiples of 4.
- **Control heights:** 28px dense (toolbars, chips, inline fields) · 32px standard
  (= cove's small button, for anything cove renders).
- **Radii:** `--radius-sm` 4 (badges, tags) · `md` 6 (buttons, inputs) · `lg` 8 (cards,
  chips) · `xl` 12 (dialogs, overlays).
- **Borders before shadows.** In-flow panels are separated by `--border`, never by a
  shadow. `--shadow` is for things that float above the app — menus, dialogs, the
  catalog — and `--scrim` dims what is behind them. A shadow on a docked panel is a bug.

---

## 6. Iconography

MUI icons through cove's `IconByName` registry are the standard (v1 already uses it in
nine places); the v2 shell imports from `@mui/icons-material` directly. Unicode glyphs
are **placeholders**, permitted only where no icon exists, and are expected to be
replaced. Icons are 16px in dense chrome, 18–19px in the workspace bar, and always
inherit `currentColor` so one icon works on every surface and in both themes. The
mockups inline the same Material path data (`mock-src/_icons.py`) so a screen shows what
will actually be built.

---

## 7. Motion

`--motion-fast` 120ms (hover, focus) · `--motion-base` 180ms (panel and menu transitions)
· `--motion-slow` 260ms (overlays, drawer). Standard easing `cubic-bezier(0.2, 0, 0.2, 1)`.
Motion clarifies where something came from; it never gates an action. Honor
`prefers-reduced-motion` by dropping to 0ms rather than by removing the state change.

---

## 8. Voice

- **Verb first, cost attached.** "Apply — adds 1 step". "Apply & replay 3 steps".
- **Disabled means explained.** A disabled control's tooltip says why ("Nothing to redo"),
  and predicted-empty results say what is missing rather than silently doing nothing.
- **Predict, don't promise.** Panels show the forecast result (`2 → 54 atoms · 1 material`)
  before Apply; an engine that cannot preview says so.
- **Never restore silently.** A restored session announces itself and offers "Start fresh".
- **Not wired beats faked.** A control that does nothing yet says so in place.
- Sentence case everywhere except the 11px section labels, which are caps.

---

## 9. Component recipes

| Component | Recipe |
|---|---|
| **Operation chip** | `--bg2` fill, `--border` 1px, `--radius-lg`; 13.5/600 title in `--text`; mono params in `--text-dim`; mono delta (`8 → 72 atoms`) in `--text-faint`; engine badge right of the title. Selected: `--accent` border + `--accent-soft` fill. Stale: `--warn` border and a stated reason. |
| **Engine badge** | 10px/700 caps, `--radius-sm`, colour = engine token, background = same token at 14–16% via `color-mix`. Never a bare coloured dot. |
| **Value field** | `--bg2` fill, `--border`, `--radius-md`, mono value in `--text`, unit right-aligned in `--text-faint`. Locked: dimmed fill plus a lock glyph carrying the reason. |
| **Predicted result line** | Mono, `--ghost`, prefixed `→`. Appears before Apply, never after. |
| **Notice bar** | Full width under the workspace bar, `--bg2`, left border 3px in `--accent` (info) / `--warn` / `--err`, with the actions inline. |
| **Empty state** | 12px `--text-faint`, one sentence saying what would fill it and the verb that does so. |
| **Set folder row** | Stacked-square swatch in `--accent` over `--accent-soft` (reads as several materials), count pill, one row regardless of member count. |

---

## 10. Platform adoption

### 10.1 Token → MUI mapping

`toMuiTheme(mode)` in `tokens.ts` produces the theme handed to cove's `ThemeProvider`, so
cove components dropped into v2 land in Mat3rial D3sign instead of violet-on-navy:

`primary.main` ← `--accent` · `primary.dark` ← `--accent-strong` · `secondary.main` ←
`--sel` · `background.default/paper` ← `--bg0`/`--bg1` · `text.primary/secondary/disabled`
← `--text`/`--text-dim`/`--text-faint` · `divider` ← `--border` · `success/warning/error`
← `--ok`/`--warn`/`--err` · `shape.borderRadius` ← 6 · `typography.fontFamily` ←
`--font-sans`.

One override is mandatory: **`MuiPaper.backgroundImage: none`**. MUI's dark mode paints an
elevation gradient over every Paper, which greys the navy out.

### 10.2 What cove should adopt

Findings from the audit that led here, offered as upstream work:

1. **`paletteDark` is structurally incomplete** — it omits every surface, text and border
   value, so v1 renders on stock MUI `#121212` and v1 code visibly routes around the gap
   (`palette.grey[800]`). §3.2's dark column is a ready-made fix.
2. **`contrastText: "rgba(0,0,0,0.23)"`** appears where a real contrast colour belongs —
   that is a disabled-border value, and it makes button labels unreadable.
3. **Breakpoints carry decorative values** rather than layout thresholds.
4. **`shadows` is replaced with a non-array**, which breaks MUI's `elevation` lookups.
5. **wave.js hard-codes a nested dark theme** with no theme prop, so the 3D canvas keeps
   its own black ground inside our navy app — visible today as a seam at the viewport
   edge. This is the one part of the screen Mat3rial D3sign cannot reach; the ask is a
   theme (or token) prop, alongside the existing asks for chrome and undo suppression.

---

## 11. Where it lives

| Artefact | Role |
|---|---|
| `src/v2/styles/tokens.ts` | **Source of truth.** Typed tokens, metrics, `toCssVariables`, `toCssBlock`, `toMuiTheme`. |
| `src/v2/styles/md2.css` | Generated token block + component classes. Never names a colour. |
| `tests/vitest/v2/design-language.test.ts` | Contrast, reservation and drift enforcement. |
| `src/v2/shell/App.tsx` | Mounts cove's `ThemeProvider` with the generated MUI theme; syncs `data-theme`. |
| `plan/ux-redesign/mockups/*.html` | Consume the same generated block (built by `mock-src/build.py`). |

Changing a colour means editing `tokens.ts`, re-running the suite, and regenerating the
CSS block and the mockups. There is no second place to change.
