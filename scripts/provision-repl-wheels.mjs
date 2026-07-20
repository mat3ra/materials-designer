// Downloads the prebuilt pure-Python wheels the Python REPL installs at runtime into
// public/repl-wheels/, so they are served same-origin by the built site (Vite copies public/ into
// the build output). Runs on `prebuild` (Netlify) and `prestart` (local); idempotent — skips files
// already present. These wheels are custom pure-Python builds not published on PyPI, so they must be
// self-hosted; the source defaults to the jupyterlite deploy that already hosts them.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const SOURCE_BASE_URL =
    process.env.REPL_WHEELS_SOURCE_URL || "https://mat3ra-jupyterlite.netlify.app/files/packages";

const REPL_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "repl");
// Single source of truth: src/components/repl/repl-packages.json (also read by constants.ts and
// tests-pyodide/supercell.pyodide.cjs — plain JSON so all three can load it without a build step).
const { wheelFilenames: WHEEL_FILENAMES } = JSON.parse(
    await readFile(join(REPL_DIR, "repl-packages.json"), "utf8"),
);

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "repl-wheels");

async function exists(path) {
    try {
        const info = await stat(path);
        return info.size > 0;
    } catch {
        return false;
    }
}

async function download(filename) {
    const target = join(outDir, filename);
    if (await exists(target)) {
        console.log(`repl-wheels: ${filename} already present, skipping`);
        return;
    }
    const url = `${SOURCE_BASE_URL}/${filename}`;
    console.log(`repl-wheels: fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }
    await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
}

await mkdir(outDir, { recursive: true });
// Sequential to keep the log readable; the set is small.
await WHEEL_FILENAMES.reduce(
    (previous, filename) => previous.then(() => download(filename)),
    Promise.resolve(),
);
console.log("repl-wheels: ready");
