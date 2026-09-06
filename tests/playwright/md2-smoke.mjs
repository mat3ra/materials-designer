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

// Use Playwright's managed browser unless one is pinned by the environment,
// so this runs on CI and on a developer's machine, not just where it was written.
const executablePath = process.env.MD2_CHROMIUM || undefined;
const browser = await chromium.launch({
    ...(executablePath ? { executablePath } : {}),
    args: ["--no-sandbox", "--use-gl=swiftshader"],
});
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
await page.getByTestId("open-catalog").click();
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

// --- selection is shared state --------------------------------------------
// Wave only picks atoms once the viewer is interactive AND in edit mode; both
// are wave-side preconditions, not app state.
await page.locator(".md2-viewport button").first().click();
await page.waitForTimeout(1000);
await page.getByTestId("viewport").click({ position: { x: 40, y: 300 } });
await page.keyboard.press("t");
await page.waitForTimeout(1200);
const vpBox = await page.getByTestId("viewport").boundingBox();
let picked = false;
for (const [dx, dy] of [[0.6, 0.68], [0.5, 0.55], [0.45, 0.6], [0.55, 0.5], [0.5, 0.62]]) {
    await page.mouse.click(vpBox.x + vpBox.width * dx, vpBox.y + vpBox.height * dy);
    await page.waitForTimeout(500);
    if (!/no selection/i.test(await page.getByTestId("selection-readout").innerText())) {
        picked = true;
        break;
    }
}
check(
    "a 3D pick reaches the app's shared selection",
    picked,
    (await page.getByTestId("selection-readout").innerText()).trim(),
);
await page.screenshot({ path: `${SHOTS}/10-selection.png` });

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

// --- editing a past step ---------------------------------------------------
// The parametric claim: a step's parameters stay live, and changing one
// re-runs everything after it.
if (await page.getByTestId("restore-notice").isVisible()) {
    await page.getByRole("button", { name: /Keep it/i }).click();
}
await page.getByRole("tab", { name: /Structure/i }).click();
await page.getByRole("button", { name: /conventional cell/i }).click();
await page.waitForTimeout(900);
const chipsBeforeEdit = await chips();
await page.getByTestId("timeline-chip").nth(1).hover();
await page.getByTestId("edit-step").first().click();
await page.waitForSelector(".md2-panel");
const editInputs = page.locator(".md2-matrix-grid input");
check(
    "editing a step pre-fills its parameters",
    (await editInputs.nth(0).inputValue()) === "2",
    `m11=${await editInputs.nth(0).inputValue()}`,
);
const applyBtn = page.getByRole("button", { name: /Apply & replay/i });
check("and says how many steps will replay", await applyBtn.isVisible(), await applyBtn.innerText());
await editInputs.nth(0).fill("3");
await editInputs.nth(4).fill("3");
await editInputs.nth(8).fill("3");
await page.waitForTimeout(400);
await applyBtn.click();
await page.waitForTimeout(1500);
check("the edit replaces the step in place", (await chips()) === chipsBeforeEdit, `${await chips()} chips`);
check("and downstream steps re-ran", (await atoms()) === "54 atoms", await atoms());
const editedChip = (await page.getByTestId("timeline-chip").nth(1).innerText()).replace(/\s+/g, " ");
check(
    "the edited chip reports its new result, not the old one",
    /2 → 54/.test(editedChip),
    editedChip,
);
await page.screenshot({ path: `${SHOTS}/11-edit-step.png` });

await page.keyboard.press("Control+z");
await page.waitForTimeout(800);
check("one undo restores the pre-edit log", (await atoms()) === "16 atoms", await atoms());
await page.keyboard.press("Control+Shift+z");
await page.waitForTimeout(800);

// --- sets: one template, many materials, one undo -------------------------
await page.getByTestId("open-catalog").click();
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
await page.getByTestId("open-catalog").click();
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

