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

### Key architectural decision: langDir in layers — CORRECTED 2026-07-15

**The original note here was wrong** and shipped a real bug until the first
consuming app (`guidemyhair`) actually tested it. `@nuxtjs/i18n` v10 does
**not** resolve `langDir` relative to the layer's own root directly — it
resolves in two steps (confirmed by reading `resolveI18nDir` and
`applyLayerOptions` in `node_modules/@nuxtjs/i18n/dist/module.mjs`):

1. `resolveI18nDir(layer, i18n)` → `resolve(layer.config.rootDir, i18n.restructureDir ?? "i18n")`
   — i.e. `<rootDir>/i18n` by default.
2. `langDir` is then resolved **relative to that i18n directory**:
   `resolve(resolveI18nDir(...), i18n.langDir ?? "locales")`.

So the correct value, given locale files live at `<rootDir>/i18n/locales/*.ts`,
is `langDir: "locales"` — **not** `langDir: "i18n/locales"`. The old value
resolved to the nonexistent `<rootDir>/i18n/i18n/locales` and would have
silently failed to load any translations for every consumer. Fixed in
`nuxt.config.ts`. This same wrong value was also copied into
`.claude/skills/locale-add-app-translations.md` and the README — both fixed
too. The generated `.ts` locale files are committed to the repo so consuming
apps do not need to run the build script.

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

### 1. ~~Wire up a consuming app locally~~ — DONE 2026-07-15

First real consumer: `guidemyhair` (`/Users/simoncornforth/websites/guidemyhair`),
tested via a `file:../srcdev-nuxt-i18n` dependency. This is what surfaced and
fixed the `langDir` bug above, plus the issues in "Local `file:` testing
gotchas" below. Confirmed working end-to-end: `/cn` and `/ary` routes resolve,
`i18n_redirected` cookie set correctly, SSR payload shows correct resolved
locale, reactive `<html lang>`/`dir` (via the pattern in `locale-add-app-translations.md`),
and `useRawLocaleData` correctly avoids the `tm()` AST-in-template bug (see
"tm() renders AST JSON" below).

### Local `file:` testing gotchas (found via the guidemyhair test)

Two problems only show up when testing via a local `file:` dependency (not
when installed for real from npm) — worth knowing before testing again:

- **The layer's own `node_modules` must exist.** A `file:` dependency is a
  symlink to the real directory, not a copy — npm does not automatically run
  `npm install` inside a linked local package to fetch its own dependencies.
  Run `npm install` inside `srcdev-nuxt-i18n` itself first, or the consuming
  app's install will fail with `Could not load @nuxtjs/i18n. Is it installed?`
- **`tsconfig.json` extends a path that doesn't exist locally.** This repo's
  `tsconfig.json` extends `./.nuxt/tsconfig.json`, which only exists after
  running `nuxt prepare` in this directory. It's not in `package.json`'s
  `files` array so it never ships to a real npm install, but a `file:` link
  exposes the whole repo including this file — Vite/jiti resolve the nearest
  `tsconfig.json` when loading the `.ts` locale files at runtime, hit the
  broken `extends`, and silently fail to load messages (`WARN Failed to load
  messages for locale...`). Fix: run `nuxt prepare` inside `srcdev-nuxt-i18n`
  once before testing a consumer against it locally.
- The layer's own `package.json` had `"postinstall": "nuxt prepare"`, which
  **failed** the moment the layer was installed as a `file:` dependency with
  an empty `node_modules` inside it (no `nuxt` CLI resolvable) — this
  reproduces identically if renamed to the `prepare` lifecycle hook, since
  npm runs `prepare` for `file:`/git "install from source" dependencies too.
  **Resolution**: this is only a problem when the layer's own `node_modules`
  is missing `nuxt` — once `npm install` has been run inside
  `srcdev-nuxt-i18n` itself (see the point above), `prepare` succeeds even
  via a `file:` link, since it resolves `nuxt` from the layer's own nested
  `node_modules/.bin`. Confirmed via `npm pack` + install-as-tarball that
  `prepare` does **not** run at all for a normal registry/tarball install —
  it's exclusively a `file:`/git-dependency behaviour. So a `"prepare": "nuxt
  prepare"` script (matching the `srcdev-nuxt-components` convention) is safe
  to keep: harmless for real npm consumers, and only requires one extra
  `npm install` step inside this repo for local `file:` testing.

### tm() renders AST JSON instead of plain text

`tm()` returns compiled Vue I18n message AST nodes for array/object paths, not
plain values. Using `tm(path) as string[]` directly in a `v-for` (e.g. for a
features list) renders the raw AST object (`{"type":0,"start":0,...}`) as
text instead of the string. **Always use `useRawLocaleData<T>(path, default)`
for arrays/objects** — this is exactly what that composable exists to solve
(see `composable-use-raw-locale-data.md`). Found and fixed on the pricing
page's feature lists in `guidemyhair`.

### 2. Publish to npm

When the layer is ready for use across multiple projects:

- Create a GitHub repo for `srcdev-nuxt-i18n`
- Push and create a release
- `npm publish` (already configured: `private` not set, `files` array defined
  — now includes `components/`, see below)
- Update consuming apps to use the npm package name instead of a local path:
  `extends: ["srcdev-nuxt-i18n"]`

### 3. ~~Consider adding a locale-switcher component~~ — DONE 2026-07-15

Added `components/locale-switcher/LocaleSwitcher.vue`, carried over from
`srcdev-design-system` with one bug fix: the original had
`:class="{ active: locale === locale.code }"` inside a `v-for="locale in
locales"` — the loop variable shadowed the outer `locale` ref from
`useI18n()`, so the comparison was always false. Renamed the loop variable to
`loc` and compare against the outer `locale` (auto-unwrapped in the
template). `package.json`'s `files` array updated to include `components`.

### 4. Update srcdev-design-system to use this layer

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
