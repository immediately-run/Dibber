---
id: DIB-27
title: "DIB-27 — Stop using kind to mark pages, and settle the status and type words"
status: done
depends_on: [DIB-4]
order: 27
tags: [spec, migration]
project: wide-audience
assignee: Peter Neumark
prs: [https://github.com/immediately-run/dibber/pull/35]
updated: 2026-11-25
---

**Brief:** from the owner, 2026-11-23: Dibber should read the ticket stores other Markdown ticket tools already write, so it can be the shared format for tickets in git.
**Depends on:** DIB-4.

### Why

R-DIB-1 says a file whose `kind` is anything but `ticket` is a page. Other tools use `kind` (tbd) or `type` (ticket, Bodega, Backlog.md, Beans) for the type of work: task, bug, feature, epic. So a tbd store with 2,661 issues reads as 0 tickets and 2,661 pages. Status words also split: `open`/`in_progress`/`closed` is the common family (ticket, Bodega, minibeads, tbd, Beads), and Dibber's `available` matches none of them. Existing stores (this repository's, Baton's, Fieldhouse's) use `kind` for pages today, so the change needs a migration step.

### What to build

Change SPEC.md in place, since Dibber is still in active development, and say in it how an existing store moves: (1) **pages**: a file is a ticket when its frontmatter has `id` and `status`. A page is marked by a key nobody else uses (proposal: `page: project|doc|view|…`), and `kind` is no longer special. (2) **type of work**: settle DIB-4 and name the key (`type`), with `task`, `bug`, `feature`, `epic` and `chore` as the suggested values. (3) **statuses**: decide whether readers accept the common family as aliases (`open` = `available`, `in_progress` = `in-progress`, `closed` = `done`), or whether Dibber adopts those words. Record the decision and the rejected option in the ticket. (4) `dibber migrate` rewrites an existing store to the new rules in place, and `dibber check` names the migration when it finds the old `kind` pages. (5) Replace SPEC.md's Versions section: while Dibber is in active development the spec changes in place, and a change that breaks existing stores ships with a `dibber migrate` step. Decisions in (2) and (3) are the owner's. The ticket proposes, then implements once they are made.

### Exit criteria

- [x] SPEC.md states the new rules, the migration and the active-development note
- [x] conformance: a store whose tickets carry `kind: bug` passes, with every file counted as a ticket
- [x] a test: `dibber migrate` moves this repository's own store to the new rules, and `dibber check` passes before and after

## Status

_filed 2026-11-23._

_2026-11-23: no new version: the owner ruled that while Dibber is in active development the spec changes in place, with a migration step for existing stores._

_2026-11-25: claimed by Peter Neumark._

_2026-11-25: The owner rejected aliases. DIB-4 standardized optional type and left priority to stores. Page migration and conformance checks pass. Confirm the canonical status names before closing._

_2026-11-25: Owner confirmed the current canonical statuses. Translate source status values during import. Rejected both read aliases and renaming the canonical statuses. The repository audit found no statuses requiring a rewrite._

_2026-11-25: done, https://github.com/immediately-run/dibber/pull/35._
