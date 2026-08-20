// Cache the AX-owned Pyodide manifest and the wheels needed by its `made` profile. Vite serves the
// generated files same-origin, so an MD deployment remains reproducible even if AX later changes.
import { createWriteStream } from "node:fs";
import { mkdir, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
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
const CONSTANTS_CONTENT = await readFile(CONSTANTS_PATH, "utf8");
const PROFILE = CONSTANTS_CONTENT.match(/REPL_DEFAULT_PROFILE\s*=\s*"([^"]+)"/)?.[1];
if (!PROFILE) throw new Error(`${CONSTANTS_PATH} does not define REPL_DEFAULT_PROFILE.`);
// Read the pin from the same constants file the app uses, so there is one place to change it.
const PINNED_WHEEL_URL =
    process.env.REPL_NOTEBOOKS_UTILS_WHEEL_URL ||
    CONSTANTS_CONTENT.match(/REPL_NOTEBOOKS_UTILS_WHEEL_URL\s*=\s*"([^"]*)"/)?.[1] ||
    "";

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
// A pinned URL carries its own filename, and setuptools_scm puts the api-examples revision it was
// built from in that filename as `+g<sha>` — so the manifest is read from that same revision and
// config cannot drift from the code it configures.
const pinnedWheelFilename = PINNED_WHEEL_URL ? PINNED_WHEEL_URL.split("/").pop() : undefined;
const embeddedApiRevision = pinnedWheelFilename?.match(/\+g([a-f0-9]+)-/)?.[1];
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
if (!lock.packages?.mat3ra) {
    throw new Error("AX Pyodide lock has no notebooks-utils ('mat3ra') package.");
}
const notebooksUtilsWheel = pinnedWheelFilename || lock.packages.mat3ra.file_name;
if (!notebooksUtilsWheel) {
    throw new Error("AX Pyodide lock's notebooks-utils ('mat3ra') package has no file_name.");
}
lock.packages.mat3ra.file_name = notebooksUtilsWheel;
console.log(
    pinnedWheelFilename
        ? `repl-environment: notebooks-utils pinned to ${pinnedWheelFilename}`
        : `repl-environment: notebooks-utils from AX lock: ${notebooksUtilsWheel}`,
);
const resolvedLockContent = JSON.stringify(lock, null, 2);

await writeFile(join(PUBLIC_DIRECTORY, "repl-config.yml"), configContent);
await writeFile(join(PUBLIC_DIRECTORY, "repl-pyodide-lock.json"), resolvedLockContent);

for (const filename of [...new Set(contentWheelFilenames)]) {
    await downloadWheel(filename, CONTENT_WHEELS_URL);
}
await downloadWheel(
    notebooksUtilsWheel,
    PINNED_WHEEL_URL
        ? PINNED_WHEEL_URL.slice(0, PINNED_WHEEL_URL.lastIndexOf("/"))
        : `${AX_BASE_URL}/pyodide`,
);
console.log(`repl-environment: cached AX '${PROFILE}' profile`);
