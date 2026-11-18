---
description: Dry-run a dependency upgrade in an isolated worktree (7-day age gate), then present a phased plan; applies nothing until approved
---

Run a dependency upgrade dry run for this repo by following `.claude/skills/dependencies-upgrade.md`
exactly. Read the whole skill first, including its traps table.

Arguments (optional): `$ARGUMENTS`. A minimum release age in days (default `7`), or `apply` to
carry out a plan the user has already approved in this conversation.

## Dry run (default)

1. Check which `nuxt` and `vite` versions `srcdev-nuxt-components` is on now, and target the same.
2. Run `node scripts/aged-versions.mjs package.json <days>`, plus `npm outdated` and an
   `npm audit --json` summary that maps each advisory to the bump that fixes it.
3. Create the scratchpad worktree, take the baseline, then run each phase from the skill: fresh
   install with `--min-release-age=<days>`, then tests, build, typecheck, the duplicate-version check,
   the section check, the lockfile stub check, and two consecutive clean installs for the final phase.
4. When something breaks, check the traps table first. Fix it in the worktree when the fix is clear
   and record it in the plan. A new trap goes into the skill's table in the same pass.
5. Present the plan: versions per phase, fixes needed, what's held back and why, the audit findings
   closed, consumer notes, and release-note items. Keep the worktree and say where it is.

## Apply (`apply`, only after the user has approved the plan)

Recreate the planned edits on the user's checkout (`package.json`, `.nuxtrc`, code fixes, README),
then run `rm -rf node_modules package-lock.json .nuxt && npm install --min-release-age=<days>` twice,
then `npm run prepare`, `npm run test:run` and `npm run build`. Report the results. Don't commit,
push or release: the user runs git themselves. Remove the dry-run worktree and its branch only once
the user says they're done with it.
