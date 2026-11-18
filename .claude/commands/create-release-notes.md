---
description: Produce release notes as a fenced markdown block for the release just published (run after releasing)
---

Produce release notes for the release that has just been published by following
`.claude/skills/release-notes.md` exactly: determine the range from the two most recent
`chore(release):` commits, review each commit, and output a single ` ```markdown ` fenced block.

Don't propose or second-guess the version bump, and don't commit, tag, or push anything: this command
only produces text for review. Never name a consumer app in the output.
