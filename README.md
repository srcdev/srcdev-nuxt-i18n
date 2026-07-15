# srcdev-nuxt-i18n

A standalone [Nuxt layer](https://nuxt.com/docs/getting-started/layers) providing i18n infrastructure for SRCDEV apps. Consuming apps get locale switching, RTL support, and reusable error translations out of the box via Nuxt's `extends` mechanism.

## What's included

- **`@nuxtjs/i18n` v10** configured with 3 locales: `en-GB` (LTR), `zh-CN` (LTR), `ar-YE` (RTL)
- **`LocaleSwitcher`** component — renders a button per locale, calls `setLocale()` on click, available via Nuxt auto-import
- **`useRawLocaleData<T>(path, defaultValue?)`** — hydration-safe locale data composable with AST normalisation. **Required** for arrays/objects — see "Known gotchas" below
- **`useMarkdown()`** — markdown-it renderer; external links get `target="_blank" rel="noopener noreferrer"`
- **Base translations** — `global.siteName` (blank, override in consuming app) and reusable `errors.*` keys (404, 500, serverError, general, actions, help, contact)
- **Build script** — merges modular JSON source files into compiled `.ts` locale files

## Usage

### 1. Install peer dependencies in your consuming app

```bash
npm install @nuxtjs/i18n@10.2.1 markdown-it
```

### 2. Extend the layer

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  extends: ["../srcdev-nuxt-i18n"], // local path, or npm package name once published
})
```

### 3. Override `global.siteName`

Create a locale source file in your consuming app:

```json
// i18n-source/locales/global/en-GB.json
{ "global": { "siteName": "Your App Name" } }
```

### 4. Wire up reactive `<html lang>`/`dir` and `titleTemplate`

Not automatic — add this to your consuming app's `app/app.vue` (or wherever
your root layout lives):

```vue
<script setup lang="ts">
const { locale, locales, t } = useI18n()

const currentLocale = computed(() => locales.value.find(l => l.code === locale.value))

useHead({
  htmlAttrs: {
    lang: computed(() => currentLocale.value?.language || currentLocale.value?.code || "en"),
    dir: computed(() => currentLocale.value?.dir || "ltr"),
  },
  titleTemplate: computed(() => `%s - ${t("global.siteName")}`),
})
</script>
```

Without this, `<html lang>` stays static regardless of the active locale.

## Claude Code Skills

This package ships Claude Code skills — reference docs for i18n tasks and composables — in the `.claude/` directory.

To copy them into your consuming app after install, add a `setup:claude` script:

```json
"scripts": {
  "setup:claude": "cp -r node_modules/srcdev-nuxt-i18n/.claude/skills .claude/skills/srcdev-nuxt-i18n",
  "postinstall": "nuxt prepare && npm run setup:claude"
}
```

Then run once to bootstrap:

```bash
npm run setup:claude
```

Skills land in `.claude/skills/srcdev-nuxt-i18n/` and never conflict with your own project's skills or skills from other layers.

### Using multiple SRCDEV layers

If your app also consumes `srcdev-nuxt-components`, chain both copy commands so a single `postinstall` handles all layers:

```json
"scripts": {
  "setup:claude": "cp -r node_modules/srcdev-nuxt-components/.claude/skills .claude/skills/srcdev-nuxt-components && cp -r node_modules/srcdev-nuxt-i18n/.claude/skills .claude/skills/srcdev-nuxt-i18n",
  "postinstall": "nuxt prepare && npm run setup:claude"
}
```

> See [.claude/skills/setup-postinstall.md](.claude/skills/setup-postinstall.md) for the full guide including CI setup.

## Repo structure

```text
srcdev-nuxt-i18n/
├── package.json
├── nuxt.config.ts                  ← i18n module config, 3 locales
├── tsconfig.json
├── scripts/
│   └── build-i18n.mjs              ← merge JSON → .ts, supports --watch
├── components/
│   └── locale-switcher/
│       └── LocaleSwitcher.vue      ← renders a button per locale, calls setLocale()
├── composables/
│   ├── useRawLocaleData.ts         ← useRawLocaleData<T>(path, defaultValue?)
│   └── useMarkdown.ts              ← useMarkdown() → { renderMarkdown(text) }
├── i18n-source/
│   └── locales/
│       └── global/
│           ├── en-GB.json          ← edit these to change source translations
│           ├── zh-CN.json
│           └── ar-YE.json
└── i18n/
    └── locales/
        ├── en-GB.ts                ← committed generated files (do not edit)
        ├── zh-CN.ts
        └── ar-YE.ts
```

## Commands

```bash
npm run dev               # run nuxt dev + i18n watch concurrently
npm run build             # build:i18n then nuxt build
npm run build:i18n        # regenerate i18n/locales/*.ts from i18n-source JSON once
npm run build:i18n:watch  # same, with file watching (used automatically by dev)
```

## Known gotchas

- **`tm()` renders raw AST JSON, not the string.** For array/object locale
  values (e.g. a features list), `tm(path)` returns compiled Vue I18n message
  AST nodes, not plain values — using it directly in a `v-for` renders
  `{"type":0,"start":0,...}` as text. Always use `useRawLocaleData<T>(path,
  default)` instead for arrays/objects; `$t()` remains correct for plain
  strings.
- **Testing via a local `file:` dependency needs one extra step.** npm does
  not install a linked local package's own dependencies automatically — run
  `npm install` inside `srcdev-nuxt-i18n` itself first, or a consumer's
  install will fail with `Could not load @nuxtjs/i18n. Is it installed?`. This
  same `npm install` also runs this repo's own `prepare` script (`nuxt
  prepare`), which is required separately: `tsconfig.json` extends
  `./.nuxt/tsconfig.json`, and Vite/jiti resolve the nearest `tsconfig.json`
  when loading `.ts` locale files at runtime — without it, translations
  silently fail to load (`WARN Failed to load messages for
  locale...`). Neither of these applies to a real npm install.

## Notes

- `langDir` resolves relative to `<rootDir>/i18n/` (not the layer root
  directly) — `resolveI18nDir()` resolves to `<rootDir>/i18n` first, then
  `langDir` is resolved relative to *that*. Since locale files live at
  `i18n/locales/*.ts`, the correct value is `langDir: "locales"`. This applies
  identically to a consuming app's own `i18n` config (see
  `locale-add-app-translations.md`), not just this layer.
- Generated `.ts` locale files are committed — consuming apps do not need to run the build script
- RTL support (`ar-YE`) requires CSS in the consuming app (`:dir(rtl)` or `[dir="rtl"]` selectors) — not provided by this layer
- Extracted from `srcdev-design-system`, which remains the canonical reference for original patterns and decisions
