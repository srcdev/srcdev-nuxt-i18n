# Wire Up a Consuming App

## Overview

Steps to add `srcdev-nuxt-i18n` as a Nuxt layer in any consuming app. The layer provides `@nuxtjs/i18n` configuration, three base locales (en-GB, zh-CN, ar-YE), and the `useRawLocaleData` / `useMarkdown` composables via auto-import.

## Prerequisites

- Consuming app is Nuxt 4 (`nuxt ^4.0.0`)
- The layer is either published to npm or available as a local path

## Steps

### 1. Install the layer

**From npm (once published):**

```bash
npm install srcdev-nuxt-i18n
```

**From a local path (during development):**

No install needed — reference the path directly in step 2.

### 2. Add to `extends` in `nuxt.config.ts`

```ts
export default defineNuxtConfig({
  extends: [
    "srcdev-nuxt-components", // if used
    "srcdev-nuxt-i18n",       // npm package
    // or for local dev:
    // "../srcdev-nuxt-i18n",
  ],
})
```

Do **not** re-declare `@nuxtjs/i18n` in the consuming app's `modules` array — the layer registers it. Do **not** repeat the `locales` config unless you are adding extra locales beyond the three base ones.

### 3. Install peer dependencies

```bash
npm install @nuxtjs/i18n markdown-it
```

Both are declared as `dependencies` in the layer and will be hoisted by npm, but explicitly installing them in the consuming app avoids version drift.

### 4. Override `global.siteName`

The layer ships `global.siteName` as an empty string. Each consuming app must provide its own value. The simplest approach is to override it directly in the consuming app's `i18n` config:

```ts
// nuxt.config.ts
i18n: {
  // merge extra keys per locale — these override the layer's base translations
}
```

Or add a `i18n-source/locales/global/en-GB.json` in the consuming app and run the build script (see `locale-add-app-translations` skill).

### 5. Verify

Run the consuming app:

```bash
npm run dev
```

Check:

- The browser console shows no i18n warnings
- `$t('errors.404.title')` resolves correctly in a test component
- The `i18n_redirected` cookie is set on first visit
- `useRawLocaleData` and `useMarkdown` are available via auto-import in `<script setup>`

## Notes

- `detectBrowserLanguage` is enabled by default (cookie-based, redirects on root). To disable it in a consuming app, add `i18n: { detectBrowserLanguage: false }` to the app's `nuxt.config.ts` — it overrides the layer's setting.
- RTL support (`ar-YE`) requires CSS in the consuming app — the layer provides no styles. Use `:dir(rtl)` selectors or `[dir="rtl"]` attribute selectors.
