---
id: DIB-27
title: "DIB-27 — Dibber 2: stop using kind to mark pages, and settle status and type words"
status: available
depends_on: [DIB-4]
order: 27
tags: [spec, dibber-2]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: Dibber should read the ticket stores other Markdown ticket tools already write, so it can be the shared format for tickets in git.
**Depends on:** DIB-4.

### Why

R-DIB-1 says a file whose `kind` is anything but `ticket` is a page. Other tools use `kind` (tbd) or `type` (ticket, Bodega, Backlog.md, Beans) for the type of work: task, bug, feature, epic. So a tbd store with 2,661 issues reads as 0 tickets and 2,661 pages. Status words also split: `open`/`in_progress`/`closed` is the common family (ticket, Bodega, minibeads, tbd, Beads), and Dibber's `available` matches none of them. Changing what `kind` means, or which statuses are legal, changes what a key means, so by the Versions section it is a new version.

### What to build

Write Dibber 2 in SPEC.md, with the migration from Dibber 1 stated: (1) **pages**: a file is a ticket when its frontmatter has `id` and `status`. A page is marked by a key nobody else uses (proposal: `page: project|doc|view|…`), and `kind` is no longer special. (2) **type of work**: settle DIB-4 and name the key (`type`), with `task`, `bug`, `feature`, `epic` and `chore` as the suggested values. (3) **statuses**: decide whether readers accept the common family as aliases (`open` = `available`, `in_progress` = `in-progress`, `closed` = `done`), or whether Dibber 2 adopts those words. Record the decision and the rejected option in the ticket. (4) `dibber migrate` rewrites a Dibber 1 store into Dibber 2 in place, and `dibber check` reads both versions, saying which it found. Decisions in (2) and (3) are the owner's. The ticket proposes, then implements once they are made.

### Exit criteria

- [ ] SPEC.md states Dibber 2 and the migration, and its Versions section says what changed
- [ ] conformance: a Dibber 2 store whose tickets carry `kind: bug` passes, with every file counted as a ticket
- [ ] a test: `dibber migrate` turns this repository's own store into Dibber 2, and `dibber check` passes before and after

## Status

_filed 2026-11-23._
