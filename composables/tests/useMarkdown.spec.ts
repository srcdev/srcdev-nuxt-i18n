import { describe, it, expect } from "vitest"
import { useMarkdown } from "../useMarkdown"

describe("useMarkdown", () => {
  it("renders basic inline markdown to HTML", () => {
    const { renderMarkdown } = useMarkdown()
    expect(renderMarkdown("**bold** and _italic_")).toBe("<strong>bold</strong> and <em>italic</em>")
  })

  it("adds target=_blank and rel=noopener to external http(s) links", () => {
    const { renderMarkdown } = useMarkdown()
    const html = renderMarkdown("[link](https://example.com)")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')
  })

  it("does not add target to internal relative links", () => {
    const { renderMarkdown } = useMarkdown()
    const html = renderMarkdown("[about](/about)")
    expect(html).not.toContain("target=")
  })

  it("does not add target to internal anchor links", () => {
    const { renderMarkdown } = useMarkdown()
    const html = renderMarkdown("[section](#section)")
    expect(html).not.toContain("target=")
  })
})
