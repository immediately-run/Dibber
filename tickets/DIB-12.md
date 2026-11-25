---
id: DIB-12
title: "DIB-12 — Make the Readers section true and checkable"
status: in-progress
description: The README and SPEC list Baton, Fieldhouse and Grove as readers, but none of them names Dibber or tests against it. Verify each claim and have each reader run the conformance fixtures.
depends_on: [DIB-5]
order: 140
tags: [spec, readers]
project: wide-audience
repos: [immediately-run/baton, immediately-run/fieldhouse, immediately-run/grove, immediately-run/baton-board]
assignee: Peter Neumark
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** the Readers section.
**Depends on:** DIB-5.

### Why

A search of baton, fieldhouse, grove and kanban-board on 2026-11-22 found no mention of "Dibber".
Baton's markdown source and Fieldhouse's `tickets/` follow the same layout under their own names.
Whether Grove renders a store's board from Dibber tickets, as the README says, wasn't confirmed.
A newcomer who follows a Readers link should find the claim true.

### What to build

- For each listed reader: confirm what it reads and writes, then link the README entry to the
  exact code or spec section. Remove or reword any claim that doesn't hold.
- List the board viewer (`dibber-board`, DIB-13 and DIB-18) as a reader of its own. Today's
  "Grove renders a store as a wiki with a board" is true only through that viewer's components.
- In each reader's repository, a test that runs Dibber's `conformance/` fixtures (vendored or
  fetched at a pinned commit), with a link from its docs to Dibber.

### Exit criteria

- [ ] each reader's test suite runs the conformance fixtures and passes
- [x] every Readers entry links to a file or spec section in that reader's repository

## Status

_filed 2026-11-22._

_2026-11-23: Unrelated errors in readers' stores, found by `dibber check` on 2026-11-23: baton's tickets/archive/B-94.mdx and tickets/archive/B-97.mdx carry non-string `prs` entries (R-DIB-5, three errors). Fieldhouse (64 tickets) and hq (6) pass._

_2026-11-25: claimed by Peter Neumark._
