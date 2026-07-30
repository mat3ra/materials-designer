/**
 * End-to-end test of the Python REPL against a REAL Pyodide interpreter (the `pyodide` npm package,
 * pinned to the same version the browser loads from the CDN — asserted below rather than assumed).
 *
 * Unlike MaterialsReplSession.test.ts, this drives the actual {@link replSession}: the same install
 * sequence, the same generated .py modules, the same collect/inject plumbing the browser runs. That is
 * the point — an integration test that re-declared the install steps could drift away from the code it
 * is meant to protect without anything failing.
 *
 * Slow (minutes) and network-dependent, so the `*.pyodide.test.ts` suffix routes it to the `pyodide`
 * vitest project (see vite.config.mts); `npm run test:unit` deliberately skips it. Timeouts are set
 * per hook/test below rather than in config, so this file is self-explanatory on its own.
 *
 * NOTE: `tests/` is also a separate npm package (the Cypress suite). This file is run by the ROOT
 * package's vitest, not by anything in tests/package.json — it just lives here so `src/` holds only
 * shipped source.
 *
 * It FAILS rather than skips when the wheels are missing — a test that cannot fail is not a test.
 */
import { createReadStream } from "node:fs";
import { access } from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPyodide, version as installedPyodideVersion } from "pyodide";
import { afterAll, assert, beforeAll, describe, expect, it } from "vitest";

import { replSession } from "../../src/components/repl/MaterialsReplSession";
import replPackages from "../../src/components/repl/repl-packages.json";
import { MDMaterial } from "../../src/MDMaterial";

/** Building the environment (WASM CPython + pinned PyPI packages + local wheels) takes minutes. */
const ENVIRONMENT_BUILD_TIMEOUT_MS = 15 * 60 * 1000;

/** Individual runs are fast once the environment exists, but the first import of pymatgen is not. */
const RUN_TIMEOUT_MS = 3 * 60 * 1000;

/** tests/vitest/ -> project root. */
const PROJECT_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");

/**
 * Where the npm `pyodide` package keeps pyodide.asm.js / .wasm / python_stdlib.zip. Passed to
 * loadPyodide() as `indexURL` EXPLICITLY, for the same reason PyodideSession does so in the browser:
 * left to resolve its own location, Pyodide builds a `file:` URL that then gets joined onto the cwd,
 * and every asset fetch 404s on a path like `<cwd>/file:/<cwd>/node_modules/pyodide/...`.
 */
const PYODIDE_PACKAGE_DIRECTORY = dirname(createRequire(import.meta.url).resolve("pyodide"));

const WHEELS_DIRECTORY =
    process.env.REPL_WHEELS_DIR || join(PROJECT_ROOT, "public", replPackages.wheelsDirectoryName);

const SUPERCELL_SCALING = [2, 2, 1];
const EXPECTED_SUPERCELL_ATOM_COUNT = 8; // 2x2x1 of the 2-atom Si primitive

/**
 * Serves the provisioned wheels over loopback, standing in for the same-origin `/repl-wheels` path the
 * browser uses. Path traversal is blocked because `decodeURIComponent` can otherwise walk out of the
 * directory — cheap to get right even in a test.
 */
