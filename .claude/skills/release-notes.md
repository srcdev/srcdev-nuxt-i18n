# Release Notes

## Overview

When asked to create release notes, always produce a fenced markdown code block (` ```markdown `) so the content can be copied and pasted directly into a git tag, GitHub release, or changelog.

## Steps

### 1. Determine the version

Run `git log --oneline -8` to find the most recent release commit and the commits since the previous release.

### 2. Review the diff

Run `git show <commit> --stat` for each commit since the last release to understand what changed.

### 3. Produce a fenced markdown block

Always wrap the output in a ` ```markdown ` code fence — never render it as plain markdown. This ensures the user can copy the raw text without formatting being stripped.

## Format

```markdown
## vX.Y.Z

### New

- **`composable/locale/feature`** — one-line description of what it does and why it exists

### Fixed

- Short description of what was wrong and what was corrected

### Changed

- Short description of intentional behaviour or API changes

### Documentation

- **`skill-name` skill** — new/updated: what it covers
```

## Notes

- Only include sections that have content — omit empty headings
- Keep each bullet to one line where possible
- Lead with the most user-facing changes (New, Fixed) before internal ones (Documentation, Tests)
- Test additions warrant their own section only when substantial; otherwise fold into the relevant New/Fixed bullet
