import { describe, expect, it } from "vitest";

import { getNotebooksUtilsWheelFilename } from "../../src/components/repl/requirements";

describe("AX REPL requirements", () => {
    it("takes the bootstrap wheel from AX's Pyodide lock", () => {
        expect(
            getNotebooksUtilsWheelFilename(
                JSON.stringify({ packages: { mat3ra: { file_name: "notebooks.whl" } } }),
            ),
        ).toBe("notebooks.whl");
    });
});
