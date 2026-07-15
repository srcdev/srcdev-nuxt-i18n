import { defineVitestConfig } from "@nuxt/test-utils/config";

export default defineVitestConfig({
  test: {
    environment: "nuxt", // Use the Nuxt environment for tests
    globals: true, // Allows using describe, test, expect without imports
    include: ["**/*.test.ts", "**/*.spec.ts"], // ← ignores .playwright.ts files
    exclude: ["**/node_modules/**", "**/.nuxt/**", "**/playwright/**"], // Exclude unnecessary directories
    setupFiles: ["./test/vitest.setup.ts"], // Global setup file for mocks
  },
});
