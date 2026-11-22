---
id: DIB-7
title: "DIB-7 — The dibber CLI: new, list, claim, set, done"
status: available
description: An optional command-line tool that files, lists, moves and closes tickets, so neither people nor agents hand-edit YAML or git mv files into the archive.
depends_on: [DIB-1, DIB-2, DIB-6]
order: 70
tags: [tooling]
project: wide-audience
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

- `dibber new --title … [--depends-on …] [--tags …]` allocates the id by DIB-2's recipe and
  writes the file with the body skeleton from R-DIB-11 (header lines, What to build, Exit
  criteria, `## Status` with `_filed <date>._`).
- `dibber list [--ready] [--status …] [--json]` gives the overview. "Ready" means live, with
  every `depends_on` done, sorted by `order`.
- `dibber claim <id> [--as <name>]` changes `available` to `in-progress` and sets `assignee`
  (default: the git user name). It is advisory: the help text says so and points to a
  coordinator for a real lock.
- `dibber set <id> <status> [--pr URL]` and `dibber done <id> [--pr URL]`, where `done` moves the
  file to `archive/` in the same commit and appends a Status entry.
- Every write runs DIB-6's checks before committing. `--json` output on every command, for agents.
- The spec never comes to require this tool, and the README says so.

### Exit criteria

- [ ] `npm test` passes, including a two-process `new` race that yields two distinct ids
- [ ] `dibber done` on a fixture leaves `dibber check` passing and the file in `archive/`

## Status

_filed 2026-11-22._
