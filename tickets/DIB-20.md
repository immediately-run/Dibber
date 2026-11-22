---
id: DIB-20
title: "DIB-20 — Decide: are deferred and superseded closed, as the spec says, or live, as Baton and Fieldhouse treat them?"
status: available
depends_on: []
order: 45
tags: [spec, decision]
project: wide-audience
---

**Brief:** found 2026-11-22 by running `dibber check` on the baton and fieldhouse stores.
**Depends on:** none.
**Waits on:** the owner's choice between (a), (b) and (c).

### Why

R-DIB-6 classes `deferred` and `superseded` as closed, and R-DIB-2 moves every closed ticket to `archive/`. Baton's store has 24 `superseded` and 1 `deferred` ticket outside the archive, and Fieldhouse's has 19 `deferred`. Both treat them as live statuses (Fieldhouse's `scripts/ticket.mjs` LIVE list, Baton's board descriptor). Until one side changes, `dibber check` fails on both stores, and DIB-12 can't make the Readers section true.

### What to build

The owner picks one. (a) Keep the spec: Baton and Fieldhouse move those tickets to their archives. (b) Amend R-DIB-6: `deferred` becomes live (parked, may come back) and `superseded` stays closed. That is a new version only if a valid store becomes invalid, and it wouldn't be. (c) Amend R-DIB-6 so both are live. Recommendation: (b). `deferred` reads as parked to everyone, which is how both stores use it; `superseded` means another ticket replaced this one, so it is done with.

### Exit criteria

- [ ] the decision is recorded in this ticket's Status
- [ ] `dibber check` passes on baton's and fieldhouse's `tickets/`, apart from unrelated errors listed in DIB-12

## Status

_filed 2026-11-22._