// --- file round trip -------------------------------------------------------
// Export the active material, then import the file back: the structure must
// survive the trip, and the copy's provenance must start at the import.
await page.getByTestId("app-menu-button").click();
await page.waitForSelector('[data-testid="app-menu"]');
const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("menuitem", { name: /Export as JSON/i }).click(),
]);
const exportPath = `${SHOTS}/exported.json`;
await download.saveAs(exportPath);
const exported = JSON.parse(await (await import("node:fs/promises")).readFile(exportPath, "utf8"));
check(
    "export writes the active material",
    Array.isArray(exported?.basis?.elements) && exported.basis.elements.length > 0,
    `${exported?.basis?.elements?.length} sites`,
);

const rowsBeforeImport = await page.getByTestId("material-row").count();
await page.getByTestId("app-menu-button").click();
await page.getByRole("menuitem", { name: /Upload from disk/i }).click();
await page.waitForSelector("#defaultImportModalDialog", { timeout: 5000 });
await page.locator('input[data-name="fileapi"]').setInputFiles(exportPath);
await page.waitForTimeout(600);
await page.locator("#defaultImportModalDialog-submit-button").click();
await page.waitForTimeout(1800);
check(
    "importing it back adds a material",
    (await page.getByTestId("material-row").count()) > rowsBeforeImport,
    `${await page.getByTestId("material-row").count()} rows`,
);
const importedChip = (await page.getByTestId("timeline-chip").first().innerText()).replace(/\s+/g, " ");
check(
    "whose history starts at the import, naming the detected format",
    /Imported/.test(importedChip) && /json/i.test(importedChip),
    importedChip,
);
await page.screenshot({ path: `${SHOTS}/12-import-export.png` });

// --- regressions found by review ------------------------------------------
// A drag that leaves without dropping must not leave a full-screen overlay
// covering the app forever.
const overlayShown = await page.evaluate(() => {
    const app = document.querySelector(".md2-app");
    const dt = new DataTransfer();
    const fire = (type) => app.dispatchEvent(new DragEvent(type, { bubbles: true, dataTransfer: dt }));
    // A real DataTransfer with no files still reports the Files type while a
    // drag is in flight, which is what the handler keys on.
    Object.defineProperty(dt, "types", { value: ["Files"] });
    fire("dragenter");
    fire("dragover");
    return document.querySelectorAll('[data-testid="dropzone"]').length;
});
await page.evaluate(() => {
    const app = document.querySelector(".md2-app");
    const dt = new DataTransfer();
    Object.defineProperty(dt, "types", { value: ["Files"] });
    app.dispatchEvent(new DragEvent("dragleave", { bubbles: true, dataTransfer: dt }));
});
await page.waitForTimeout(300);
check(
    "a cancelled drag dismisses its overlay",
    overlayShown === 1 && (await page.getByTestId("dropzone").count()) === 0,
    `overlay while dragging: ${overlayShown}, after leaving: ${await page.getByTestId("dropzone").count()}`,
);

// The hamburger must be able to close the menu it opened.
await page.getByTestId("app-menu-button").click();
await page.waitForSelector('[data-testid="app-menu"]');
await page.getByTestId("app-menu-button").click();
await page.waitForTimeout(400);
check("the app menu toggles shut from its own button", (await page.getByTestId("app-menu").count()) === 0);

// An expanded set must be collapsible again.
await page.getByTestId("open-catalog").click();
await page.waitForSelector(".md2-catalog");
await page.getByRole("button", { name: /Combinatorial set/i }).first().click();
await page.waitForSelector(".md2-panel");
const seed2 = await page.getByLabel("Combinatorial basis in XYZ format").inputValue();
await page.getByLabel("Combinatorial basis in XYZ format").fill(seed2.replace(/^(\s*)(\w+)/m, "$1$2/Ge"));
await page.waitForTimeout(400);
await page.getByRole("button", { name: /^Apply/i }).click();
await page.waitForTimeout(1500);
await page.getByTestId("set-folder").first().click();
await page.waitForTimeout(500);
const expandedFolders = await page.getByTestId("set-folder").count();
await page.getByTestId("set-folder").first().click();
await page.waitForTimeout(500);
check(
    "an expanded set can be folded back up",
    expandedFolders === 1 && (await page.getByTestId("set-folder").count()) === 1,
    `folder visible while expanded: ${expandedFolders}`,
);

