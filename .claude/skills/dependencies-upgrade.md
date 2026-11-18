# Upgrade npm dependencies (dry run first)

## Overview

Maintainer skill for this layer (consumers can ignore it). How to bump this layer's dependencies
without shipping a supply-chain risk or a broken install. `/upgrade-packages` runs this procedure. The
order is fixed: **age-gate → isolate → baseline → phase → verify → plan**. Nothing is applied to the
real checkout until the user has read the plan.

This is a trimmed copy of the `dependencies-upgrade` skill in `srcdev-nuxt-components` (no Storybook,
lint or `SRCDEV_STANDALONE` here). Upgrade the components layer first, then this one, then the consumer
apps, so all three land on the same `nuxt` and `vite`.

Recorded from the upgrade pass on 2026-11-18 (Nuxt 4.3.0 → 4.6.4, Vitest 3 → 5, markdown-it 15).

## 1. Age gate: nothing younger than 7 days

Compromised releases are usually caught and unpublished within days, so never install a version
younger than **7 days**, direct or transitive.

- **Pick direct targets** with `node scripts/aged-versions.mjs package.json 7`. For every exact pin in
  `dependencies`, `devDependencies` and `overrides` it prints the newest same-major version at least 7
  days old, the newest new major that clears the gate, and anything newer it blocked.
- **Install with the gate on**: `npm install --min-release-age=7` (npm 11.x). It applies to every
  package npm resolves. If a pinned direct version is too young, npm errors: re-run `aged-versions.mjs`.
- A security fix younger than 7 days is the one exception. Take it only when `npm audit` says the
  advisory is exploitable in this context, and name it in the plan.

`scripts/` is in `files`, so `aged-versions.mjs` ships to consumers. That's harmless; it's a copy of
the one in `srcdev-nuxt-components`. Keep the two in step.

## 2. Isolate: a worktree in the scratchpad

```bash
git worktree add <scratchpad>/deps-dry-run -b chore/deps-dry-run-<yyyy-mm> HEAD
```

Copy any uncommitted `package.json` / `.nvmrc` / workflow changes into the worktree first. Run
everything from the worktree root. Never `git stash` to compare old and new code.

## 3. Baseline

```bash
npm ci && npm run prepare && npm run test:run && npm run build
```

Record the pass counts, `npm outdated`, and an audit summary split into production
(`npm audit --omit=dev`) and everything.

## 4. Phases

Bump in separate phases so a failure points at one cause. Delete `node_modules`, `package-lock.json`
and `.nuxt` before each phase's install so the lockfile is rebuilt under the age gate.

1. **Framework + same-major bumps**: `nuxt`, `vite`, `@nuxtjs/i18n`, plus patch/minor bumps of
   everything else. Match `nuxt` and `vite` to the versions the components layer just moved to.
2. **Test stack majors together**: `vitest`, `@nuxt/test-utils`, `happy-dom`, `@vue/test-utils`. Also
   update `setups.@nuxt/test-utils` in `.nuxtrc` to the new test-utils version.
3. **Other majors, one at a time**: tooling (`release-it`, `concurrently`), then `markdown-it` on its
   own, since it is a runtime dependency consumers get.
4. **Hold back** anything a known blocker affects, and say why in the plan.

Edit `package.json` with a script, then:

```bash
rm -rf node_modules package-lock.json .nuxt
npm install --min-release-age=7
npm run prepare && npm run test:run
```

## 5. Verify the final phase

- `npm run test:run`, compared with the baseline
- `npm run build`
- `npx tsc --noEmit -p .nuxt/tsconfig.app.json`: ignore `Cannot find module '*.vue'` (plain `tsc`
  doesn't read SFCs); anything else is real
- **One version per framework package**:
  `npm ls vue vue-router vite @nuxt/schema h3 vue-i18n nuxt`
- **Nothing moved sections**: `git diff package.json`. Runtime imports (`@nuxtjs/i18n`, `markdown-it`)
  must stay in `dependencies`; `nuxt` stays a devDependency with a `^4` peer range.
- **Lockfile stubs**:
  `node -e "const l=require('./package-lock.json');console.log(Object.entries(l.packages).filter(([k,v])=>k&&!v.version&&!v.link).map(([k])=>k))"`
- **Two clean installs in a row** before trusting the lockfile.
- `npm run dev` smoke test in the browser (the user does this).

## 6. Consumer impact

- This layer pins `nuxt` only as a devDependency (peer `^4.0.0`), so it doesn't force a Nuxt version on
  consumers; the components layer does. Check `npm view @nuxtjs/i18n@<version> dependencies` for any
  Nuxt/Vite/vue-router pin that would clash with the components layer's versions.
- Update the install line in `README.md` (pinned `@nuxtjs/i18n` and `markdown-it` versions) and the
  Node requirement.
- New majors of runtime dependencies go in the release notes.

## 7. The plan

Present: versions per phase, fixes needed, what's held back and why, audit findings closed, consumer
notes, release-note items. Apply only after the user agrees. The user runs git (commit, push, release)
themselves.

## Known upgrade traps

| Symptom | Cause | Fix |
| --- | --- | --- |
| Every test file fails with `Unknown Error: [object Object]` / unhandled errors; `npm ls vite` shows `vite@7` under `vitest` | Vitest 3 brings its own Vite 7, which Nuxt 4.6's config can't run on | Move the test stack to Vitest 5 / `@nuxt/test-utils` 4 / `happy-dom` 21 in the same change as Nuxt 4.6; add `overrides.vite` |
| `useMarkdown.ts`: `Type 'string \| number' is not assignable to type 'string'` | `markdown-it` 15 ships its own types, where attribute values are `string \| number` | Read with `token.attrGet("href")` and guard with `typeof href === "string"`; drop `@types/markdown-it` |
| `npm audit` highs via `release-it` → `proxy-agent` → `basic-ftp` | Upstream chain in release tooling; dev-only, runs only at release time | Note it in the plan; nothing to do until `release-it` moves |
| Production `minimatch` moderates via `@intlify/unplugin-vue-i18n` / Nitro tooling | Build tooling, upstream | Note it; same finding as the components layer |
