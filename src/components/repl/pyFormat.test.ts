import { describe, expect, it } from "vitest";

import { shortenQualifiedNames } from "./pyFormat";

describe("shortenQualifiedNames", () => {
    it("collapses a dotted module path to the class name", () => {
        expect(shortenQualifiedNames("mat3ra.made.material.Material")).toBe("Material");
    });

    it("collapses every qualified name inside a Union", () => {
        expect(
            shortenQualifiedNames(
                "crystal: Union[mat3ra.made.material.Material, " +
                    "mat3ra.made.tools.build_components.metadata.material_with_build_metadata.MaterialWithBuildMetadata]",
            ),
        ).toBe("crystal: Union[Material, MaterialWithBuildMetadata]");
    });

    it("leaves numeric literals and plain generics untouched", () => {
        expect(shortenQualifiedNames("vacuum: float = 10.0")).toBe("vacuum: float = 10.0");
        expect(shortenQualifiedNames("miller_indices: Tuple[int, int, int] = (0, 0, 1)")).toBe(
            "miller_indices: Tuple[int, int, int] = (0, 0, 1)",
        );
    });

    it("collapses a qualified type inside Optional", () => {
        expect(
            shortenQualifiedNames(
                "termination_top: Optional[mat3ra.made.tools.build_components.entities.auxiliary.two_dimensional.termination.Termination] = None",
            ),
        ).toBe("termination_top: Optional[Termination] = None");
    });
});
