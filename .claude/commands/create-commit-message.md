---
description: Draft a commit message from staged changes only — never runs git add/commit/push
---

Draft a commit message for the currently staged changes. Do not run `git add`, `git commit`, or `git push` — this command only produces the message text for review.

Steps:
1. Run `git status` and `git diff --staged` to see what's staged. If nothing is staged, say so and stop.
2. Run `git log --oneline -10` to match this repo's existing commit message style (`type(scope): summary`, e.g. `feat(locale-switcher): ...`, `chore(deps)!: ...` for breaking changes).
3. Draft a concise message: a short summary line, plus a body only if the change needs context not obvious from the diff. Focus on *why*, not a restatement of the diff. For breaking changes (Node/Nuxt requirements, locale key renames, removed exports), say in the body what a consumer has to change.
4. Present the message in a fenced code block. Do not commit it.

If the user's request also explicitly says "commit this" or "run it", that's authorization to act: stage the named files (never `git add -A` / `git add .`), commit with a HEREDOC ending in the session's `Co-Authored-By:` trailer, and push to the tracked remote. Never skip hooks, never force-push, and ask before setting an upstream.

## Never name consumer apps

This repo and its npm package are public. Never name a consuming app, client site or repo (or its file paths, page names, or domain) in the output. Refer to them generically: "a consumer app", "consumers adding their own translations". This holds even when the change was prompted by a specific consumer or the diff context mentions one.
