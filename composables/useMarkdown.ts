import MarkdownIt from "markdown-it"

const md = new MarkdownIt({
  html: false,
  linkify: false,
  breaks: true,
})

const defaultRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  if (!token) {
    return defaultRender(tokens, idx, options, env, self)
  }
  const hrefIndex = token.attrIndex("href")

  if (hrefIndex >= 0) {
    let href: string | undefined = undefined
    if (token.attrs && token.attrs[hrefIndex]) {
      href = token.attrs[hrefIndex][1]
    }

    // Add target only for external links
    if (href && href.startsWith("http")) {
      token.attrSet("target", "_blank")
      token.attrSet("rel", "noopener noreferrer")
    }
    // Internal anchors (#...) or relative paths (/about) → no target
  }

  return defaultRender(tokens, idx, options, env, self)
}

export function useMarkdown() {
  const renderMarkdown = (text: string): string => {
    return md.renderInline(text)
  }

  return { renderMarkdown }
}
