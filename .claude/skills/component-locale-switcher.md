# LocaleSwitcher Component

## Overview

`LocaleSwitcher` renders one button per configured locale and calls `setLocale()` when clicked. It ships in this layer (`components/locale-switcher/LocaleSwitcher.vue`) and is available via Nuxt auto-import in any consuming app — no manual import needed.

## Usage

```vue
<template>
  <LocaleSwitcher />
</template>
```

No props. It reads `locales`/`locale`/`setLocale` from `useI18n()` internally and renders a button per entry in the `locales` array (so it automatically reflects however many locales the consuming app has configured, including any added beyond the layer's base three).

## Styling

Unscoped `.locale-switcher` / `.locale-switcher button` / `.locale-switcher button.active` classes with placeholder colours (`lightgray` background, `#007acc` active state). Override in the consuming app's CSS — there is no CSS custom property token API yet (unlike `srcdev-nuxt-components`'s pattern); if you need per-instance overrides, either wrap it and target `.locale-switcher` from a parent selector, or open an issue against this layer to add token support.

## History

Carried over from `srcdev-design-system`'s original `locale-switcher` component with one bug fix: the original template was

```vue
<button v-for="locale in locales" :class="{ active: locale === locale.code }">
```

The `v-for="locale in locales"` loop variable shadowed the outer `locale` ref from `useI18n()`, so `locale === locale.code` compared the loop item to its own `.code` property and was always `false` — the active state never worked. Fixed by renaming the loop variable to `loc` and comparing against the (now-unshadowed) outer `locale`:

```vue
<button v-for="loc in locales" :class="{ active: loc.code === locale }">
```

## Notes

- Not reactive-lang-aware on its own — pair with the `app.vue` `useHead()` pattern in `setup-consumer.md` step 5 so `<html lang>`/`dir` update when a user clicks a switcher button.
- `dir="rtl"` locales (e.g. `ar-YE`) need consuming-app CSS to actually flip layout — this component and the layer provide no RTL styling.
