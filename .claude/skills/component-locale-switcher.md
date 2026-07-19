# LocaleSwitcher Component

## Overview

`LocaleSwitcher` is a renderless-by-default component: it owns the *logic* (reading `locales`/`locale`/`setLocale` from `useI18n()`), not the markup. By default it renders a button per configured locale, but the default markup is just fallback content for its default scoped slot — consumers who want a `<select>`, radio group, or anything else override the slot instead of reaching for a `variant` prop. It ships in this layer (`components/locale-switcher/LocaleSwitcher.vue`) and is available via Nuxt auto-import in any consuming app — no manual import needed.

## Usage

### Default (button group)

```vue
<template>
  <LocaleSwitcher />
</template>
```

No props. Renders a button per entry in the `locales` array (so it automatically reflects however many locales the consuming app has configured, including any added beyond the layer's base three).

### Custom markup via the default scoped slot

Override the slot to get any UI you want — the component still owns the locale list, current locale, and switch logic:

```vue
<template>
  <LocaleSwitcher v-slot="{ locales, currentLocale, setLocale }">
    <select @change="setLocale(($event.target as HTMLSelectElement).value)">
      <option
        v-for="loc in locales"
        :key="loc.code"
        :value="loc.code"
        :selected="loc.code === currentLocale"
      >
        {{ loc.name }}
      </option>
    </select>
  </LocaleSwitcher>
</template>
```

Slot scope: `locales` (the full `locales` array from `useI18n()`), `currentLocale` (the active locale code), `setLocale` (call with a locale code — same async function the default buttons use internally).

Providing the slot fully replaces the default button-group markup (and its bundled CSS class names) — there's no way to keep the buttons and just restyle them via the slot; use the "Styling" section below for that instead.

### Custom markup: flag-icon buttons

A consuming app may want a flag icon per locale rather than (or alongside) the text name — e.g. using `srcdev-nuxt-components`'s `InputButtonCore` and `@nuxt/icon`:

```vue
<template>
  <LocaleSwitcher v-slot="{ locales, currentLocale, setLocale }">
    <div class="locale-switcher-buttons">
      <InputButtonCore
        v-for="loc in locales"
        :key="loc.code"
        :variant="loc.code === currentLocale ? 'primary' : 'tertiary'"
        :button-text="loc.name"
        @click="setLocale(loc.code)"
      >
        <template #left>
          <Icon :name="`flag:${flagCode(loc.language)}-4x3`" aria-hidden="true" />
        </template>
      </InputButtonCore>
    </div>
  </LocaleSwitcher>
</template>

<script setup lang="ts">
// Derives the flag icon's country code from a locale's language tag, e.g. "en-GB" -> "gb"
const flagCode = (language?: string) => language?.split("-").at(-1)?.toLowerCase() ?? ""
</script>
```

Two things this relies on that are **not** provided by this layer:

- **`@iconify-json/flag`** must be installed in the consuming app (`npm i -D @iconify-json/flag`) — it's not one of this layer's dependencies. Icon names follow `flag:<country-code>-4x3` (rectangular) or `flag:<country-code>-1x1` (square).
- **Derive the country code from `language`, not `code`.** A locale's short `code` (e.g. `cn`, `ary`) is an arbitrary identifier chosen by the consuming app, not a reliable ISO 3166 country code — `ary` is actually the ISO 639-3 code for Moroccan Arabic, not a country at all. The `language` field (a full BCT-47-style tag like `en-GB`/`zh-CN`/`ar-YE`) has the real country code as its last segment, which is what `flagCode()` extracts.

If you don't want a wrapper component at all, `useI18n()` already gives you `locales`/`locale`/`setLocale` directly — `LocaleSwitcher`'s slot exists purely for the convenience of not re-deriving that in every consuming app.

## Styling

Unscoped `.locale-switcher` / `.locale-switcher button` / `.locale-switcher button.active` classes with placeholder colours (`lightgray` background, `#007acc` active state) — these only apply to the **default** button-group markup. Override in the consuming app's CSS — there is no CSS custom property token API yet (unlike `srcdev-nuxt-components`'s pattern); if you need per-instance overrides, either wrap it and target `.locale-switcher` from a parent selector, or open an issue against this layer to add token support.

## History

Carried over from `srcdev-design-system`'s original `locale-switcher` component with one bug fix: the original template was

```vue
<button v-for="locale in locales" :class="{ active: locale === locale.code }">
```

The `v-for="locale in locales"` loop variable shadowed the outer `locale` ref from `useI18n()`, so `locale === locale.code` compared the loop item to its own `.code` property and was always `false` — the active state never worked. Fixed by renaming the loop variable to `loc` and comparing against the (now-unshadowed) outer `locale`:

```vue
<button v-for="loc in locales" :class="{ active: loc.code === locale }">
```

Later given a default scoped slot (wrapping the same button-group markup as fallback content) so consumers aren't limited to a button group — mirrors the `#cta` scoped-slot pattern already established on `PricingCard` in `srcdev-nuxt-components`, rather than growing a `variant` prop with a new template branch per UI shape.

## Notes

- Not reactive-lang-aware on its own — pair with the `app.vue` `useHead()` pattern in `setup-consumer.md` step 5 so `<html lang>`/`dir` update when a user clicks a switcher button.
- `dir="rtl"` locales (e.g. `ar-YE`) need consuming-app CSS to actually flip layout — this component and the layer provide no RTL styling.
