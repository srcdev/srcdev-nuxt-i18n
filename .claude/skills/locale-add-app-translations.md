# Add App-Specific Translations in a Consuming App

## Overview

The layer provides base translations (`global`, `errors`). Consuming apps add their own keys (pages, components, site name) on top. This skill covers both approaches: simple inline override and the full modular build pipeline.

## Approach A — Simple override (no build script)

Use this when you only need to override a handful of keys (e.g. `global.siteName`) and do not need the modular JSON source structure.

### 1. Add locale files to the consuming app

Create `i18n/locales/` in the consuming app with one file per locale:

```ts
// app/i18n/locales/en-GB.ts  (or just i18n/locales/en-GB.ts)
export default {
  global: {
    siteName: "My App Name",
  },
  pages: {
    home: {
      heading: "Welcome",
    },
  },
} as const
```

### 2. Add locale config to the consuming app's `nuxt.config.ts`

`@nuxtjs/i18n` merges locale files from multiple layers — the consuming app's keys win on conflict.

```ts
i18n: {
  langDir: "locales", // resolves to <rootDir>/i18n/locales — see "langDir gotcha" below
  locales: [
    { code: "en", language: "en-GB", file: "en-GB.ts" },
    { code: "cn", language: "zh-CN", file: "zh-CN.ts" },
    { code: "ary", language: "ar-YE", file: "ar-YE.ts" },
  ],
}
```

No `defaultLocale` or `detectBrowserLanguage` needed — those are inherited from the layer.

#### `langDir` gotcha

`@nuxtjs/i18n` resolves `langDir` in two steps: first it resolves an i18n
directory (`<rootDir>/i18n` by default), then resolves `langDir` **relative
to that**, not relative to `rootDir` directly. So if your locale files live
at `<rootDir>/i18n/locales/*.ts` (the standard layout, matching this repo's
own `i18n/locales/`), the correct value is `langDir: "locales"` — **not**
`langDir: "i18n/locales"`, which resolves to the nonexistent
`i18n/i18n/locales` and silently fails to load any translations. This exact
mistake shipped in this layer's own `nuxt.config.ts` until a real consumer
test caught it — see `TODO.md`.

---

## Approach B — Modular build pipeline (recommended for larger apps)

Use this when the app has many pages or components with their own translation keys. Mirrors the structure used in the layer itself.

### 1. Add the build script

Copy `scripts/build-i18n.mjs` from the layer into the consuming app's `scripts/` directory. The paths inside it are relative to `__dirname` so they work unchanged.

### 2. Add source JSON files

```text
i18n-source/
└── locales/
    ├── global/
    │   ├── en-GB.json    ← override siteName here
    │   ├── zh-CN.json
    │   └── ar-YE.json
    └── pages/
        └── home/
            ├── en-GB.json
            ├── zh-CN.json
            └── ar-YE.json
```

### 3. Add scripts to `package.json`

```json
"scripts": {
  "build:i18n": "node scripts/build-i18n.mjs",
  "build:i18n:watch": "node scripts/build-i18n.mjs --watch",
  "dev": "concurrently \"npm run build:i18n:watch\" \"nuxt dev\" --names \"i18n,nuxt\" --prefix-colors \"cyan,green\""
}
```

### 4. Declare the generated files in `nuxt.config.ts`

Same as Approach A step 2 — `langDir: "locales"` (see the `langDir` gotcha above), pointing at the consuming app's `i18n/locales/`.

### 5. Run the build

```bash
npm run build:i18n
```

## Notes

- The layer's `i18n/locales/*.ts` files are always loaded first. The consuming app's files are merged on top — the app wins on any overlapping key.
- Keep `global.siteName` in the consuming app's source, never in the layer — it is app-specific by definition.
- If using Approach B, commit the generated `i18n/locales/*.ts` files to the consuming app's repo so CI does not need to run the build script.
- **Any array or object value in your translation JSON** (e.g. a page's feature list, FAQ items, nav links) **must be read with `useRawLocaleData<T>()`, not `tm()`.** `tm()` returns compiled AST nodes for non-string paths — rendering it directly in a `v-for` shows raw AST JSON on the page instead of the string. See `composable-use-raw-locale-data.md`. `$t()` remains correct for plain string keys.
- Namespace page-specific keys under `pages.<pageName>.*` to match the `i18n-source/locales/pages/<pageName>/` directory — this mirrors `srcdev-design-system`'s convention and keeps keys discoverable from the file path.
