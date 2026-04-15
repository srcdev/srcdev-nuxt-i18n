# srcdev-nuxt-i18n — Project History & TODO

## What this is

A standalone Nuxt layer that provides i18n infrastructure for SRCDEV apps/websites.
It is consumed by other apps via Nuxt's `extends` mechanism — no other layers, no CSS,
no components beyond what's needed for i18n. Pure i18n, exactly as intended.

---

## Background & decisions

### Where this came from

The i18n system was originally built inside `srcdev-design-system` (at
`/Users/simoncornforth/websites/srcdev-design-system`). **This repo is the
canonical source for all SRCDEV layer development — always cross-reference it
when looking for original implementations, patterns, or decisions.** That app also consumes
`srcdev-nuxt-components` as a layer. The decision was made to extract the i18n
infrastructure into its own standalone layer so any future app can consume it
independently without pulling in the components layer or anything else.

### What the design system's i18n looked like

- `@nuxtjs/i18n` v10.2.1 — module configured in `nuxt.config.ts`
- 3 locales: `en` (en-GB, LTR), `cn` (zh-CN, LTR), `ary` (ar-YE, RTL)
- Modular JSON source files in `i18n-source/locales/` organised by `global/`,
  `pages/`, and `components/*/locales/`
- A Node build script (`scripts/build-i18n.mjs`) deep-merges all JSON files per
  locale and outputs TypeScript files to `i18n/locales/`
- Two composables: `useRawLocaleData` (hydration-safe locale data access with AST
  normalisation) and `useMarkdown` (markdown-it renderer for locale strings)
- The locale files in the design system were POC/reference content only, not real
  production translations

### Key architectural decision: langDir in layers

`@nuxtjs/i18n` v10 resolves `langDir` relative to the layer's own root, so
`langDir: "i18n/locales"` in this repo's `nuxt.config.ts` resolves correctly
when consumed via `extends`. The generated `.ts` locale files are committed to
the repo so consuming apps do not need to run the build script.

### What was stripped out

The design system had page-specific and component-specific translations (footer,
navigation, login, terms, etc.) that are app-specific. These were NOT carried
over. This layer's `i18n-source` contains only:

- `global.siteName` — blank placeholder, each consuming app overrides this
- `errors.*` — 404, 500, serverError, general, actions, help, contact — genuinely
  reusable across any app

---

## What was built (completed)

- [x] `package.json` — name: `srcdev-nuxt-i18n`, v1.0.0, public (not private),
      `type: module`, deps: `@nuxtjs/i18n@10.2.1`, `markdown-it@14.1.0`,
      peer dep: `nuxt ^4.0.0`
- [x] `nuxt.config.ts` — i18n module only, 3 locales configured, `langDir: "i18n/locales"`
- [x] `tsconfig.json` — extends `.nuxt/tsconfig.json`
- [x] `.gitignore` — node_modules, .nuxt, .output, dist, .DS_Store
- [x] `scripts/build-i18n.mjs` — adapted from design system; key change: `componentsDir`
      now points to `./components` (not `./app/components`). Reads locales from
      `nuxt.config.ts` via regex, deep-merges JSON files, outputs `.ts` files.
      Supports `--watch` / `-w` flag for dev mode.
- [x] `composables/useRawLocaleData.ts` — generic, typed, hydration-safe locale data
      fetcher with AST normalisation. Copied from design system.
- [x] `composables/useMarkdown.ts` — markdown-it renderer, external links get
      `target="_blank" rel="noopener noreferrer"`, internal links do not.
      Copied from design system.
- [x] `i18n-source/locales/global/en-GB.json` — clean source (siteName + errors)
- [x] `i18n-source/locales/global/zh-CN.json` — clean source (siteName + errors)
- [x] `i18n-source/locales/global/ar-YE.json` — clean source (siteName + errors)
- [x] `i18n/locales/en-GB.ts` — committed generated file (in sync with source)
- [x] `i18n/locales/zh-CN.ts` — committed generated file
- [x] `i18n/locales/ar-YE.ts` — committed generated file
- [x] Git repo initialised, initial commit made (`fd4c342`)

---

## TODO — what still needs doing

### 1. Wire up a consuming app locally (test it works)

The consuming app is TBD — `luxury-locs-by-natasha-nuxt3` may get a fun
easter-egg translation but is not confirmed as the first production consumer.
Any Nuxt 4 app can consume this layer.

Steps:

- Add `@nuxtjs/i18n` and `markdown-it` to the consuming app's `package.json`
- Add `extends: ["../srcdev-nuxt-i18n"]` to its `nuxt.config.ts`
- Run `npm install` in both repos
- Run `nuxt dev` in the consuming app and verify i18n is active (locale switching,
  `$t()`, `useRawLocaleData()` all available)
- Check the browser language detection cookie (`i18n_redirected`) is working

### 2. Override `global.siteName` in the consuming app

Each consuming app should provide its own `i18n-source` with at minimum:

```json
// i18n-source/locales/global/en-GB.json
{ "global": { "siteName": "Luxury Locs by Natasha" } }
```

Decide: does the consuming app run the build script itself (adds its own
`build:i18n` script + `i18n/locales/` output), or does it rely solely on
the layer's base translations and just use `$t()` directly for app content?

The cleaner long-term pattern is probably: consuming app has its own
`i18n-source/` and its own `build:i18n` script, outputs to its own
`i18n/locales/`, and adds those locale files to its own `nuxt.config.ts`
i18n config. The layer provides the base, the app adds on top.

### 3. Publish to npm

When the layer is ready for use across multiple projects:

- Create a GitHub repo for `srcdev-nuxt-i18n`
- Push and create a release
- `npm publish` (already configured: `private` not set, `files` array defined)
- Update consuming apps to use the npm package name instead of a local path:
  `extends: ["srcdev-nuxt-i18n"]`

### 4. Consider adding a locale-switcher component

The design system has a `locale-switcher` component that could live in this layer,
making it available to all consuming apps automatically. Assess whether this makes
sense once the first consuming app is working.

### 5. Update srcdev-design-system to use this layer

Once published to npm, `srcdev-design-system` should be updated to:

- Remove its own `@nuxtjs/i18n` config from `nuxt.config.ts`
- Remove `scripts/build-i18n.mjs` (or keep for local dev of the layer itself)
- Add `srcdev-nuxt-i18n` to its `extends` array
- Keep its own page/component-specific `i18n-source/` files for app content

### 6. RTL support reminder

`ar-YE` uses `dir: "rtl"`. Consuming apps will need CSS to handle RTL layout
(`:dir(rtl)` selectors or `[dir="rtl"]`). This is not provided by the layer —
it's a styling concern for each consuming app.

---

## Repo structure reference

```text
srcdev-nuxt-i18n/
├── .gitignore
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

## Build commands (within this repo)

```bash
npm run build:i18n        # regenerate i18n/locales/*.ts from i18n-source JSON
npm run build:i18n:watch  # same, with file watching for dev
```
