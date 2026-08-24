// Download the prebuilt wheels the Python REPL installs (the list lives in
// src/components/repl/pyodideEnvironment.ts — read from there so there is one list to edit).
// They are pure-python builds of packages that do not build under Pyodide, hosted by the
// JupyterLite deploy for its own kernel; the app serves them same-origin from public/repl-wheels
// because browsers block cross-origin wheel fetches without CORS. Runs on prestart/prebuild and
// skips wheels already present, so it costs one download ever.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const WHEELS_SOURCE_URL = process.env.REPL_WHEELS_SOURCE_URL || "https://jupyterlite.mat3ra.com/files/packages";
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const WHEELS_DIRECTORY = join(PROJECT_ROOT, "public", "repl-wheels");
const ENVIRONMENT_PATH = join(PROJECT_ROOT, "src", "components", "repl", "pyodideEnvironment.ts");

const environmentSource = await readFile(ENVIRONMENT_PATH, "utf8");
const listSource = environmentSource.match(/REPL_WHEEL_FILENAMES = \[([^\]]+)\]/)?.[1];
if (!listSource) throw new Error(`${ENVIRONMENT_PATH} does not define REPL_WHEEL_FILENAMES.`);
const wheelFilenames = [...listSource.matchAll(/"([^"]+)"/g)].map(([, filename]) => filename);

async function isNonEmptyFile(path) {
    try {
        return (await stat(path)).size > 0;
    } catch {
        return false;
    }
}

await mkdir(WHEELS_DIRECTORY, { recursive: true });
for (const filename of wheelFilenames) {
    const targetPath = join(WHEELS_DIRECTORY, filename);
    // eslint-disable-next-line no-await-in-loop
    if (await isNonEmptyFile(targetPath)) continue;
    const url = `${WHEELS_SOURCE_URL}/${filename}`;
    console.log(`repl-wheels: fetching ${url}`);
    // eslint-disable-next-line no-await-in-loop
    const response = await fetch(url);
    if (!response.ok || !response.body) throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    // Download to a partial file first so an interrupted run never leaves a truncated wheel behind.
    const partialPath = `${targetPath}.part`;
    try {
        // eslint-disable-next-line no-await-in-loop
        await pipeline(Readable.fromWeb(response.body), createWriteStream(partialPath));
        // eslint-disable-next-line no-await-in-loop
        await rename(partialPath, targetPath);
    } catch (error) {
        // eslint-disable-next-line no-await-in-loop
        await rm(partialPath, { force: true });
        throw error;
    }
}
console.log(`repl-wheels: ${wheelFilenames.length} wheels present`);