// --- interpolated set (NEB) ------------------------------------------------
{
    // Clone first: a path's images have to share a cell, and a copy of the active material is the
    // one endpoint guaranteed to qualify.
    await page.click('[data-command="material.clone"]');
    await page.waitForTimeout(600);
    const foldersBefore = await page.getByTestId("set-folder").count();

    await page.getByTestId("open-catalog").click();
    await page.waitForTimeout(300);
    await page.locator('.md2-catalog-card:has-text("Interpolated set")').click();
    await page.waitForTimeout(500);
    check(
        "the NEB panel opens on an endpoint it can actually use",
        /materials \(one set\)/.test(await page.locator(".md2-predict").innerText()),
        (await page.locator(".md2-predict").innerText()).replace(/\s+/g, " "),
    );

    await page.getByRole("button", { name: /^Apply/i }).click();
    await page.waitForTimeout(1400);
    const foldersAfter = await page.getByTestId("set-folder").count();
    check(
        "applying collapses the images into a set folder",
        foldersAfter === foldersBefore + 1,
        `${foldersBefore} -> ${foldersAfter} folder(s)`,
    );

    await page.keyboard.press("Control+z");
    await page.waitForTimeout(900);
    check(
        "and one undo removes the whole set",
        (await page.getByTestId("set-folder").count()) === foldersBefore,
    );
}

// --- panel toggles ---------------------------------------------------------
{
    const inspector = page.locator('[data-region="inspector"]');
    check("the inspector starts visible", await inspector.isVisible());

    await page.click(".panel-toggle-inspector");
    await page.waitForTimeout(300);
    check("toggling hides it", !(await inspector.isVisible()));
    // Hidden, not unmounted: the element is still in the tree so the panes keep their state.
    check("but it stays mounted", (await inspector.count()) === 1);

    await page.click(".panel-toggle-inspector");
    await page.waitForTimeout(300);
    check("toggling again restores it", await inspector.isVisible());

    // The last visible region cannot be hidden: a blank window has no way back.
    for (const name of ["navigator", "viewport", "timeline", "console"]) {
        await page.click(`.panel-toggle-${name}`);
        await page.waitForTimeout(150);
    }
    const lastToggle = page.locator(".panel-toggle-inspector");
    check(
        "the last visible panel refuses to hide",
        await lastToggle.isDisabled(),
        `title: ${await lastToggle.getAttribute("title")}`,
    );

    for (const name of ["navigator", "viewport", "timeline", "console"]) {
        await page.click(`.panel-toggle-${name}`);
        await page.waitForTimeout(150);
    }
}

// --- status bar groups ------------------------------------------------------
{
    const material = page.locator("#materials-designer-status-bar .status-material");
    const position = page.locator("#materials-designer-status-bar .status-position");
    check("the status bar exposes a material group", await material.isVisible());
    const materialText = (await material.innerText()).replace(/\s+/g, " ");
    check(
        "which answers what this material is",
        /atoms/.test(materialText) && materialText.trim().length > 0,
        materialText,
    );

    const before = (await position.innerText()).trim();
    check("and a position group reading n / m", /^\d+ \/ \d+$/.test(before), before);

    // Cloning appends without moving the selection: the denominator grows, the numerator does not.
    const [n0, m0] = before.split("/").map((part) => Number(part.trim()));
    await page.click('[data-command="material.clone"]');
    await page.waitForTimeout(500);
    const after = (await position.innerText()).trim();
    const [n1, m1] = after.split("/").map((part) => Number(part.trim()));
    check(
        "cloning grows the list without switching to the copy",
        n1 === n0 && m1 === m0 + 1,
        `${before} -> ${after}`,
    );

    await page.keyboard.press("Control+z");
    await page.waitForTimeout(500);
}

