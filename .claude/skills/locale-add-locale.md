# Add a New Locale to the Layer

## Overview

Steps to add a new language to `srcdev-nuxt-i18n` itself — for example adding French (`fr` / `fr-FR`). This affects all consuming apps that extend the layer.

If you only want to add a locale in a specific consuming app without changing the layer, do that in the app's own `nuxt.config.ts` instead.

## Steps

### 1. Add the locale to `nuxt.config.ts`

```ts
locales: [
  { code: "en",  language: "en-GB", name: "English",    file: "en-GB.ts", dir: "ltr" },
  { code: "cn",  language: "zh-CN", name: "简体中文",    file: "zh-CN.ts", dir: "ltr" },
  { code: "ary", language: "ar-YE", name: "العربية",     file: "ar-YE.ts", dir: "rtl" },
  { code: "fr",  language: "fr-FR", name: "Français",   file: "fr-FR.ts", dir: "ltr" }, // new
],
```

### 2. Create source JSON files

Create a new file for each section under `i18n-source/locales/` — at minimum the `global` folder:

```bash
# i18n-source/locales/global/fr-FR.json
```

```json
{
  "global": {
    "siteName": ""
  },
  "errors": {
    "404": {
      "title": "Page introuvable",
      "description": "Désolé, nous n'avons pas trouvé la page que vous cherchez.",
      "help": "Cela arrive souvent quand une page a été déplacée ou supprimée.",
      "suggestions": {
        "checkUrl": "Vérifiez l'orthographe de l'adresse",
        "useNavigation": "Utilisez le menu de navigation",
        "searchContent": "Recherchez le contenu souhaité"
      }
    },
    "500": {
      "title": "Erreur interne du serveur",
      "description": "Une erreur s'est produite de notre côté. Nous travaillons à la résoudre.",
      "help": "Il s'agit d'un problème temporaire. Veuillez réessayer dans quelques instants."
    },
    "serverError": {
      "title": "Erreur serveur",
      "description": "Nous rencontrons des difficultés techniques. Veuillez réessayer plus tard.",
      "help": "Nos serveurs sont temporairement indisponibles.",
      "suggestions": {
        "refresh": "Actualisez la page dans quelques instants",
        "wait": "Attendez quelques minutes et réessayez",
        "contact": "Contactez-nous si le problème persiste"
      }
    },
    "general": {
      "title": "Une erreur s'est produite",
      "description": "Une erreur inattendue s'est produite. Veuillez réessayer ou contacter le support."
    },
    "actions": {
      "goHome": "Aller à l'accueil",
      "tryAgain": "Réessayer"
    },
    "help": {
      "moreInfo": "Que puis-je faire ?"
    },
    "contact": {
      "text": "Si ce problème persiste, veuillez nous le signaler :",
      "link": "Contacter le support"
    }
  }
}
```

Also add `fr-FR.json` alongside every other locale JSON under any other `i18n-source/locales/` subdirectories that exist.

### 3. Regenerate the locale files

```bash
npm run build:i18n
```

This generates `i18n/locales/fr-FR.ts`.

### 4. Commit the generated file

```bash
git add nuxt.config.ts i18n-source/locales/ i18n/locales/fr-FR.ts
git commit -m "feat: add fr-FR locale"
```

### 5. Bump the version and publish

Adding a locale is a minor change — bump the minor version.

## Notes

- Any component `locales/` directories in `components/*/locales/` must also get a `fr-FR.json` file, or the build script will produce an incomplete locale — check the console output for missing files.
- RTL locales (Arabic, Hebrew, etc.) need `dir: "rtl"` in the locale object. Consuming apps handle the CSS.
- The build script reads locale `language` codes from `nuxt.config.ts` via regex — the `language` field drives file naming, not `code`.
