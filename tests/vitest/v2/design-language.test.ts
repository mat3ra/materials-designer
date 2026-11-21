/**
 * Mat3rial D3sign is executable: a token that fails contrast fails the build.
 *
 * Two guarantees:
 *   1. Every foreground/background pair the UI actually renders clears its WCAG
 *      threshold, in both modes.
 *   2. The generated token block in md2.css and in the committed mockups is the
 *      one tokens.ts produces — the drift that let the app and the mockups
 *      disagree about the scrim cannot come back.
 */

import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import {
    GENERATED_MARKERS,
    METRICS,
    TOKENS,
    ThemeMode,
    toCssBlock,
    toMuiTheme,
} from "../../../src/v2/styles/tokens";

const REPO = path.resolve(__dirname, "../../..");

/** sRGB relative luminance, WCAG 2.1 §Relative luminance. */
function luminance(hex: string): number {
    const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) throw new Error(`not an opaque hex colour: ${hex}`);
    const channels = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    const [r, g, b] = channels.map((c) =>
        c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
    );
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
}

/** Hue angle in degrees, for judging whether two colours read as the same colour. */
function hue(hex: string): number {
    const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
    if (!m) throw new Error(`not an opaque hex colour: ${hex}`);
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b);
    const chroma = max - Math.min(r, g, b);
    if (chroma === 0) return 0;
    let sector = 4 + (r - g) / chroma; // blue is the max
    if (max === r) sector = (g - b) / chroma;
    else if (max === g) sector = 2 + (b - r) / chroma;
    return (((sector * 60) % 360) + 360) % 360;
}

/** Shortest angular distance between two hues. */
function hueGap(a: string, b: string): number {
    const d = Math.abs(hue(a) - hue(b)) % 360;
    return d > 180 ? 360 - d : d;
}

/** Reports the actual ratio in the failure message, so tuning a hex is one run. */
function expectContrast(fg: string, bg: string, min: number, label: string) {
    const ratio = contrast(fg, bg);
    expect(
        ratio,
        `${label}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, needs ${min}:1`,
    ).toBeGreaterThanOrEqual(min);
}

const MODES: ThemeMode[] = ["dark", "light"];
/** The surfaces text is actually painted on. */
const SURFACES = ["bg0", "bg1", "bg2", "bg3"] as const;

describe.each(MODES)("Mat3rial D3sign — %s mode", (mode) => {
    const t = TOKENS[mode];

    it("body and dimmed text are readable on every surface (4.5:1)", () => {
        SURFACES.forEach((surface) => {
            expectContrast(t.text, t[surface], 4.5, `text on ${surface}`);
            expectContrast(t["text-dim"], t[surface], 4.5, `text-dim on ${surface}`);
        });
    });

    it("faint text clears the 3:1 floor it is only ever used at", () => {
        // --text-faint carries non-essential metadata (timestamps, hints). It is
        // held to the large-text/UI floor and the language forbids values in it.
        SURFACES.forEach((surface) => {
            expectContrast(t["text-faint"], t[surface], 3.0, `text-faint on ${surface}`);
        });
    });

    it("accent is readable as a value and as a link (4.5:1 on panels and hover)", () => {
        expectContrast(t.accent, t.bg1, 4.5, "accent on panel");
        expectContrast(t.accent, t.bg2, 4.5, "accent on raised");
        expectContrast(t.accent, t.bg3, 4.5, "accent on hover row");
    });

    it("filled accent buttons carry legible white text", () => {
        expectContrast("#ffffff", t["accent-strong"], 4.5, "white on accent-strong");
    });

    it("status colours clear the UI-component floor (3:1)", () => {
        (["ok", "warn", "err", "ghost"] as const).forEach((token) => {
            expectContrast(t[token], t.bg1, 3.0, `${token} on panel`);
            expectContrast(t[token], t.bg2, 3.0, `${token} on raised`);
        });
    });

    it("engine badges are distinguishable on their chip backgrounds (3:1)", () => {
        // native=accent, notebook=nb, repl=ok, manual=code, ai=ai.
        (["accent", "nb", "ok", "code", "ai"] as const).forEach((token) => {
            expectContrast(t[token], t.bg2, 3.0, `engine badge ${token}`);
            expectContrast(t[token], t.bg1, 3.0, `engine badge ${token} on panel`);
        });
    });

    it("selection cyan is visible wherever a selection can be shown (3:1)", () => {
        // 3D rings, table rows, code gutters, status bar — every surface.
        SURFACES.forEach((surface) => {
            expectContrast(t.sel, t[surface], 3.0, `selection on ${surface}`);
        });
    });

    it("borders separate adjacent surfaces (1.3:1 against both sides)", () => {
        // Mat3rial D3sign draws structure with borders rather than shadows, so a
        // border that vanishes into its neighbours is a structural failure.
        expectContrast(t.border, t.bg1, 1.3, "border against panel");
        expectContrast(t.border, t.bg0, 1.3, "border against app background");
    });

    it("selection cyan is not confusable with any other semantic colour", () => {
        // Cyan means "selected" and nothing else, so it has to be told apart
        // from the greens and the accent — by brightness or by hue, since two
        // colours of equal luminance can still be obviously different colours.
        (["ok", "ghost", "accent"] as const).forEach((token) => {
            const ratio = contrast(t.sel, t[token]);
            const gap = hueGap(t.sel, t[token]);
            expect(
                ratio >= 1.25 || gap >= 25,
                `sel vs ${token}: ${ratio.toFixed(2)}:1 and ${gap.toFixed(
                    0,
                )}° apart — reads as the same colour`,
            ).toBe(true);
        });
    });
});

