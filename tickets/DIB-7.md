---
id: DIB-7
title: "DIB-7 — The dibber CLI: new, list, claim, set, done"
status: in-review
description: An optional command-line tool that files, lists, moves and closes tickets, so neither people nor agents hand-edit YAML or git mv files into the archive.
depends_on: [DIB-1, DIB-2, DIB-6]
order: 70
tags: [tooling]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** R-DIB-2, R-DIB-4, R-DIB-5, R-DIB-6, R-DIB-11.
**Depends on:** DIB-1, DIB-2, DIB-6.

### Why

The format needs no tool, and that stays true. Newcomers still need one: hand-writing
frontmatter, picking the next free id and moving a closed ticket into `archive/` in the same
commit are three easy ways to get it wrong. `fieldhouse/scripts/ticket.mjs` already does
`new`/`claim`/`set`/`done` with git as the lock, but it reads `.baton/baton.json` and Fieldhouse's
conventions.

### What to build

- `dibber new --title … [--depends-on …] [--tags …]` allocates the next free id by R-DIB-4 as DIB-2 amends it, and
  writes the file with the body skeleton from R-DIB-11 (header lines, What to build, Exit
  criteria, `## Status` with `_filed <date>._`).
- `dibber list [--ready] [--status …] [--json]` gives the overview. "Ready" means live, with
  every `depends_on` done, sorted by `order`.
- `dibber claim <id> [--as <name>]` changes `available` to `in-progress` and sets `assignee`
  (default: the git user name). It is advisory: the help text says so, and says that several
  runners or people working at once is when to add Baton (DIB-2).
- `dibber set <id> <status> [--pr URL]` and `dibber done <id> [--pr URL]`, where `done` moves the
  file to `archive/` in the same commit and appends a Status entry.
- Every write runs DIB-6's checks before committing. `--json` output on every command, for agents.
- The spec never comes to require this tool, and the README says so.

### Exit criteria

- [x] `npm test` passes, including `new` skipping a number taken on another local branch
- [x] `dibber done` on a fixture leaves `dibber check` passing and the file in `archive/`

## Status

_filed 2026-11-22._

_2026-11-22: the two-process race test is dropped. Several writers at once is a coordinator's job (DIB-2)._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: new, list, claim, set, done, with --json; tests in test/cli.test.mjs._

_2026-11-22: in review, https://github.com/immediately-run/Dibber/pull/1._
