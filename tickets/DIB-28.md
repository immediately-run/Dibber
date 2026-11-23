---
id: DIB-28
title: DIB-28 — Import stores from other Markdown ticket tools
status: available
depends_on: [DIB-26, DIB-27]
order: 28
tags: [tooling, migration]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: Dibber should read the ticket stores other Markdown ticket tools already write, so it can be the shared format for tickets in git.
**Depends on:** DIB-26, DIB-27.

### Why

People already keep tickets as Markdown files with other tools: ticket's `.tickets/`, Bodega's `.bodega/`, Beans' `.beans/`, minibeads' `.beads/issues/`, tbd's `tbd-sync` branch and Backlog.md's `backlog/`. Moving to Dibber, or keeping both, should be one command that keeps ids and links. DIB-16 covers Linear, Jira and GitHub Issues; this covers the Markdown tools, whose files are closest to Dibber's.

### What to build

`dibber import <tool> <path>` for ticket, Bodega, Beans, minibeads, tbd and Backlog.md. It keeps each ticket's id where the format allows (after DIB-26 that's all of them except titles-in-file-names), maps statuses and keys (`deps`, `dependencies`, `blocked_by` and `parent_id` to Dibber's), takes a title from the first `# heading` when there's no `title` key, and records the source in a `**Imported from:**` header line. It never edits the source store. A `--dry-run` reports what would change. Each importer has a fixture copied from a real public store, with its license respected, or a hand-written one.

### Exit criteria

- [ ] a test per tool: its fixture imports to a store that `dibber check` passes, with ids, dependencies and parents preserved
- [ ] `dibber import --dry-run` writes nothing

## Status

_filed 2026-11-23._
