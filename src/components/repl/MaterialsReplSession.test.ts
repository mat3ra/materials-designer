// eslint-disable-next-line import/no-extraneous-dependencies
import { beforeEach, describe, expect, it } from "vitest";

import { MDMaterial } from "../../MDMaterial";
import { MaterialsReplSession } from "./MaterialsReplSession";
import replPackages from "./repl-packages.json";

/**
 * Stands in for Pyodide so the JS half of the session — the variable-name -> clientId mapping and the
 * inject/collect wiring — can be tested without a WASM interpreter. `initialize(pyodide)` in cove
 * exists precisely so this is possible; see cove's own tests for the install-ordering coverage.
 */
class FakePyodide {
    runPythonCalls: string[] = [];

    /** JSON that `_repl_export` resolves to — i.e. what collect_changed_materials.py produced. */
    exportJson = "[]";

    helperCount = 42;

    globals = {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        store: new Map<string, any>(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set: (name: string, value: any) => {
            this.globals.store.set(name, value);
        },
        get: (name: string) => {
            if (name === "_repl_helper_count") return this.helperCount;
            return this.globals.store.get(name);
        },
    };

    FS = {
        mkdirTree: () => undefined,
        writeFile: () => undefined,
    };

    // Nothing here cares about streams or package installation — cove's own tests cover those.
    // eslint-disable-next-line class-methods-use-this
    setStdout() {
        return undefined;
    }

    // eslint-disable-next-line class-methods-use-this
    setStderr() {
        return undefined;
    }

    // eslint-disable-next-line class-methods-use-this
    async loadPackage() {
        return undefined;
    }

    // eslint-disable-next-line class-methods-use-this
    pyimport() {
        return { install: { callKwargs: async () => undefined } };
    }

    runPython(code: string) {
        this.runPythonCalls.push(code);
        if (code === "_repl_export") return this.exportJson;
        return "";
    }

    // eslint-disable-next-line class-methods-use-this
    async runPythonAsync() {
        return undefined;
    }

    // eslint-disable-next-line class-methods-use-this
    toPy(value: unknown) {
        return value;
    }
}

// The wheels are fetched over HTTP during initialize; nothing here cares about their contents.
function stubWheelFetch() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).fetch = async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () => new ArrayBuffer(8),
    });
}

/** One record in the shape collect_changed_materials.py emits (snake_case is the wire format). */
const changedRecord = (variableName: string) => ({
    variable_name: variableName,
    config: { name: variableName },
});

let session: MaterialsReplSession;
let fake: FakePyodide;

/**
 * Replaces the current session with a freshly initialized one. The dispose() first is required, not
 * tidiness: cove enforces one interpreter per page, so a second session cannot initialize until the
 * previous one has released its claim.
 */
async function startSession() {
    session?.dispose();
    stubWheelFetch();
    session = new MaterialsReplSession();
    fake = new FakePyodide();
    // Point at an absolute URL: the production default is the same-origin path `/repl-wheels`, which
    // `fetch` cannot resolve outside a browser.
    session.setWheelBaseUrl("http://127.0.0.1/repl-wheels");
    await session.initialize(fake);
}

describe("MaterialsReplSession", () => {
    beforeEach(startSession);

    describe("collectChangedMaterials", () => {
        it("assigns a clientId to a newly seen variable", () => {
            fake.exportJson = JSON.stringify([changedRecord("supercell")]);

            const operations = session.collectChangedMaterials();

            expect(operations).toHaveLength(1);
            expect(operations[0].variableName).toBe("supercell");
            expect(operations[0].clientId).toMatch(/^[0-9a-zA-Z]{12}$/);
        });

        it("reuses the clientId for the same variable, so a re-run updates in place", () => {
            fake.exportJson = JSON.stringify([changedRecord("supercell")]);

            const first = session.collectChangedMaterials()[0].clientId;
            const second = session.collectChangedMaterials()[0].clientId;

            expect(second).toBe(first);
        });

        it("gives different variables different clientIds", () => {
            fake.exportJson = JSON.stringify([changedRecord("slab"), changedRecord("supercell")]);

            const [slab, supercell] = session.collectChangedMaterials();

            expect(slab.clientId).not.toBe(supercell.clientId);
        });

        it("keeps mappings across a rename, so the old variable's slot is not stolen", () => {
            fake.exportJson = JSON.stringify([changedRecord("supercell")]);
            const supercellClientId = session.collectChangedMaterials()[0].clientId;

            fake.exportJson = JSON.stringify([changedRecord("renamed")]);
            const renamedClientId = session.collectChangedMaterials()[0].clientId;

            fake.exportJson = JSON.stringify([changedRecord("supercell")]);
            expect(session.collectChangedMaterials()[0].clientId).toBe(supercellClientId);
            expect(renamedClientId).not.toBe(supercellClientId);
        });

        it("returns nothing when the run changed nothing", () => {
            fake.exportJson = "[]";

            expect(session.collectChangedMaterials()).toEqual([]);
        });

        it("passes the config through untouched — the reducer owns naming", () => {
            fake.exportJson = JSON.stringify([
                { variable_name: "supercell", config: { name: "from-python", lattice: { a: 1 } } },
            ]);

            expect(session.collectChangedMaterials()[0].config).toEqual({
                name: "from-python",
                lattice: { a: 1 },
            });
        });

        it("does not survive a fresh session — ids are per-interpreter, like the namespace", async () => {
            fake.exportJson = JSON.stringify([changedRecord("supercell")]);
            const firstClientId = session.collectChangedMaterials()[0].clientId;

            await startSession();
            fake.exportJson = JSON.stringify([changedRecord("supercell")]);

            expect(session.collectChangedMaterials()[0].clientId).not.toBe(firstClientId);
        });
    });

    describe("injectMaterials", () => {
        it("hands the configs and the active index to Python as globals", () => {
            const configs = [
                new MDMaterial({ name: "Si" }).toJSON(),
                new MDMaterial({ name: "Ge" }).toJSON(),
            ];

            session.injectMaterials(configs, 1);

            expect(fake.globals.store.get("_repl_injected_json")).toBe(JSON.stringify(configs));
            expect(fake.globals.store.get("_repl_active_index")).toBe(1);
        });

        it("is a no-op for an empty list, which inject_materials.py could not handle", () => {
            const callsBefore = fake.runPythonCalls.length;

            session.injectMaterials([], 0);

            expect(fake.runPythonCalls.length).toBe(callsBefore);
            expect(fake.globals.store.has("_repl_injected_json")).toBe(false);
        });
    });

    describe("bootstrapNamespace", () => {
        it("reserves the injected input names so they are never synced back as user output", () => {
            expect(fake.globals.store.get("_reserved_input_names")).toEqual([
                "materials_in",
                "material",
            ]);
        });
    });
});

describe("REPL environment configuration", () => {
    it("pins the pyodide devDependency exactly to the version the browser loads", async () => {
        // Two independent declarations of one version: the CDN URL the browser loads, and the npm
        // package the integration test loads. The pin must be EXACT — with a `^` range, npm resolved
        // 0.24.1 while the browser kept loading v0.24.0, so the two halves of this feature were
        // silently running different Pyodide builds.
        const { devDependencies } = await import("../../../package.json");
        expect(devDependencies.pyodide).toBe(replPackages.pyodideVersion);
    });

    it("has a wheel file for every wheel the session expects to install", () => {
        expect(replPackages.wheelFilenames.length).toBeGreaterThan(0);
        expect(replPackages.wheelFilenames.every((name) => name.endsWith(".whl"))).toBe(true);
    });
});
