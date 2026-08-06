import { beforeEach, describe, expect, it, vi } from "vitest";

import { MaterialsReplSession } from "../../src/components/repl/MaterialsReplSession";
import replPackages from "../../src/components/repl/repl-packages.json";
import { MDMaterial } from "../../src/MDMaterial";

/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function */
class FakePyodide {
    runPythonCalls: string[] = [];

    globals = {
        store: new Map<string, unknown>(),
        set: (name: string, value: unknown) => this.globals.store.set(name, value),
        get: (name: string) => this.globals.store.get(name),
    };

    FS = { mkdirTree: () => undefined, writeFile: () => undefined };

    setStdout() {}

    setStderr() {}

    async loadPackage() {}

    pyimport() {
        return { install: { callKwargs: async () => undefined } };
    }

    runPython(code: string) {
        this.runPythonCalls.push(code);
        return "";
    }

    async runPythonAsync() {}

    toPy(value: unknown) {
        return value;
    }
}

let session: MaterialsReplSession;
let fake: FakePyodide;

async function startSession() {
    session?.dispose();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = globalThis;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => new ArrayBuffer(8),
    });
    session = new MaterialsReplSession();
    session.setWheelBaseUrl("http://127.0.0.1/repl-wheels");
    fake = new FakePyodide();
    await session.initialize(fake);
}

describe("MaterialsReplSession", () => {
    beforeEach(startSession);

    it("loads the package-owned material preamble", () => {
        expect(
            fake.runPythonCalls.some((code) => code.includes("notebooks_utils.preamble.material")),
        ).toBe(true);
    });

    it("refreshes host materials before a run and syncs the namespace afterward", async () => {
        const materials = [new MDMaterial({ name: "Si" }), new MDMaterial({ name: "Ge" })];
        session.connect(
            () => materials,
            () => 1,
            vi.fn(),
        );

        await session.execute("print(material.name)");

        expect(fake.globals.store.get("data_from_host")).toEqual(
            materials.map((material) => material.toJSON()),
        );
        expect(fake.globals.store.get("data_from_host_action")).toBe("set-data");
        expect(fake.globals.store.get("_repl_active_index")).toBe(1);
        expect(
            fake.runPythonCalls.some((code) => code.includes("materials_in = _get_materials")),
        ).toBe(true);
        expect(fake.runPythonCalls).toContain("_sync_materials(globals())");
    });

    it("routes direct Python payloads through the shared set-data handler", () => {
        const onSync = vi.fn();
        session.connect(
            () => [],
            () => 0,
            onSync,
        );
        const payload = { syncScope: "python-repl", entities: [] };

        window.sendDataToHost?.(payload);

        expect(onSync).toHaveBeenCalledWith(payload);
    });
});

describe("REPL environment configuration", () => {
    it("pins the browser and npm Pyodide versions exactly", async () => {
        const { devDependencies } = await import("../../package.json");
        expect(devDependencies.pyodide).toBe(replPackages.pyodideVersion);
    });

    it("installs notebooks-utils from the pinned API wheel", () => {
        expect(replPackages.notebooksUtilsGitRevision).toBe(
            "64b0ccd33f6789e1293d8aca0b34e31befba27e1",
        );
        expect(replPackages.wheelFilenames).toContain(
            "mat3ra_notebooks_utils-2026.7.28.post1.dev3+g64b0ccd3-py3-none-any.whl",
        );
        expect(replPackages.mat3raPackages).not.toContain("mat3ra-notebooks-utils");
    });
});
