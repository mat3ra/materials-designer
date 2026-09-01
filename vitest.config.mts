import { defineConfig } from "vitest/config";

// Unit tests for the v2 spine. The Cypress suite in tests/ is untouched and
// still covers the v1 app end to end.
export default defineConfig({
    test: {
        include: ["tests/vitest/**/*.test.ts"],
        setupFiles: ["tests/vitest/setup.ts"],
        environment: "node",
    },
});
