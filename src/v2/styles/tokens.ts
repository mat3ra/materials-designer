/**
 * Mat3rial D3sign — the single source of truth for MD 2.0's visual tokens.
 *
 * Everything visual downstream is generated from this file: the CSS custom
 * properties in md2.css, the MUI theme handed to cove's ThemeProvider, and the
 * token block in the mockups. Nothing else may name a colour.
 *
 * The palette derives from the Mat3ra brand: navy surfaces (#0f1a2f is the
 * brand blue-black and is literally the panel colour), action blue #045aff,
 * and the signature cyan #2effec — spent exclusively on selection, because
 * selection is the one concept shared by all three projections (3D, table,
 * code). Every value here is checked by tests/vitest/v2/design-language.test.ts:
 * a hex that fails WCAG contrast fails the build.
 */

export type ThemeMode = "dark" | "light";

export interface TokenSet {
    /** Behind the app frame (mockup stage, embed letterboxing). */
    "bg-page": string;
    /** App background and canvas ground. */
    bg0: string;
    /** Panels — the brand blue-black in dark mode. */
    bg1: string;
    /** Raised surfaces: inputs, chips, badges. */
    bg2: string;
    /** Hover and active surfaces. */
    bg3: string;
    border: string;
    "border-soft": string;
    text: string;
    "text-dim": string;
    /** Non-essential metadata only — held to 3:1, never used for values. */
    "text-faint": string;
    accent: string;
    "accent-strong": string;
    "accent-soft": string;
    /** Selection. Reserved: this colour means "selected" and nothing else. */
    sel: string;
    "sel-soft": string;
    ok: string;
    warn: string;
    err: string;
    /** Previewed-but-not-applied. Always dashed or translucent, never solid. */
    ghost: string;
    /** Engine: AI — deliberately near cove's violet so the two systems rhyme. */
    ai: string;
    /** Engine: notebook (Jupyter orange family). */
    nb: string;
    /** Engine: manual / code. */
    code: string;
    /** Viewport ground. */
    "vp-bg": string;
    /** Viewport bonds (mockup-rendered geometry). */
    bond: string;
    /** Viewport cell wireframe. */
    cellline: string;
    shadow: string;
    scrim: string;
    /** Mockup annotation pins — documentation chrome, not product UI. */
    "pin-bg": string;
}

/**
 * Dark is the primary mode: MD is used beside terminals and simulation output,
 * and a dark instrument keeps the structure the brightest thing on screen.
 */
const dark: TokenSet = {
    "bg-page": "#070d18",
    bg0: "#0a1220",
    bg1: "#0f1a2f",
    bg2: "#16233c",
    bg3: "#1e2e4d",
    border: "#2a3d61",
    "border-soft": "#1b2a47",
    text: "#e8eef9",
    "text-dim": "#a6b4cb",
    "text-faint": "#7b88a6",
    accent: "#5c94ff",
    "accent-strong": "#045aff",
    "accent-soft": "rgba(92, 148, 255, 0.16)",
    sel: "#2effec",
    "sel-soft": "rgba(46, 255, 236, 0.16)",
    ok: "#35cc7f",
    warn: "#f5b13d",
    err: "#ff7a75",
    ghost: "#5ee39b",
    ai: "#a98cf5",
    nb: "#f2913d",
    code: "#9aa8c2",
    "vp-bg": "radial-gradient(120% 90% at 50% 20%, #14203a 0%, #070d18 70%)",
    bond: "#5c6b86",
    cellline: "#7f8fb0",
    shadow: "0 14px 40px rgba(2, 6, 16, 0.62)",
    scrim: "rgba(5, 9, 18, 0.62)",
    "pin-bg": "#ff8f3d",
};

/** Light mode is the same instrument in daylight: brand white-smoke ground, brand blue-black text. */
const light: TokenSet = {
    "bg-page": "#dde3ec",
    bg0: "#f0f2f6",
    bg1: "#ffffff",
    bg2: "#f6f8fb",
    // Hover rows must stay light enough for the pure brand blue to clear 4.5:1
    // on top of them — the contrast suite fixed this value, not taste.
    bg3: "#e8edf5",
    border: "#c6d1e2",
    "border-soft": "#dfe5ef",
    text: "#0f1a2f",
    "text-dim": "#46536e",
    "text-faint": "#6e7191",
    accent: "#045aff",
    "accent-strong": "#0341bd",
    // Alpha values are written the way prettier normalizes them (0.1, not 0.10),
    // so the generated block survives the pre-commit formatter unchanged.
    "accent-soft": "rgba(4, 90, 255, 0.1)",
    // Light mode cannot use the brand cyan directly — it disappears on white.
    // This is the deepest cyan that stays unmistakably cyan beside the greens.
    sel: "#00787f",
    "sel-soft": "rgba(0, 120, 127, 0.14)",
    ok: "#157f3a",
    warn: "#8f5600",
    err: "#c5262d",
    ghost: "#0b7d45",
    ai: "#6438cf",
    nb: "#b2470c",
    code: "#46536e",
    "vp-bg": "radial-gradient(120% 90% at 50% 20%, #ffffff 0%, #e7ecf4 70%)",
    bond: "#93a1b8",
    cellline: "#6f7d99",
    shadow: "0 14px 40px rgba(15, 26, 47, 0.18)",
    scrim: "rgba(240, 242, 246, 0.62)",
    "pin-bg": "#d9660f",
};

