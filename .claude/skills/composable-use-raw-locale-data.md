# useRawLocaleData Composable

## Overview

`useRawLocaleData<T>` fetches structured locale data (objects, arrays, nested data) and normalises it from Vue I18n's internal AST representation back into plain JSON. It is the correct way to read non-string locale data (arrays, objects) in this layer.

**This composable ships inside `srcdev-nuxt-i18n`** (`composables/useRawLocaleData.ts`). It is available via Nuxt auto-import in all consuming apps — **do not create a local copy**.

## Why not just use `$t()` or `tm()`?

- `$t()` returns a string — it cannot return arrays or objects.
- `tm()` returns raw Vue I18n AST nodes during SSR, which differ from the plain objects you get client-side, causing hydration mismatches.
- `useRawLocaleData` resolves both: it normalises AST nodes to plain values and provides a typed, generic interface.

## Signature

```ts
function useRawLocaleData<T>(path: string, defaultValue?: T): T
```

- `path` — dot-notation key path into the locale messages (e.g. `"pages.home.items"`)
- `defaultValue` — optional fallback returned when the key is missing

## Usage examples

### Typed array of objects

```ts
interface ServiceItem {
  id: string
  title: string
  description: string
}

const services = useRawLocaleData<ServiceItem[]>("pages.services.items", [])
```

```html
<div v-for="item in services" :key="item.id">
  {{ item.title }}
</div>
```

### Simple string (prefer `$t()` for plain strings)

```ts
const siteName = useRawLocaleData<string>("global.siteName", "")
```

### Nested object

```ts
interface ErrorMessages {
  title: string
  description: string
}

const notFound = useRawLocaleData<ErrorMessages>("errors.404")
```

### With a default value to avoid null guards

```ts
const links = useRawLocaleData<{ label: string; href: string }[]>("nav.links", [])
// links is always an array — no null check needed
```

## How it resolves data

1. Reads raw messages from `getLocaleMessage(locale.value)` and resolves the dot-notation path
2. Falls back to `tm(path)` if the path is not found in raw messages
3. Runs `normalizeNode()` to strip AST wrappers and return plain JS values
4. Returns `defaultValue` if the result is still null/undefined

## Notes

- Call `useRawLocaleData` inside `<script setup>` or inside a composable — it calls `useI18n()` internally which requires an active Nuxt/Vue context.
- The return value is **not** reactive to locale changes on its own. If you need reactivity when the user switches locale, wrap it in a `computed`:

```ts
const items = computed(() => useRawLocaleData<Item[]>("pages.home.items", []))
```

- For plain string keys where hydration mismatch is not a concern, `$t()` / `useI18n().t()` is simpler and sufficient.
