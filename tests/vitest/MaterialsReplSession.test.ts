import { beforeEach, describe, expect, it, vi } from "vitest";

import { PYODIDE_VERSION } from "../../src/components/repl/constants";
import { MaterialsReplSession } from "../../src/components/repl/MaterialsReplSession";
import { MDMaterial } from "../../src/MDMaterial";

const REQUIREMENTS = `default:
  packages_pyodide:
    - mat3ra-notebooks-utils
notebooks:
  - name: made
    packages_pyodide:
      - emfs:/drive/packages/pymatgen.whl
      - scipy==1.11.2
      - mat3ra-made
`;

/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function */
class FakePyodide {
    runPythonCalls: string[] = [];

    runPythonAsyncCalls: string[] = [];

    loadedPackages: string[][] = [];

    writtenFiles = new Map<string, unknown>();

    globals = {
        store: new Map<string, unknown>(),
        set: (name: string, value: unknown) => this.globals.store.set(name, value),
        get: (name: string) => this.globals.store.get(name),
    };

    FS = {
        mkdirTree: () => undefined,
        writeFile: (path: string, value: unknown) => this.writtenFiles.set(path, value),
    };

    setStdout() {}

    setStderr() {}

    async loadPackage(packages: string[]) {
        this.loadedPackages.push(packages);
    }

    pyimport() {
        return { install: { callKwargs: async () => undefined } };
    }

    runPython(code: string) {
        this.runPythonCalls.push(code);
        return "";
    }

    async runPythonAsync(code: string) {
        this.runPythonAsyncCalls.push(code);
        if (code.includes("get_package_list_from_config")) {
            return JSON.stringify([
                "mat3ra-notebooks-utils",
                "emfs:/drive/packages/pymatgen.whl",
                "scipy==1.11.2",
                "mat3ra-made",
            ]);
        }
        return undefined;
    }

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
    session.configureRequirements(
        REQUIREMENTS,
        "made",
        JSON.stringify({
            packages: {
                mat3ra: { file_name: "mat3ra_notebooks_utils.whl" },
                scipy: { file_name: "scipy.whl" },
            },
        }),
    );
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

    it("installs the selected AX profile from the same YAML exposed to the editor", () => {
        expect(fake.writtenFiles.get("/drive/config.yml")).toBe(REQUIREMENTS);
        expect(
            fake.runPythonAsyncCalls.some((code) => code.includes("install_packages_pyodide")),
        ).toBe(true);
        expect(fake.globals.store.get("_repl_requirements_profile")).toBe("made");
        expect(fake.loadedPackages).toContainEqual(["scipy"]);
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
        expect(devDependencies.pyodide).toBe(PYODIDE_VERSION);
    });
});
