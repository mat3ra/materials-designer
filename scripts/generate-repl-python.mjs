// Turns each .py file in src/components/repl/python/ into a sibling generated/<name>.ts module that
// default-exports its content as a plain string. The .py files stay real Python (editor syntax
// highlighting, no JS-string escaping); this script is what lets them be authored that way while the
// imports in MaterialsReplSession.ts / PythonRepl.tsx stay plain string modules — consumable by tsc's
// dist/ build (a published library, used by arbitrary Node/bundler consumers) and not dependent on
// Vite's `?raw` import convention, which only the app's own Vite build would understand.
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

const pythonFilenames = (await readdir(PYTHON_DIR)).filter((filename) => filename.endsWith(".py"));
// Wipe first, so renaming or deleting a .py file cannot leave a stale generated module behind that
// still imports cleanly and silently shadows the change.
await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

await Promise.all(
    pythonFilenames.map(async (pythonFilename) => {
        const source = await readFile(join(PYTHON_DIR, pythonFilename), "utf8");
        const moduleName = basename(pythonFilename, ".py");
        const body =
            `// AUTO-GENERATED from ../${pythonFilename} by scripts/generate-repl-python.mjs — do not edit directly.\n` +
            `export default ${JSON.stringify(source)};\n`;
        await writeFile(join(OUTPUT_DIR, `${moduleName}.ts`), body);
    }),
);
console.log(
    `generate-repl-python: wrote ${pythonFilenames.length} module(s) to ${OUTPUT_DIR}`,
);
