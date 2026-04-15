# srcdev-nuxt-i18n

A standalone [Nuxt layer](https://nuxt.com/docs/getting-started/layers) providing i18n infrastructure for SRCDEV apps. Consuming apps get locale switching, RTL support, and reusable error translations out of the box via Nuxt's `extends` mechanism.

## What's included

- **`@nuxtjs/i18n` v10** configured with 3 locales: `en-GB` (LTR), `zh-CN` (LTR), `ar-YE` (RTL)
- **`useRawLocaleData<T>(path, defaultValue?)`** — hydration-safe locale data composable with AST normalisation
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

## Notes

- `langDir` in `nuxt.config.ts` resolves relative to the layer root, so it works correctly when consumed via `extends`
- Generated `.ts` locale files are committed — consuming apps do not need to run the build script
- RTL support (`ar-YE`) requires CSS in the consuming app (`:dir(rtl)` or `[dir="rtl"]` selectors) — not provided by this layer
- Extracted from `srcdev-design-system`, which remains the canonical reference for original patterns and decisions
