// Downloads the REPL's prebuilt wheels into public/<wheelsDirectoryName>/ so the built site serves
// them same-origin (Vite copies public/). Runs on `prebuild` and `prestart`; skips files present.
// These are custom pure-Python builds, not on PyPI, so they must be self-hosted.
//
// Default source is the production JupyterLite site, which makes it a build-time dependency: if it is
// down, `prebuild` fails. Override with REPL_WHEELS_SOURCE_URL — see README.md on hosting these
// properly. Use the branded domain, not the netlify.app one: that is a deploy detail, and preview
// deploys share it.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";

const SOURCE_BASE_URL =
    process.env.REPL_WHEELS_SOURCE_URL || "https://jupyterlite.mat3ra.com/files/packages";

const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
// Single source of truth: src/components/repl/repl-packages.json (also read by constants.ts and the
// Pyodide integration test — plain JSON so all of them can load it without a build step).
const { wheelFilenames: WHEEL_FILENAMES, wheelsDirectoryName: WHEELS_DIRECTORY_NAME } = JSON.parse(
    await readFile(join(PROJECT_ROOT, "src", "components", "repl", "repl-packages.json"), "utf8"),
);

const outputDirectory = join(PROJECT_ROOT, "public", WHEELS_DIRECTORY_NAME);

async function isNonEmptyFile(path) {
    try {
        const info = await stat(path);
        return info.size > 0;
    } catch {
        return false;
    }
}

async function downloadWheel(wheelFilename) {
    const targetPath = join(outputDirectory, wheelFilename);
    if (await isNonEmptyFile(targetPath)) {
        console.log(`repl-wheels: ${wheelFilename} already present, skipping`);
        return;
    }
    const url = `${SOURCE_BASE_URL}/${wheelFilename}`;
    console.log(`repl-wheels: fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }
    // Download to a temporary name and rename only on success. Writing straight to targetPath would
    // leave a truncated .whl behind if the stream broke mid-transfer, and because the "already
    // present" check above only tests for a non-empty file, every later run would skip that corrupt
    // wheel — surfacing much later, and very confusingly, as `BadZipFile` inside micropip.
    const partialPath = `${targetPath}.part`;
    try {
        await pipeline(Readable.fromWeb(response.body), createWriteStream(partialPath));
        await rename(partialPath, targetPath);
    } catch (error) {
        await rm(partialPath, { force: true });
        throw error;
    }
}

await mkdir(outputDirectory, { recursive: true });
// Sequential to keep the log readable; the set is small.
await WHEEL_FILENAMES.reduce(
    (previous, wheelFilename) => previous.then(() => downloadWheel(wheelFilename)),
    Promise.resolve(),
);
console.log("repl-wheels: ready");
