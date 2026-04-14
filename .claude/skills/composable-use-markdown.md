# useMarkdown Composable

## Overview

`useMarkdown` provides a lightweight markdown renderer for locale strings. It converts inline markdown (bold, italic, links) to HTML using `markdown-it`, with automatic `target="_blank" rel="noopener noreferrer"` on external links and no target on internal ones.

**This composable ships inside `srcdev-nuxt-i18n`** (`composables/useMarkdown.ts`). Available via Nuxt auto-import — **do not create a local copy**.

## Signature

```ts
function useMarkdown(): {
  renderMarkdown: (text: string) => string
}
```

## Usage

### In `<script setup>`

```ts
const { renderMarkdown } = useMarkdown()
```

### In the template — always use `v-html`

```html
<p v-html="renderMarkdown($t('pages.terms.intro'))" />
```

### With `useRawLocaleData` for structured content

```ts
const { renderMarkdown } = useMarkdown()
const sections = useRawLocaleData<{ title: string; content: string[] }[]>("pages.terms.sections", [])
```

```html
<div v-for="section in sections" :key="section.title">
  <h2 v-html="renderMarkdown(section.title)" />
  <p
    v-for="(paragraph, i) in section.content"
    :key="i"
    v-html="renderMarkdown(paragraph)"
  />
</div>
```

## Markdown features supported

| Syntax | Output |
|---|---|
| `**bold**` | `<strong>bold</strong>` |
| `_italic_` | `<em>italic</em>` |
| `[text](https://...)` | `<a href="..." target="_blank" rel="noopener noreferrer">text</a>` |
| `[text](/internal)` | `<a href="/internal">text</a>` |
| `[text](#anchor)` | `<a href="#anchor">text</a>` |

HTML in locale strings is **disabled** (`html: false`) — locale authors cannot inject raw HTML tags.

## Link behaviour

- URLs starting with `http` → external → gets `target="_blank"` and `rel="noopener noreferrer"`
- URLs starting with `/` or `#` → internal → no target attribute added

## Security note

`v-html` renders the output as raw HTML. This is safe here because:

1. `html: false` in the `markdown-it` config strips any raw HTML tags from locale strings
2. Locale content is authored by you, not user-supplied input

**Never** pipe untrusted user content through `renderMarkdown` and render with `v-html`.

## Notes

- `renderMarkdown` uses `md.renderInline()` — it does not wrap output in a `<p>` tag. Use it inside an existing block element.
- The `markdown-it` instance is module-level (shared across calls) — this is intentional for performance. It is stateless.
- `breaks: true` is set — single newlines in locale strings become `<br>` tags.
