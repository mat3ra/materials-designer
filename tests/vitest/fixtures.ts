import { defaultMaterialConfig } from "@mat3ra/made/dist/js/Material";

import { MDMaterial } from "../../src/MDMaterial";

type TestMaterialConfig = Partial<ConstructorParameters<typeof MDMaterial>[0]>;

/**
 * Build a material for tests from a complete, valid config.
 *
 * `Material`'s constructor parses `basis` unconditionally, so a name-only config throws before a test
 * ever reaches its assertion. Tests here only care about identity (name, `_id`, metadata), so they
 * override those fields on the default silicon config rather than spelling out a basis each time.
 */
export function createTestMaterial(config: TestMaterialConfig = {}): MDMaterial {
    return new MDMaterial({ ...defaultMaterialConfig, ...config });
}
