import { createReadStream } from "node:fs";
import { access, readFile } from "node:fs/promises";
import http from "node:http";
import { createRequire } from "node:module";
import type { AddressInfo } from "node:net";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadPyodide, version as installedPyodideVersion } from "pyodide";
import { afterAll, assert, beforeAll, describe, expect, it } from "vitest";

import { PYODIDE_VERSION } from "../../src/components/repl/constants";
import type { MaterialsSyncPayload } from "../../src/components/repl/materialsDataBridge";
import { replSession } from "../../src/components/repl/MaterialsReplSession";
import { getNotebooksUtilsWheelFilename } from "../../src/components/repl/requirements";
import { MDMaterial } from "../../src/MDMaterial";

const ENVIRONMENT_BUILD_TIMEOUT_MS = 15 * 60 * 1000;
const RUN_TIMEOUT_MS = 3 * 60 * 1000;
const PROJECT_ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "..", "..");
const PYODIDE_PACKAGE_DIRECTORY = dirname(createRequire(import.meta.url).resolve("pyodide"));
const WHEELS_DIRECTORY = process.env.REPL_WHEELS_DIR || join(PROJECT_ROOT, "public", "repl-wheels");

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
let requirementsContent: string;
const payloads: MaterialsSyncPayload[] = [];

describe("MaterialsReplSession against real Pyodide", () => {
    beforeAll(async () => {
        requirementsContent = await readFile(
            join(PROJECT_ROOT, "public", "repl-config.yml"),
            "utf8",
        );
        const lockContent = await readFile(
            join(PROJECT_ROOT, "public", "repl-pyodide-lock.json"),
            "utf8",
        );
        const notebooksUtilsWheel = getNotebooksUtilsWheelFilename(lockContent);
        const missingWheels: string[] = [];
        await Promise.all(
            [notebooksUtilsWheel].map(async (wheelFilename) => {
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
            `missing wheels in ${WHEELS_DIRECTORY} — run npm run provision-repl-wheels: ${missingWheels.join(
                ", ",
            )}`,
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (globalThis as any).window = globalThis;
        const input = new MDMaterial({ name: "Si" });
        replSession.connect(
            () => [input],
            () => 0,
            (payload) => payloads.push(payload),
        );
        replSession.configureRequirements(requirementsContent, "made", lockContent);
        wheelServer = await startWheelServer();
        const { port } = wheelServer.address() as AddressInfo;
        replSession.setWheelBaseUrl(`http://127.0.0.1:${port}`);
        await replSession.initialize(
            await loadPyodide({ indexURL: PYODIDE_PACKAGE_DIRECTORY }),
            (message) => process.stdout.write(`${message}\n`),
        );
    }, ENVIRONMENT_BUILD_TIMEOUT_MS);

    afterAll(() => {
        wheelServer?.close();
        replSession.dispose();
    });

    it("runs the same Pyodide version the browser loads", () => {
        expect(installedPyodideVersion).toBe(PYODIDE_VERSION);
    });

    it(
        "automatically injects inputs and sends a complete scoped batch",
        async () => {
            const result = await replSession.execute(
                "supercell = create_supercell(materials_in[0], scaling_factor=[2, 2, 1])",
            );

            expect(result.ok).toBe(true);
            const payload = payloads.at(-1);
            expect(payload?.syncScope).toBe("python-repl");
            expect(payload?.entities.map(({ name }) => name)).toEqual(["supercell"]);
            expect(payload?.entities[0].config.metadata?.build).toBeDefined();
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "walks one level into containers and clears deleted bindings",
        async () => {
            await replSession.execute("cells = [supercell, supercell]");
            expect(payloads.at(-1)?.entities.map(({ name }) => name)).toEqual([
                "supercell",
                "cells",
                "cells",
            ]);

            await replSession.execute("del supercell; del cells");
            expect(payloads.at(-1)?.entities).toEqual([]);
        },
        RUN_TIMEOUT_MS,
    );

    it(
        "reports user errors structurally and still syncs afterward",
        async () => {
            const before = payloads.length;
            const result = await replSession.execute("raise ValueError('boom')");

            expect(result.ok).toBe(false);
            expect(result.error?.ename).toBe("ValueError");
            expect(result.error?.traceback).not.toContain("_repl_execute");
            expect(payloads).toHaveLength(before + 1);
        },
        RUN_TIMEOUT_MS,
    );

    it("completes preamble helpers against the live namespace", () => {
        const source = "create_sup";
        expect(replSession.complete(source, 1, source.length).map(({ name }) => name)).toContain(
            "create_supercell",
        );
    });

    it(
        "applies an edited requirement without reinstalling unchanged pinned packages",
        async () => {
            const editedRequirements = requirementsContent.replace(
                "      - mat3ra-made",
                "      - more-itertools==10.2.0\n      - mat3ra-made",
            );

            await replSession.applyRequirements(editedRequirements, "made", () => undefined);
            const result = await replSession.execute("import more_itertools; print('installed')");

            expect(result.ok).toBe(true);
            expect(result.output).toContain("installed");
        },
        RUN_TIMEOUT_MS,
    );
});