// --- inline rename ---------------------------------------------------------
{
    const row = page.locator('[data-testid="material-row"]').first();
    // Select first: chips() reads the *active* material's log, so the count has to be taken
    // against the same material that is about to be renamed.
    await row.click();
    await page.waitForTimeout(300);
    const before = await chips();
    await row.locator(".md2-tname").dblclick();
    const field = page.locator('[data-testid="material-name-input"]');
    check("double-clicking a name opens its field", await field.isVisible());

    await field.fill("Renamed Material");
    await field.press("Enter");
    await page.waitForTimeout(400);
    check(
        "the new name shows on the row",
        (await row.locator(".md2-tname").innerText()).trim() === "Renamed Material",
        (await row.locator(".md2-tname").innerText()).trim(),
    );
    check("and the rename is recorded as a step", (await chips()) === before + 1, `${await chips()} chips`);

    // Opening the field and leaving without changing anything must not deepen the history,
    // or an undo would spend itself walking back a no-op.
    const afterRename = await chips();
    await row.locator(".md2-tname").dblclick();
    await page.locator('[data-testid="material-name-input"]').press("Enter");
    await page.waitForTimeout(400);
    check(
        "a rename that changes nothing records nothing",
        (await chips()) === afterRename,
        `${await chips()} chips`,
    );
}

// --- console > notebook ----------------------------------------------------
// The real JupyterLite origin is not reachable from here, so the frame itself is not exercised.
// Everything on this side of the bridge is: the surface, the selectors the 53 health-check
// features drive, and what happens to a structure the frame pushes back.
{
    const before = await page.getByTestId("material-row").count();
    await page.locator('[data-command="console.notebook"]').click();
    await page.waitForSelector("#jupyterlite-transformation-dialog", { timeout: 5000 });
    check(
        "the notebook opens on the frozen wrapper id",
        await page.locator("#jupyterlite-transformation-dialog").isVisible(),
    );

    const frameSrc = await page.locator("iframe#jupyter-lite-iframe").getAttribute("src");
    check(
        "the frame keeps its id and opens the default notebook",
        /jupyterlite.*\/lab\/tree\?path=made\/Introduction\.ipynb$/.test(frameSrc ?? ""),
        frameSrc ?? "no iframe",
    );

    const inChips = page.locator("[data-tid='materials-in-selector'] .MuiChip-root");
    check(
        "materials_in opens on the active material",
        (await inChips.count()) === 1,
        `${await inChips.count()} chip(s)`,
    );

    const submit = page.locator("#jupyterlite-transformation-dialog-submit-button");
    check("nothing to add before the notebook has run", await submit.isDisabled());

    // Speak the bridge protocol at the app the way the frame would.
    await page.evaluate(() => {
        const config = window.MDState.materials[0].toJSON();
        window.dispatchEvent(
            new MessageEvent("message", {
                origin: "https://jupyterlite.mat3ra.com",
                data: {
                    type: "from-iframe-to-host",
                    action: "set-data",
                    payload: { materials: [{ ...config, name: "Notebook Output" }] },
                },
            }),
        );
    });
    await page.waitForTimeout(500);
    const outChips = page.locator("[data-tid='materials-out-selector'] .MuiChip-root");
    check(
        "what the notebook produced is staged, not adopted",
        (await outChips.count()) === 1 && (await page.getByTestId("material-row").count()) === before,
        `${await outChips.count()} staged, ${await page.getByTestId("material-row").count()} rows`,
    );
    check("and the button now offers to add it", await submit.isEnabled());
    await page.screenshot({ path: `${SHOTS}/08-notebook.png` });

    await submit.click();
    await page.waitForTimeout(700);
    check(
        "adding it puts the material in the session",
        (await page.getByTestId("material-row").count()) === before + 1,
        `${await page.getByTestId("material-row").count()} rows`,
    );
    check(
        "and closes the console, so re-opening starts a fresh notebook",
        (await page.locator("#jupyterlite-transformation-dialog").count()) === 0,
    );

    // The point of the operation log: notebook work shows up as notebook work. The row is found
    // by name rather than by position, because lineage puts a derived material under its parent
    // rather than at the end of the list.
    const producedRow = page
        .getByTestId("material-row")
        .filter({ hasText: "Notebook Output" })
        .first();
    check("the produced material is listed", (await producedRow.count()) === 1);
    check(
        "and sits under the material it was derived from",
        Number(((await producedRow.getAttribute("style")) ?? "").replace(/\D/g, "") || 0) > 0,
        (await producedRow.getAttribute("style")) ?? "no indent",
    );
    await producedRow.click();
    await page.waitForTimeout(500);
    const badge = (await page.getByTestId("timeline-chip").first().innerText()).toUpperCase();
    check("the timeline records the notebook as the engine", /NOTEBOOK/.test(badge), badge);
}

