---
id: DIB-26
title: DIB-26 — Accept random ids beside numeric ones
status: available
depends_on: []
order: 26
tags: [spec, ids]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: Dibber should read the ticket stores other Markdown ticket tools already write, so it can be the shared format for tickets in git.
**Depends on:** none.

### Why

Almost every other Markdown ticket tool gives tickets lowercase random ids: ticket (`tek-m5tt`), Bodega (`bg-a7da36`), Beans (`beans-0ajg`) and tbd (`is-01kf5z…`). Two branches or two agents can't collide on such an id. R-DIB-4 accepts only an upper-case prefix and a decimal number, so every one of those stores fails `dibber check` on its first ticket. A person working on two branches also gets collisions, which today are fixed by renumbering (R-DIB-4, Allocation).

### What to build

Widen R-DIB-4: an id is a prefix (letters and digits, starting with a letter, either case), a dash, and either a decimal number or a lowercase base-36 suffix of at least 4 characters. Both forms are never reused and never renamed. Every id valid today stays valid. Update `ticket.schema.json` (`id` and `ref`), the conformance fixtures (valid random-id store; invalid: empty suffix, uppercase in the random suffix), `dibber check`, and the qualified form `<repo>:<id>`. Add `"ids": "numeric" | "random"` to `.dibber/config.json` (default `numeric`). `dibber new` then allocates a random suffix that is free in the store and on every branch, and `dibber init --ids random` sets it. State in R-DIB-4 that random ids need no renumbering.

### Exit criteria

- [ ] conformance: a valid store with ids like `tek-m5tt` and `is-01kf5zyg8h` passes, and the new invalid fixtures fail on R-DIB-4
- [ ] a test: with `ids: random`, `dibber new` allocates an id matching the random form that no file in the store already uses
- [ ] `npm test` passes

## Status

_filed 2026-11-23._
