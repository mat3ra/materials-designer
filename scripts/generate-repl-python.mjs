// Each python/*.py -> generated/<name>.ts exporting its source as a string, so the Python stays real
// Python (highlighting, no JS escaping) while the TS side imports a plain module. Not `?raw`: that is
// Vite-only, and dist/ is consumed by arbitrary Node/bundler consumers.
//
// python/bootstrap/*.py additionally get collected into generated/bootstrap/index.ts, so dropping a
// file there runs it at REPL startup with no TypeScript change. See python/bootstrap/README.md.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const PYTHON_DIR = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "components",
    "repl",
    "python",
);
const OUTPUT_DIR = join(PYTHON_DIR, "generated");
const BOOTSTRAP_DIR_NAME = "bootstrap";

const AUTO_GENERATED_HEADER = (sourceDescription) =>
    `// AUTO-GENERATED from ${sourceDescription} by scripts/generate-repl-python.mjs — do not edit directly.\n`;

async function pythonFilenamesIn(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile() && entry.name.endsWith(".py"))
        .map((entry) => entry.name)
        .sort(); // Bootstrap files run in this order, so keep it deterministic.
}

/** Writes generated/<relativeDir>/<name>.ts for each .py, and returns the module names written. */
async function generateStringModules(sourceDir, outputDir) {
    const filenames = await pythonFilenamesIn(sourceDir);
    await mkdir(outputDir, { recursive: true });
    await Promise.all(
        filenames.map(async (filename) => {
            const source = await readFile(join(sourceDir, filename), "utf8");
            const body =
                AUTO_GENERATED_HEADER(`../${filename}`) +
                `export default ${JSON.stringify(source)};\n`;
            await writeFile(join(outputDir, `${basename(filename, ".py")}.ts`), body);
        }),
    );
    return filenames.map((filename) => basename(filename, ".py"));
}

// Wipe first, so renaming or deleting a .py file cannot leave a stale generated module behind that
// still imports cleanly and silently shadows the change.
await rm(OUTPUT_DIR, { recursive: true, force: true });

const topLevelModules = await generateStringModules(PYTHON_DIR, OUTPUT_DIR);

const bootstrapModules = await generateStringModules(
    join(PYTHON_DIR, BOOTSTRAP_DIR_NAME),
    join(OUTPUT_DIR, BOOTSTRAP_DIR_NAME),
);

// The index is what makes bootstrap files drop-in: MaterialsReplSession just runs whatever is here.
const bootstrapIndex =
    AUTO_GENERATED_HEADER(`../../${BOOTSTRAP_DIR_NAME}/*.py`) +
    bootstrapModules.map((name) => `import ${name} from "./${name}";\n`).join("") +
    `\n/** Run in this (alphabetical) order at REPL startup. */\nexport default [\n` +
    bootstrapModules.map((name) => `    { name: "${name}", source: ${name} },\n`).join("") +
    `];\n`;
await writeFile(join(OUTPUT_DIR, BOOTSTRAP_DIR_NAME, "index.ts"), bootstrapIndex);

console.log(
    `generate-repl-python: ${topLevelModules.length} module(s) + ${bootstrapModules.length} bootstrap module(s) -> ${OUTPUT_DIR}`,
);