// --- console > repl --------------------------------------------------------
{
    await page.locator('[data-command="console.repl"]').click();
    await page.waitForSelector("#python-repl", { timeout: 5000 });
    const src = await page.locator("iframe#python-repl-iframe").getAttribute("src");
    check(
        "the REPL tab loads JupyterLite's own console app",
        /\/repl\/index\.html\?kernel=python/.test(src ?? ""),
        src ?? "no iframe",
    );
    check(
        "and says plainly that materials are not bound yet",
        /Notebook tab/.test(await page.getByTestId("repl-note").innerText()),
    );
    // Switching away and back must not leave two frames on the page: both tabs address their
    // frame by id when posting, so a stale one would receive the messages.
    await page.locator('[data-command="console.notebook"]').click();
    await page.waitForTimeout(400);
    check(
        "switching tabs unmounts the frame it left",
        (await page.locator("iframe#python-repl-iframe").count()) === 0 &&
            (await page.locator("iframe#jupyter-lite-iframe").count()) === 1,
    );
    await page.locator('[data-command="view.toggle-console"]').click();
    await page.waitForTimeout(300);
}

// --- import review ---------------------------------------------------------
{
    const before = await page.getByTestId("material-row").count();
    await page.locator('[data-command="create.from-file"]').click();
    await page.waitForSelector("#defaultImportModalDialog", { timeout: 5000 });
    check("upload from disk opens the review, not the file picker", await page.locator("#defaultImportModalDialog").isVisible());
    check("which starts on a drop zone", await page.locator('[data-name="dropzone"]').isVisible());
    const addButton = page.locator("#defaultImportModalDialog-submit-button");
    check("with nothing to add yet", await addButton.isDisabled());

    // Two files, one of each supported format, so the format column has something to detect.
    const poscar = await page.evaluate(() => window.MDState.materials[0].getAsPOSCAR());
    await page.locator('input[data-name="fileapi"]').setInputFiles([
        { name: "smoke.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(await page.evaluate(() => window.MDState.materials[0].toJSON()))) },
        { name: "smoke.poscar", mimeType: "text/plain", buffer: Buffer.from(poscar) },
    ]);
    await page.waitForTimeout(700);
    const cell = (field, value) => page.locator(`div[role="cell"][data-field="${field}"] div[title="${value}"]`);
    check(
        "both files are listed with the format that was detected, not declared",
        (await cell("fileName", "smoke.json").count()) === 1 &&
            (await cell("format", "json").count()) === 1 &&
            (await cell("fileName", "smoke.poscar").count()) === 1 &&
            (await cell("format", "poscar").count()) === 1,
        `json: ${await cell("format", "json").count()}, poscar: ${await cell("format", "poscar").count()}`,
    );
    check("nothing has been imported yet", (await page.getByTestId("material-row").count()) === before);

    await page.locator("#smoke-poscar-remove-button").click();
    await page.waitForTimeout(400);
    check(
        "removing a row drops it from the review",
        (await cell("fileName", "smoke.poscar").count()) === 0 &&
            (await cell("fileName", "smoke.json").count()) === 1,
    );
    await page.screenshot({ path: `${SHOTS}/09-import-review.png` });

    await addButton.click();
    await page.waitForTimeout(700);
    check(
        "submitting imports what survived the review",
        (await page.getByTestId("material-row").count()) === before + 1,
        `${await page.getByTestId("material-row").count()} rows`,
    );
    check("and closes the review", (await page.locator("#defaultImportModalDialog").count()) === 0);

    // Cancel must not be a second way to import.
    const afterImport = await page.getByTestId("material-row").count();
    await page.locator('[data-command="create.from-file"]').click();
    await page.waitForSelector("#defaultImportModalDialog", { timeout: 5000 });
    await page.locator("#defaultImportModalDialog-cancel-button").click();
    await page.waitForTimeout(400);
    check(
        "cancelling closes it and adds nothing",
        (await page.locator("#defaultImportModalDialog").count()) === 0 &&
            (await page.getByTestId("material-row").count()) === afterImport,
    );
}

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