export const TOKENS: Record<ThemeMode, TokenSet> = { dark, light };

/** Non-colour constants. Shared by the CSS, the MUI theme and the mockups. */
export const METRICS = {
    /** cove's exact stack, so standalone MD and the platform set type identically. */
    fontSans: 'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    fontMono: 'Menlo, Monaco, Consolas, "Courier New", monospace',
    /** 4px grid — a subdivision of MUI/cove's 8, for dense scientific chrome. */
    space: 4,
    radius: { sm: 4, md: 6, lg: 8, xl: 12 },
    /** Dense chrome / standard control, matching cove's small button at 32. */
    control: { dense: 28, standard: 32 },
    motion: { fast: "120ms", base: "180ms", slow: "260ms", ease: "cubic-bezier(0.2, 0, 0.2, 1)" },
} as const;

const GENERATED_START = "/* @generated by src/v2/styles/tokens.ts — do not edit by hand */";
const GENERATED_END = "/* @end generated */";

/** The custom-property declarations for one mode, indented for a CSS block. */
export function toCssVariables(mode: ThemeMode, indent = "    "): string {
    return Object.entries(TOKENS[mode])
        .map(([name, value]) => `${indent}--${name}: ${value};`)
        .join("\n");
}

/**
 * The full token block, marked so the design-language test can find it in any
 * file that embeds it (md2.css, the mockup shell) and prove they agree.
 * `scope` lets the mockups qualify the attribute selector with `html`.
 */
export function toCssBlock(scope = ""): string {
    const metrics = [
        `    --font-sans: ${METRICS.fontSans};`,
        `    --font-mono: ${METRICS.fontMono};`,
        ...Object.entries(METRICS.radius).map(([k, v]) => `    --radius-${k}: ${v}px;`),
        `    --motion-fast: ${METRICS.motion.fast};`,
        `    --motion-base: ${METRICS.motion.base};`,
        `    --motion-slow: ${METRICS.motion.slow};`,
        `    --ease: ${METRICS.motion.ease};`,
    ].join("\n");
    return [
        GENERATED_START,
        ":root {",
        metrics,
        "}",
        "",
        `:root,\n${scope}[data-theme="dark"] {`,
        toCssVariables("dark"),
        "}",
        "",
        `${scope}[data-theme="light"] {`,
        toCssVariables("light"),
        "}",
        GENERATED_END,
    ].join("\n");
}

export const GENERATED_MARKERS = { start: GENERATED_START, end: GENERATED_END };

/**
 * MUI palette for cove's ThemeProvider. Without this, cove components inside v2
 * would render in cove's violet on our navy — consistent by accident, not design.
 */
export function toMuiTheme(mode: ThemeMode) {
    const t = TOKENS[mode];
    return {
        palette: {
            mode,
            primary: { main: t.accent, dark: t["accent-strong"], contrastText: "#ffffff" },
            // Selection owns the signature cyan, so it is the secondary colour too.
            secondary: { main: t.sel, contrastText: mode === "dark" ? "#06251f" : "#ffffff" },
            success: { main: t.ok },
            warning: { main: t.warn },
            error: { main: t.err },
            background: { default: t.bg0, paper: t.bg1 },
            text: { primary: t.text, secondary: t["text-dim"], disabled: t["text-faint"] },
            divider: t.border,
        },
        shape: { borderRadius: METRICS.radius.md },
        typography: {
            fontFamily: METRICS.fontSans,
            fontSize: 13,
            button: { textTransform: "none" as const, fontWeight: 500 },
        },
        components: {
            // MUI's dark mode paints an elevation gradient over Paper, which
            // greys out the navy. Surfaces come from our tokens instead.
            MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
            MuiCssBaseline: {
                styleOverrides: { body: { backgroundColor: t.bg0, color: t.text } },
            },
        },
    };
}
