import { vi, afterEach } from "vitest";

// Use fake timers to prevent Nuxt timeout issues
vi.useFakeTimers();

// Mock $fetch to prevent ReferenceError during test teardown
// This global mock ensures Nuxt composables don't fail when accessing $fetch
const mockFetch = vi.fn().mockResolvedValue({});
vi.stubGlobal("$fetch", mockFetch);

// Also mock fetch for completeness
vi.stubGlobal("fetch", mockFetch);

// Mock buildAssetsURL to prevent manifest loading errors
vi.stubGlobal(
  "buildAssetsURL",
  vi.fn((path: string) => path),
);

// Mock useRuntimeConfig to prevent config access errors
vi.stubGlobal(
  "useRuntimeConfig",
  vi.fn(() => ({
    app: { buildId: "test" },
    public: {},
  })),
);

// Clear all timers after each test to prevent unhandled timeouts
afterEach(() => {
  vi.clearAllTimers();
  vi.runOnlyPendingTimers();
});
