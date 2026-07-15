import { describe, it, expect, vi, beforeEach } from "vitest"

let mockRawMessages: Record<string, unknown> = {}
let mockTmResult: unknown

vi.mock("vue-i18n", () => ({
  useI18n: () => ({
    locale: { value: "en" },
    getLocaleMessage: () => mockRawMessages,
    tm: () => mockTmResult,
  }),
}))

const { useRawLocaleData } = await import("../useRawLocaleData")

describe("useRawLocaleData", () => {
  beforeEach(() => {
    mockRawMessages = {}
    mockTmResult = undefined
  })

  it("returns a plain string from raw locale messages", () => {
    mockRawMessages = { global: { siteName: "GuideMyHair" } }
    expect(useRawLocaleData<string>("global.siteName")).toBe("GuideMyHair")
  })

  it("returns a plain array from raw locale messages", () => {
    mockRawMessages = {
      pages: { pricing: { plans: { basic: { features: ["A", "B"] } } } },
    }
    expect(useRawLocaleData<string[]>("pages.pricing.plans.basic.features")).toEqual(["A", "B"])
  })

  it("resolves nested objects recursively", () => {
    mockRawMessages = { errors: { 404: { title: "Not Found", description: "Gone" } } }
    expect(useRawLocaleData("errors.404")).toEqual({ title: "Not Found", description: "Gone" })
  })

  // Regression test: tm() returns compiled Vue I18n message AST nodes for
  // array/object paths, not plain values. Rendering that AST directly in a
  // v-for shows raw JSON on the page instead of the string.
  it("normalises a compiled AST node (tm() shape) into its static string", () => {
    mockTmResult = {
      body: { static: "Hair type, natural colour, dream colour & application type steps" },
    }
    expect(useRawLocaleData<string>("pages.pricing.plans.basic.features.0")).toBe(
      "Hair type, natural colour, dream colour & application type steps",
    )
  })

  it("normalises an array of AST nodes", () => {
    mockTmResult = [{ body: { static: "Feature A" } }, { body: { static: "Feature B" } }]
    expect(useRawLocaleData<string[]>("path")).toEqual(["Feature A", "Feature B"])
  })

  it("falls back to tm() when the path is not found in raw messages", () => {
    mockRawMessages = { global: { siteName: "GuideMyHair" } }
    mockTmResult = "fallback value"
    expect(useRawLocaleData<string>("some.other.path")).toBe("fallback value")
  })

  it("returns the default value when nothing is found", () => {
    expect(useRawLocaleData<string[]>("missing.path", [])).toEqual([])
  })
})
