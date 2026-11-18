# Release Notes

## Overview

Maintainer skill, run via `/create-release-notes`. Produces release notes for the release that has
just been published, always as a single fenced ` ```markdown ` code block so the content can be
copied directly into a git tag, GitHub release, or changelog. Never render it as plain markdown.

## When this runs

The user runs this **after** releasing the package (`npm run release`), not before. So the newest
`chore(release): release vX.Y.Z` commit is the release being described, and the `version` in
`package.json` already matches it: use that version for the heading, don't propose or guess a new one.

## Version bump

Don't suggest that a release should have been a major (or any other) bump, even when commits are
marked breaking (`!`). The user decides the bump at release time, weighing blast radius: while the
only affected consumers are their own apps, a breaking change can ship as a minor or patch. Describe
breaking changes clearly under **Changed**, including what a consumer needs to edit, and leave the
versioning judgement alone.

## Steps

### 1. Determine the range

Run `git log --oneline -30` and find the two most recent `chore(release): release vX.Y.Z` commits.
The notes cover the commits between them: after the older one, up to and including the newest (the
just-released version). Confirm the newest one's version matches `package.json`; if it doesn't, or
there are commits after the newest release commit, say so before continuing, since the release may
not have happened yet.

### 2. Review each commit

Run `git show <commit> --stat` (and read the message) for each commit in the range. Skip
`chore(release):` commits themselves, and skip purely internal/tooling commits (slash commands,
maintainer-only skills) unless they're user-facing.

### 3. Draft the notes

Use the format below. Fold minor follow-up commits (a test/docs completion for a feature shipped a
commit earlier) into the same bullet as the feature unless the follow-up is substantial.

### 4. Output

Wrap the result in a ` ```markdown ` fence. Do not commit, tag, or push anything.

## Format

```markdown
## vX.Y.Z

### New

- **`ComponentOrComposableName`** — one-line description of what it does and why it exists

### Fixed

- Short description of what was wrong and what was corrected

### Changed

- Short description of intentional behaviour or API changes (dependency/Node/Nuxt requirements,
  locale key renames, anything a consumer has to edit)

### Documentation

- **`skill-name` skill** — new/updated: what it covers
```

## Notes

- Only include sections that have content — omit empty headings
- Keep each bullet to one line where possible
- Lead with the most user-facing changes (New, Fixed) before internal ones (Changed, Documentation)
- Test additions warrant their own section only when substantial; otherwise fold into the relevant
  New/Fixed bullet
- Dependency upgrades: list what consumers must match (Node `engines`, `nuxt` peer range, pinned
  `@nuxtjs/i18n` / `markdown-it` versions from the README install line) under **Changed**

## Never name consumer apps

This repo and its npm package are public. Never name a consuming app, client site or repo (or its
file paths, page names, or domain) in the output. Refer to them generically: "a consumer app",
"consumers adding their own translations". This holds even when the change was prompted by a specific
consumer or the diff context mentions one.
