---
id: DIB-24
title: "DIB-24 — Close tickets in place: a closed ticket keeps its file"
status: done
depends_on: []
order: 25
tags: [spec, tooling]
project: wide-audience
prs: [https://github.com/immediately-run/dibber/pull/4]
updated: 2026-11-23
---

**Brief:** from the owner, 2026-11-23: archived tickets should not move to tickets/archive/, because moving them forces file paths to be rewritten; leave them where they were under tickets/.
**Depends on:** none.

### Why

R-DIB-2 moved a closed ticket into `archive/`, so every link to it broke at the moment it was most likely to be followed. That includes links from code, pull requests, commits and other tickets. The move also caused a bug: `dibber done` staged the move with `git mv` but not the rewrite, so a plain `git commit` recorded an archived ticket that still said in-progress.

### What to build

R-DIB-2 becomes 'closed in place, never deleted': closing changes `status`, never the path, and closure is read from `status` alone. An `archive/` folder from older stores is read like any other folder. R-DIB-6 drops 'done only in archive/'. This amends Dibber 1 in place: every valid store stays valid. `dibber done` and `dibber set` write in place and never touch git's index. `dibber init` stops creating `archive/`. The skills, the templates and the conformance fixtures follow, and this repository's own `tickets/archive/` goes.

### Exit criteria

- [x] a test: `dibber done` leaves the file at its path with `status: done`, and `git diff --cached` is empty
- [x] conformance: `valid/closed-in-place` and `valid/archive` pass

## Status

_filed 2026-11-23._

_2026-11-23: done in the PR that carries the work, https://github.com/immediately-run/dibber/pull/4._
