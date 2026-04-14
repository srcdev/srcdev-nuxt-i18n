# Automate nuxt prepare and Claude Skills with postinstall

## Overview

Prevent two common "forgot to run after install" problems in a consuming app:

1. `nuxt prepare` — generates Nuxt type declarations. Skipping it causes TypeScript errors after install or package updates.
2. `npm run setup:claude` — copies the latest `srcdev-nuxt-i18n` skills into `.claude/skills/srcdev-nuxt-i18n/`. Skipping it leaves Claude working from stale skill docs after a package update.

A `postinstall` script runs both automatically after every `npm install`.

## Steps

### 1. Add the scripts to `package.json`

```json
"scripts": {
  "setup:claude": "cp -r node_modules/srcdev-nuxt-i18n/.claude/skills .claude/skills/srcdev-nuxt-i18n",
  "postinstall": "nuxt prepare && npm run setup:claude"
}
```

### 2. Check whether your app needs an env flag for nuxt prepare

Some apps set an env var to switch `nuxt.config.ts` behaviour when running outside the full dev server (e.g. `NUXT_STANDALONE=true`). Check your own `nuxt.config.ts` — if it gates any config behind such a variable, add it to the `postinstall` command:

```json
"postinstall": "NUXT_STANDALONE=true nuxt prepare && npm run setup:claude"
```

### 3. Run once manually to bootstrap

```bash
npm run setup:claude
```

From this point on, `npm install` and `npm ci` trigger both steps automatically.

## Notes

- Skills land in `.claude/skills/srcdev-nuxt-i18n/` — safe to re-run without overwriting your own project's skills.
- If you also consume `srcdev-nuxt-components`, chain both copy commands in `setup:claude` so a single `postinstall` handles all layers.
- To skip in CI: `"postinstall": "[ \"$CI\" = \"true\" ] || (nuxt prepare && npm run setup:claude)"`.
