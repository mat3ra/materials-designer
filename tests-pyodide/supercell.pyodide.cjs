/**
 * End-to-end integration test for the REPL "supercell" action.
 *
 * Exercises the exact provisioning recipe from src/components/repl/constants.ts in a real Pyodide
 * (matching cove.js's pinned 0.24.0), runs `create_supercell` via the public tools API, and asserts
 * the result round-trips through the plan's wire contract (Python to_dict() -> JS Material).
 *
 * Opt-in (heavy: downloads Pyodide packages). Run with:
 *   npm i -D pyodide@0.24.0
 *   REPL_WHEELS_DIR=/path/to/jupyterlite/content/packages npm run test:pyodide
 * Skips cleanly (exit 0) when pyodide or the wheels dir are unavailable, so CI never breaks on it.
 */
const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");

let loadPyodide;
try {
    ({ loadPyodide } = require("pyodide"));
} catch {
    console.log("SKIP: pyodide not installed. Run `npm i -D pyodide@0.24.0` to enable this test.");
    process.exit(0);
}

const WHEELS_DIR = process.env.REPL_WHEELS_DIR;
if (!WHEELS_DIR || !fs.existsSync(WHEELS_DIR)) {
    console.log(
        "SKIP: set REPL_WHEELS_DIR to a directory containing the prebuilt wheels " +
            "(e.g. <jupyterlite>/content/packages).",
    );
    process.exit(0);
}

// Single source of truth: src/components/repl/repl-packages.json (also read by constants.ts and
// scripts/provision-repl-wheels.mjs — plain JSON so all three can load it without a build step; this
// file is CommonJS and runs standalone, so it can't import the .ts module directly).
const {
    loadPackages: LOAD_PACKAGES,
    pypiPinnedPackages: PYPI_PINS,
    wheelFilenames: WHEELS,
    mat3raPackages: MAT3RA,
} = require("../src/components/repl/repl-packages.json");

const startWheelServer = () =>
    new Promise((resolve) => {
        const server = http.createServer((req, res) => {
            const file = path.join(WHEELS_DIR, decodeURIComponent(req.url.replace(/^\//, "")));
            if (!file.startsWith(WHEELS_DIR) || !fs.existsSync(file)) {
                res.statusCode = 404;
                return res.end("not found");
            }
            res.setHeader("Access-Control-Allow-Origin", "*");
            return fs.createReadStream(file).pipe(res);
        });
        server.listen(0, "127.0.0.1", () => resolve(server));
    });

(async () => {
    const missing = WHEELS.filter((w) => !fs.existsSync(path.join(WHEELS_DIR, w)));
    assert.strictEqual(
        missing.length,
        0,
        `missing wheels in REPL_WHEELS_DIR: ${missing.join(", ")}`,
    );

    const server = await startWheelServer();
    const base = `http://127.0.0.1:${server.address().port}`;
    const made = require(path.join(
        __dirname,
        "..",
        "node_modules",
        "@mat3ra",
        "made",
        "dist",
        "js",
        "made.js",
    ));

    const py = await loadPyodide();
    await py.loadPackage(["micropip", ...LOAD_PACKAGES]);
    const micropip = py.pyimport("micropip");
    for (const spec of PYPI_PINS) await micropip.install.callKwargs(spec, { deps: true });
    for (const w of WHEELS) await micropip.install.callKwargs(`${base}/${w}`, { deps: false });
    for (const spec of MAT3RA) await micropip.install.callKwargs(spec, { deps: true });

    py.globals.set("si_config_json", JSON.stringify(made.defaultMaterialConfig));
    // Mirror the session's pre-import (from ...helpers import *), then call create_supercell WITHOUT
    // a direct import — this is the exact path the panel's default snippet runs.
    const supercellJson = py.runPython(`
import json
from mat3ra.made.material import Material
from mat3ra.made.tools.helpers import *
si = Material.create_from_config_or_class_instance(json.loads(si_config_json))
supercell = create_supercell(si, scaling_factor=[2, 2, 1])
assert len(supercell.basis.elements.values) == 8, "expected 8 atoms in 2x2x1 supercell"
json.dumps(supercell.to_dict())
`);

    // The plan's wire contract: Python to_dict() -> JS Material (what MDMaterial does).
    const config = JSON.parse(supercellJson);
    assert.strictEqual(config.basis.elements.length, 8, "config should carry 8 atoms");
    assert.ok(config.metadata && config.metadata.build, "config should carry build metadata");
    const jsMaterial = new made.Material(config);
    assert.strictEqual(jsMaterial.formula, "Si", `expected formula Si, got ${jsMaterial.formula}`);

    server.close();
    console.log("PASS: create_supercell -> 8 atoms -> JS Material round-trip (formula Si).");
    process.exit(0);
})().catch((error) => {
    console.error("FAIL:", error && error.message ? error.message : error);
    process.exit(1);
});
