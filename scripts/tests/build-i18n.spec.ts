import { describe, it, expect } from "vitest"
import { deepMerge } from "../build-i18n.mjs"

describe("deepMerge", () => {
  it("merges non-overlapping keys from both objects", () => {
    expect(deepMerge({ a: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 })
  })

  it("recursively merges nested objects", () => {
    const target = { global: { siteName: "" }, errors: { 404: { title: "Not Found" } } }
    const source = { global: { siteName: "GuideMyHair" } }
    expect(deepMerge(target, source)).toEqual({
      global: { siteName: "GuideMyHair" },
      errors: { 404: { title: "Not Found" } },
    })
  })

  it("replaces arrays wholesale rather than merging element-by-element", () => {
    const target = { features: ["A", "B", "C"] }
    const source = { features: ["X"] }
    expect(deepMerge(target, source)).toEqual({ features: ["X"] })
  })

  it("source values win on scalar key conflicts", () => {
    expect(deepMerge({ title: "Old" }, { title: "New" })).toEqual({ title: "New" })
  })

  it("does not mutate the target object", () => {
    const target = { a: { b: 1 } }
    const result = deepMerge(target, { a: { c: 2 } })
    expect(target).toEqual({ a: { b: 1 } })
    expect(result).toEqual({ a: { b: 1, c: 2 } })
  })
})
