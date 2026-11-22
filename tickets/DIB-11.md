---
id: DIB-11
title: "DIB-11 — A demo store: a small project's tickets, at every stage"
status: available
description: An example store of 10–15 tickets for an imaginary app, covering every status, dependencies, children and a project page. It serves as template, screenshot source and test data for the board.
depends_on: [DIB-3]
order: 85
tags: [docs, examples]
project: wide-audience
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Depends on:** DIB-3.

### Why

People learn the format faster from a store that looks lived-in than from a spec. The README's
screenshot (DIB-17) and the board (DIB-13) need real-looking data, and the conformance fixtures
(DIB-5) are deliberately minimal.

### What to build

- `examples/recipe-app/` (or another small, friendly app): `dibber.json`, `tickets/` with 10–15
  tickets across `available`, `in-progress`, `in-review`, `deprioritized` and `deferred`, a few
  in `archive/` (`done`, `superseded`), a `depends_on` chain, one parent with children, and
  `tickets/projects/` with one project page.
- Ticket bodies written the way the skills (DIB-9) will write them, so the example also shows
  good practice.

### Exit criteria

- [ ] `npx dibber check examples/recipe-app` passes
- [ ] a test asserts that every status in `ticket.schema.json` appears in the example except `withdrawn`

## Status

_filed 2026-11-22._
