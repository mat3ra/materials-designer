// Cache the AX-owned Pyodide manifest and the wheels needed by its `made` profile. Vite serves the
// generated files same-origin, so an MD deployment remains reproducible even if AX later changes.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const AX_BASE_URL = (process.env.REPL_AX_BASE_URL || "https://jupyterlite.mat3ra.com").replace(
    /\/$/,
    "",
);
const PYODIDE_LOCK_URL = `${AX_BASE_URL}/pyodide/pyodide-lock.json`;
const CONTENT_WHEELS_URL =
    process.env.REPL_WHEELS_SOURCE_URL || `${AX_BASE_URL}/files/packages`;
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIRECTORY = join(PROJECT_ROOT, "public");
const WHEELS_DIRECTORY = join(PUBLIC_DIRECTORY, "repl-wheels");
const CONSTANTS_PATH = join(PROJECT_ROOT, "src", "components", "repl", "constants.ts");
const PROFILE = (await readFile(CONSTANTS_PATH, "utf8")).match(
    /REPL_DEFAULT_PROFILE = "([^"]+)"/,
)?.[1];
if (!PROFILE) throw new Error(`${CONSTANTS_PATH} does not define REPL_DEFAULT_PROFILE.`);

async function fetchText(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    return response.text();
}

async function isNonEmptyFile(path) {
    try {
        return (await stat(path)).size > 0;
    } catch {
        return false;
    }
}

async function downloadWheel(wheelFilename, sourceBaseUrl) {
    const targetPath = join(WHEELS_DIRECTORY, wheelFilename);
    if (await isNonEmptyFile(targetPath)) {
        console.log(`repl-environment: ${wheelFilename} already present, skipping`);
        return;
    }
    const url = `${sourceBaseUrl}/${wheelFilename}`;
    console.log(`repl-environment: fetching ${url}`);
    const response = await fetch(url);
    if (!response.ok || !response.body) {
        throw new Error(`Failed to fetch ${url}: HTTP ${response.status}`);
    }
    const partialPath = `${targetPath}.part`;
    try {
        await pipeline(Readable.fromWeb(response.body), createWriteStream(partialPath));
        await rename(partialPath, targetPath);
    } catch (error) {
        await rm(partialPath, { force: true });
        throw error;
    }
}

await mkdir(WHEELS_DIRECTORY, { recursive: true });
const localNotebooksUtilsWheels = (await readdir(WHEELS_DIRECTORY))
    .filter((filename) => /^mat3ra_notebooks_utils-.*\.whl$/.test(filename))
    .sort();
const localNotebooksUtilsWheel = localNotebooksUtilsWheels.at(-1);
const embeddedApiRevision = localNotebooksUtilsWheel?.match(/\+g([a-f0-9]+)-/)?.[1];
const configUrl =
    process.env.REPL_AX_CONFIG_URL ||
    (embeddedApiRevision
        ? `https://raw.githubusercontent.com/mat3ra/api-examples/${embeddedApiRevision}/config.yml`
        : `${AX_BASE_URL}/files/config.yml`);

const [configContent, lockContent] = await Promise.all([
    process.env.REPL_AX_CONFIG_FILE
        ? readFile(process.env.REPL_AX_CONFIG_FILE, "utf8")
        : fetchText(configUrl),
    fetchText(PYODIDE_LOCK_URL),
]);
const config = parse(configContent);
const selectedProfile = config.notebooks?.find(({ name }) => name === PROFILE);
if (!selectedProfile) throw new Error(`AX config.yml has no '${PROFILE}' profile.`);

const emfsPrefix = "emfs:/drive/packages/";
const profilePackages = [
    ...(config.default?.packages_pyodide || []),
    ...(selectedProfile.packages_pyodide || []),
];
const contentWheelFilenames = profilePackages
    .filter((requirement) => requirement.startsWith(emfsPrefix))
    .map((requirement) => requirement.slice(emfsPrefix.length));

const lock = JSON.parse(lockContent);
const notebooksUtilsWheel =
    localNotebooksUtilsWheel || lock.packages?.mat3ra?.file_name;
if (!notebooksUtilsWheel) {
    throw new Error("AX Pyodide lock has no notebooks-utils ('mat3ra') package.");
}
lock.packages.mat3ra.file_name = notebooksUtilsWheel;
const resolvedLockContent = JSON.stringify(lock, null, 2);

await writeFile(join(PUBLIC_DIRECTORY, "repl-config.yml"), configContent);
await writeFile(join(PUBLIC_DIRECTORY, "repl-pyodide-lock.json"), resolvedLockContent);

for (const filename of [...new Set(contentWheelFilenames)]) {
    await downloadWheel(filename, CONTENT_WHEELS_URL);
}
if (!localNotebooksUtilsWheels.includes(notebooksUtilsWheel)) {
    await downloadWheel(notebooksUtilsWheel, `${AX_BASE_URL}/pyodide`);
}
console.log(`repl-environment: cached AX '${PROFILE}' profile`);