function startWheelServer(): Promise<http.Server> {
    return new Promise((resolve) => {
        const server = http.createServer((request, response) => {
            const requestedPath = join(
                WHEELS_DIRECTORY,
                decodeURIComponent((request.url || "").replace(/^\//, "")),
            );
            if (!requestedPath.startsWith(WHEELS_DIRECTORY)) {
                response.statusCode = 403;
                response.end("forbidden");
                return;
            }
            createReadStream(requestedPath)
                .on("error", () => {
                    response.statusCode = 404;
                    response.end("not found");
                })
                .pipe(response);
        });
        server.listen(0, "127.0.0.1", () => resolve(server));
    });
}

let wheelServer: http.Server;

/** Captured by the first test and asserted by the reassignment test that follows it. */
let supercellClientId: string | undefined;

describe("MaterialsReplSession against real Pyodide", () => {
    beforeAll(async () => {
        const missingWheels: string[] = [];
        await Promise.all(
            replPackages.wheelFilenames.map(async (wheelFilename) => {
                try {
                    await access(join(WHEELS_DIRECTORY, wheelFilename));
                } catch {
                    missingWheels.push(wheelFilename);
                }
            }),
        );
        assert.equal(
            missingWheels.length,
            0,
            `missing wheels in ${WHEELS_DIRECTORY} — run \`npm run provision-repl-wheels\`: ${missingWheels.join(
                ", ",
            )}`,
        );

        wheelServer = await startWheelServer();
        const { port } = wheelServer.address() as AddressInfo;
        replSession.setWheelBaseUrl(`http://127.0.0.1:${port}`);

        await replSession.initialize(await loadPyodide({ indexURL: PYODIDE_PACKAGE_DIRECTORY }));
    }, ENVIRONMENT_BUILD_TIMEOUT_MS);

    afterAll(() => {
        wheelServer?.close();
        replSession.dispose();
    });

    it("runs the same Pyodide version the browser loads from the CDN", () => {
        // The npm devDependency and repl-packages.json are two independent declarations of one version;
        // this is what stops them drifting apart, instead of a comment asking people to remember. It
        // has already earned its keep: `^0.24.0` silently resolved to 0.24.1 while the browser kept
        // loading v0.24.0.
        expect(installedPyodideVersion).toBe(replPackages.pyodideVersion);
    });

    it(
        "creates a supercell via the pre-imported helpers and reports it as one changed material",
        async () => {
            replSession.injectMaterials([new MDMaterial({ name: "Si" }).toJSON()], 0);

            // Deliberately no import line: `from ...helpers import *` at bootstrap is what makes this
            // work, and it is exactly what the panel's default snippet does.
            const result = await replSession.execute(
                `supercell = create_supercell(materials_in[0], scaling_factor=${JSON.stringify(
                    SUPERCELL_SCALING,
                )})`,
            );
            expect(result.error).toBeNull();
            expect(result.ok).toBe(true);

            const operations = replSession.collectChangedMaterials();
            expect(operations).toHaveLength(1);
            expect(operations[0].variableName).toBe("supercell");
            supercellClientId = operations[0].clientId;

            // The wire contract: Python to_dict() -> JS MDMaterial.
            const material = new MDMaterial(operations[0].config);
            const json = material.toJSON() as ReturnType<MDMaterial["toJSON"]> & {
                basis: { elements: unknown[] };
                metadata: { build?: unknown };
            };
            expect(json.basis.elements).toHaveLength(EXPECTED_SUPERCELL_ATOM_COUNT);
            expect(json.metadata.build).toBeDefined();
            expect(material.formula).toBe("Si");
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "keeps the same clientId when the same variable is reassigned, so the designer updates in place",
        async () => {
            expect(supercellClientId).toBeDefined();

            await replSession.execute(
                "supercell = create_supercell(materials_in[0], scaling_factor=[3, 1, 1])",
            );
            const operations = replSession.collectChangedMaterials();

            expect(operations).toHaveLength(1);
            expect(operations[0].variableName).toBe("supercell");
            // Same Python variable name -> same clientId -> materialsApplyReplSync updates the existing
            // list entry instead of appending a second one.
            expect(operations[0].clientId).toBe(supercellClientId);
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "does not re-sync the injected inputs when nothing new is bound",
        async () => {
            replSession.injectMaterials([new MDMaterial({ name: "Si" }).toJSON()], 0);
            await replSession.execute("print('no new materials here')");

            // `materials_in` / `material` were just rebound, but they are reserved input names, so a
            // run that creates nothing must report nothing — otherwise the list would grow every run.
            expect(replSession.collectChangedMaterials()).toHaveLength(0);
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "reports a user error structurally, with our own runner frame stripped from the traceback",
        async () => {
            const result = await replSession.execute("raise ValueError('boom')");

            expect(result.ok).toBe(false);
            expect(result.error?.ename).toBe("ValueError");
            expect(result.error?.evalue).toBe("boom");
            // The whole reason _repl_execute walks to tb_next: the user must see their own code at the
            // top of the traceback, not our plumbing.
            expect(result.error?.traceback).not.toContain("_repl_execute");
            expect(result.error?.traceback).toContain("ValueError: boom");
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "captures stdout from a successful run",
        async () => {
            const result = await replSession.execute("print('hello from pyodide')");

            expect(result.ok).toBe(true);
            expect(result.output).toContain("hello from pyodide");
        },
        RUN_TIMEOUT_MS,
    );

    it("completes helper names and user variables against the live namespace", () => {
        const source = "create_sup";
        const completions = replSession.complete(source, 1, source.length);

        expect(completions.map((completion) => completion.name)).toContain("create_supercell");
    });

    it("describes a highlighted completion with a real signature", () => {
        const source = "create_sup";
        const info = replSession.describe(source, 1, source.length, "create_supercell");

        expect(info?.signature).toContain("create_supercell");
    });
});
