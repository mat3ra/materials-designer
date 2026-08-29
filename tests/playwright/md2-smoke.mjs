/**
 * MD 2.0 smoke test — drives the running app in a real browser.
 *
 * Asserts the MVP's central claim end to end: every edit becomes one Timeline
 * step, and one Cmd+Z undoes it whatever surface produced it. Deliberately
 * separate from the Cypress suite in ../cypress, which still covers the v1 app.
 *
 * Usage:  npm start           (in one shell)
 *         node tests/playwright/md2-smoke.mjs
 */
import { chromium } from "playwright";

const SHOTS = process.env.MD2_SHOTS ?? "./md2-shots";
await (await import("node:fs/promises")).mkdir(SHOTS, { recursive: true });
const URL = "http://localhost:3001/v2.html";
const results = [];
function check(name, ok, detail = "") {
    results.push({ name, ok, detail });
    console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox", "--use-gl=swiftshader"] });
const page = await browser.newPage({ viewport: { width: 1600, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

await page.goto(URL, { waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="status-bar"]', { timeout: 30000 });
await page.waitForTimeout(2500); // let the GL scene settle

const atoms = async () => (await page.getByTestId("atom-count").innerText()).trim();
const chips = () => page.getByTestId("timeline-chip").count();

check("app boots with the default material", (await atoms()) === "2 atoms", await atoms());
check("timeline starts with the origin step", (await chips()) === 1, `${await chips()} chip(s)`);
await page.screenshot({ path: `${SHOTS}/01-default-dark.png` });

// --- a transform through the Catalog + Operation Panel ---------------------
await page.keyboard.press("Control+k");
await page.waitForSelector(".md2-catalog", { timeout: 5000 });
await page.screenshot({ path: `${SHOTS}/02-catalog.png` });
check("catalog opens on the palette chord", await page.locator(".md2-catalog").isVisible());

await page.getByRole("button", { name: /Supercell/i }).first().click();
await page.waitForSelector(".md2-panel", { timeout: 5000 });
const inputs = page.locator(".md2-matrix-grid input");
for (const [i, v] of [[0, "2"], [4, "2"], [8, "2"]]) {
    await inputs.nth(i).fill(v);
}
await page.waitForTimeout(400);
const predictText = (await page.locator(".md2-predict").first().innerText()).replace(/\s+/g, " ");
check("panel predicts the result before applying", /16/.test(predictText), predictText);
check("viewport stays visible while configuring", await page.getByTestId("viewport").isVisible());
await page.screenshot({ path: `${SHOTS}/03-panel-prediction.png` });

await page.getByRole("button", { name: /^Apply/i }).click();
await page.waitForTimeout(1200);
check("applying the operation updates the material", (await atoms()) === "16 atoms", await atoms());
check("the operation became one timeline step", (await chips()) === 2, `${await chips()} chips`);
await page.screenshot({ path: `${SHOTS}/04-after-supercell.png` });

// --- a second edit from a different surface (the Inspector) ---------------
await page.getByRole("tab", { name: /Structure/i }).click();
await page.getByRole("button", { name: /conventional cell/i }).click();
await page.waitForTimeout(900);
check("an inspector edit is recorded too", (await chips()) === 3, `${await chips()} chips`);

// --- one undo stack --------------------------------------------------------
await page.keyboard.press("Control+z");
await page.waitForTimeout(700);
check("Cmd+Z undoes the inspector edit", (await chips()) === 2, `${await chips()} chips`);
await page.keyboard.press("Control+z");
await page.waitForTimeout(700);
check("Cmd+Z undoes the panel transform", (await atoms()) === "2 atoms", await atoms());
check("undo stops at the origin", (await chips()) === 1, `${await chips()} chips`);
await page.keyboard.press("Control+Shift+z");
await page.waitForTimeout(700);
check("redo restores it", (await atoms()) === "16 atoms", await atoms());

// --- provenance as code ----------------------------------------------------
await page.getByRole("button", { name: /Script/i }).click();
await page.waitForTimeout(400);
const script = await page.getByTestId("script-tab").innerText();
check("the timeline exports as a runnable script", /supercell/.test(script), script.split("\n").slice(-1)[0]);
await page.screenshot({ path: `${SHOTS}/05-script.png` });

// --- autosave / restore ----------------------------------------------------
await page.waitForTimeout(1200); // let the autosave debounce fire
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector('[data-testid="status-bar"]', { timeout: 30000 });
await page.waitForTimeout(2000);
check("a reload restores the session", (await atoms()) === "16 atoms", await atoms());
check("and says so instead of restoring silently", await page.getByTestId("restore-notice").isVisible());
await page.screenshot({ path: `${SHOTS}/06-restored.png` });

// --- sets: one template, many materials, one undo -------------------------
await page.getByTestId("restore-notice").isVisible().then(async (v) => {
    if (v) await page.getByRole("button", { name: /Keep it/i }).click();
});
await page.keyboard.press("Control+k");
await page.waitForSelector(".md2-catalog");
await page.getByRole("button", { name: /Combinatorial set/i }).first().click();
await page.waitForSelector(".md2-panel");
const basisBox = page.getByLabel("Combinatorial basis in XYZ format");
const seed = await basisBox.inputValue();
// Turn the first line's element into a two-way substitution: Si -> Si/Ge.
await basisBox.fill(seed.replace(/^(\s*)Si/m, "$1Si/Ge"));
await page.waitForTimeout(400);
const setForecast = (await page.locator(".md2-predict").first().innerText()).replace(/\s+/g, " ");
check("combinatorial run forecasts the batch size", /material/.test(setForecast), setForecast);

const materialsBefore = await page.getByTestId("material-row").count();
await page.getByRole("button", { name: /^Apply/i }).click();
await page.waitForTimeout(1500);
const folders = await page.getByTestId("set-folder").count();
check("the batch collapses into a set folder", folders === 1, `${folders} folder(s)`);
await page.screenshot({ path: `${SHOTS}/08-set-folder.png` });

await page.keyboard.press("Control+z");
await page.waitForTimeout(900);
const foldersAfterUndo = await page.getByTestId("set-folder").count();
const materialsAfterUndo = await page.getByTestId("material-row").count();
check(
    "one Cmd+Z removes the whole batch",
    foldersAfterUndo === 0 && materialsAfterUndo === materialsBefore,
    `${foldersAfterUndo} folders, ${materialsAfterUndo} rows`,
);

// --- the standard library --------------------------------------------------
await page.keyboard.press("Control+k");
await page.waitForSelector(".md2-catalog");
await page.getByRole("button", { name: /Standard library/i }).first().click();
await page.waitForSelector(".md2-standata-list", { timeout: 10000 });
const libCount = await page.locator(".md2-standata-row").count();
check("the standard library lists real entries", libCount > 20, `${libCount} entries`);
await page.locator(".md2-standata-row").first().click();
await page.waitForTimeout(1200);
const rowsNow = await page.getByTestId("material-row").count();
check("picking one adds a material", rowsNow > materialsBefore, `${rowsNow} rows`);
await page.screenshot({ path: `${SHOTS}/09-standata.png` });

// --- light theme -----------------------------------------------------------
await page.getByRole("button", { name: /toggle theme/i }).click();
await page.waitForTimeout(600);
check("light theme renders", (await page.locator("html").getAttribute("data-theme")) === "light");
await page.screenshot({ path: `${SHOTS}/07-light.png` });

const real = errors.filter((e) => !/ResizeObserver|WebGL|SwiftShader|GroupMarkerNotSet|Failed to load resource/i.test(e));
check("no uncaught page errors", real.length === 0, real.slice(0, 2).join(" | "));

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
