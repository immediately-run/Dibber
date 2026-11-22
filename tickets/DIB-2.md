---
id: DIB-2
title: "DIB-2 — Ticket numbers without a coordinator, when several agents file at once"
status: available
description: R-DIB-4's "second to merge renumbers" breaks down for one person running several agent sessions. Specify a cheap allocation recipe that uses git as the lock.
depends_on: []
order: 20
tags: [spec]
project: wide-audience
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** amends R-DIB-4 (Allocation).
**Depends on:** none.

### Why

Vibe coders run several agent sessions in parallel, each on its own branch. Under R-DIB-4 today,
each takes "the next free number" and two of them collide; the second to merge renumbers, which
breaks every `depends_on` and every mention of the old id. This is the format's weak spot
for exactly the audience this project targets.

### What to build

- A spec recipe for allocating without a coordinator: the ticket file is created in its own
  commit pushed straight to the default branch, from a fresh fetch. A push refused because the
  remote moved means someone else took a number, so refetch and retry. That makes git the lock,
  with no server. `fieldhouse/scripts/ticket.mjs` (`new`) already works this way and is the
  reference.
- The fallback when pushing to the default branch is not allowed (protected branch): keep
  today's rule, and say what the renumbering tool must rewrite (`depends_on`, `parent`, body
  header lines).
- Keep "where a coordinator is in use, the number is the coordinator's".

### Exit criteria

- [ ] SPEC.md's R-DIB-4 states the recipe and the fallback; the Versions note says it amends Dibber 1 in place
- [ ] DIB-7's CLI `new` follows the recipe, with a test where two concurrent `new` calls get different ids

## Status

_filed 2026-11-22._
