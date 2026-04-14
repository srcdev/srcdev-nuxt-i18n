# Component-Level Locale Files

## Overview

Any component in the layer (or in a consuming app using the build pipeline) can own its translations by placing a `locales/` directory alongside the component file. The build script auto-discovers and deep-merges these into the generated locale files.

This keeps translations co-located with the component that uses them rather than buried in a flat global file.

## Structure

```text
components/
└── my-component/
    ├── MyComponent.vue
    └── locales/
        ├── en-GB.json
        ├── zh-CN.json
        └── ar-YE.json
```

The build script scans `components/*/locales/` one level deep — nested component directories are not currently scanned, only the direct children of `components/`.

## JSON format

Namespace the component's keys under a meaningful path — typically `components.<componentName>.*`:

```json
{
  "components": {
    "myComponent": {
      "label": "My Label",
      "placeholder": "Enter a value",
      "screenReader": {
        "closeButton": "Close my component"
      }
    }
  }
}
```

## How the build script picks them up

`build-i18n.mjs` calls `findComponentLocaleDirs()` which reads the top-level `components/` directory and checks each subdirectory for a `locales/` folder. Any locale files found there are added to the merge list alongside `i18n-source/locales/**/*.json`.

No configuration is needed — the discovery is automatic.

## Regenerate after adding

```bash
npm run build:i18n
```

Check the console output — the script logs which component locale directories it found:

```
📁 Found component locale directories:
   /components/my-component/locales
```

## Notes

- Component locales are merged using the same deep-merge strategy as source locales — no key wins by default, last-write wins. To avoid collisions, always namespace under `components.<name>`.
- If a locale JSON file is missing for one of the configured languages (e.g. you added `en-GB.json` but forgot `ar-YE.json`), the build script will not error — it simply won't include those keys in the missing locale's output. Check the generated `.ts` files to confirm all locales are present.
- This pattern works identically in consuming apps that use the full build pipeline (Approach B in `locale-add-app-translations`).
