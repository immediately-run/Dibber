---
id: DIB-13
title: "DIB-13 — Optional immediately.run board: show a store's tickets on immediately.run"
status: available
description: Open a repository's Dibber store on immediately.run and see its tickets as a list, a single ticket, or a kanban board, with no setup in the repository.
depends_on: [DIB-11]
order: 150
tags: [integrations, immediately-run]
project: wide-audience
repos: [immediately-run/grove, immediately-run/kanban-board]
---

**Brief:** from the owner's list, 2026-11-22: optional immediately.run integration that displays tickets or the whole kanban board.
**Depends on:** DIB-11.
**Waits on:** the owner's choice of renderer (below).

### Why

Seeing the board is often what makes tickets click for someone new to them, and immediately.run
can show a repository with no build step or hosting.

### The choice to make first

Two candidates exist; building both means maintaining two boards.

- **a. Grove.** It already renders file collections as a wiki and is listed as a Dibber reader
  (R-DIB-13). The board would be a Grove view over the store.
- **b. kanban-board.** It already has columns, drag and drop, and sharing. Today it stores each
  card as its own JSON file. It would need an adapter that reads and writes Dibber tickets, with
  columns mapped to statuses.

Recommendation: **a** for reading (list, ticket page, board), because it fits "no setup in the
repository". Use **b** only if drag-to-change-status turns out to be wanted, and then as a
Dibber adapter in kanban-board, not a second format.

### What to build (after the choice)

- A link shape that opens a GitHub repository's store on immediately.run, documented in this
  repository's README.
- Columns from R-DIB-6's live statuses; closed tickets in a collapsed "Done" column read from
  `archive/`; `depends_on` and `parent` shown on the card.
- Works signed out (read-only, public repositories) and on a phone.

### Exit criteria

- [ ] the renderer's test suite renders DIB-11's demo store with every ticket in the column its status names
- [ ] the documented link opens this repository's own `tickets/` as a board

## Status

_filed 2026-11-22._
