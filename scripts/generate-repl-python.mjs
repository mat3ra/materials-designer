// Turns each .py file in src/components/repl/python/ into a sibling generated/<name>.ts module that
// default-exports its content as a plain string. The .py files stay real Python (editor syntax
// highlighting, no JS-string escaping); this script is what lets them be authored that way while the
// actual import in PyodideReplSession.ts/PythonRepl.tsx stays a plain string module — consumable by
// tsc's dist/ build (a published library, used by arbitrary Node/bundler consumers) and not dependent
// on Vite's ?raw import convention, which only the app's own Vite build would understand.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, basename } from "node:path";
import { fileURLToPath } from "node:url";

const PY_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "components", "repl", "python");
const OUT_DIR = join(PY_DIR, "generated");

const files = (await readdir(PY_DIR)).filter((f) => f.endsWith(".py"));
await mkdir(OUT_DIR, { recursive: true });

await Promise.all(
    files.map(async (filename) => {
        const source = await readFile(join(PY_DIR, filename), "utf8");
        const name = basename(filename, ".py");
        const body = `// AUTO-GENERATED from ../${filename} by scripts/generate-repl-python.mjs — do not edit directly.\nexport default ${JSON.stringify(source)};\n`;
        await writeFile(join(OUT_DIR, `${name}.ts`), body);
    }),
);
console.log(`generate-repl-python: wrote ${files.length} module(s) to ${OUT_DIR}`);