describe("Mat3rial D3sign — generated artefacts agree", () => {
    const block = {
        app: toCssBlock(),
        mockup: toCssBlock("html"),
    };

    it("md2.css embeds the generated block verbatim", () => {
        const css = fs.readFileSync(path.join(REPO, "src/v2/styles/md2.css"), "utf8");
        expect(css).toContain(block.app);
    });

    it("every committed mockup embeds the same tokens", () => {
        const dir = path.join(REPO, "plan/ux-redesign/mockups");
        const files = fs.readdirSync(dir).filter((f) => f.endsWith(".html"));
        expect(files.length).toBeGreaterThan(0);
        files.forEach((file) => {
            const html = fs.readFileSync(path.join(dir, file), "utf8");
            expect(html, `${file} carries stale tokens — rebuild the mockups`).toContain(
                block.mockup,
            );
        });
    });

    it("no component stylesheet names a colour outside the token block", () => {
        const css = fs.readFileSync(path.join(REPO, "src/v2/styles/md2.css"), "utf8");
        const lines = css.slice(css.indexOf(GENERATED_MARKERS.end)).split("\n");
        // A literal is allowed only where the line above states why it is not a
        // theme colour (element colours belong to chemistry, not to the theme).
        const scanned = lines
            .filter(
                (line, i) => !/not-a-token/.test(line) && !/not-a-token/.test(lines[i - 1] ?? ""),
            )
            .join("\n");
        // #fff on a filled accent button is the one bare literal the language
        // allows; it is the contrast-checked pair asserted above.
        const literals = (scanned.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).filter(
            (hex) => !["#fff", "#ffffff"].includes(hex.toLowerCase()),
        );
        expect(literals, `hardcoded colours must become tokens: ${literals.join(", ")}`).toEqual(
            [],
        );
    });
});

describe("Mat3rial D3sign — MUI theme", () => {
    it("maps tokens onto the palette cove components read", () => {
        const theme = toMuiTheme("dark");
        expect(theme.palette.background.paper).toBe(TOKENS.dark.bg1);
        expect(theme.palette.primary.main).toBe(TOKENS.dark.accent);
        expect(theme.palette.secondary.main).toBe(TOKENS.dark.sel);
        expect(theme.typography.fontFamily).toBe(METRICS.fontSans);
    });

    it("suppresses MUI's dark elevation overlay, which greys out the navy", () => {
        expect(toMuiTheme("dark").components.MuiPaper.styleOverrides.root.backgroundImage).toBe(
            "none",
        );
    });
});
