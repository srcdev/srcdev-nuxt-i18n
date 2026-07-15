# Skills

Step-by-step guides for repeatable development tasks in this project.

## For consuming apps

Copy skills into your project with:

```bash
cp -r node_modules/srcdev-nuxt-i18n/.claude/skills .claude/skills/srcdev-nuxt-i18n
```

Skills land in `.claude/skills/srcdev-nuxt-i18n/` — safe to re-run without overwriting your own skills.

## Structure

Each skill is a single markdown file named `<area>-<task>.md`.

```text
.claude/skills/
├── index.md                          — this file
├── release-notes.md                  — produce release notes as a fenced markdown block from git log
├── setup-consumer.md                 — wire up a consuming Nuxt app to extend this layer
├── setup-postinstall.md              — automate nuxt prepare + Claude skills copy via postinstall
├── locale-add-locale.md              — add a new language to the layer (e.g. French)
├── locale-add-app-translations.md    — consuming app adds its own translation keys on top of the layer
├── locale-component-locales.md       — component-level locales/ pattern (auto-merged by build script)
├── component-locale-switcher.md      — LocaleSwitcher: default button-per-locale switcher with a scoped slot for custom UI (select, radio, etc.)
├── composable-use-raw-locale-data.md — useRawLocaleData<T>: typed, hydration-safe locale data access — required for arrays/objects, tm() renders raw AST JSON
└── composable-use-markdown.md        — useMarkdown: renderMarkdown() for locale strings with links
```

## Skill file template

```md
# <Title>

## Overview

Brief description of what this skill does and why it exists.

## Prerequisites

What needs to be in place before starting (optional section).

## Steps

### 1. <Step name>

...

### 2. <Step name>

...

## Notes

Edge cases, gotchas, or links to related files (optional section).
```
