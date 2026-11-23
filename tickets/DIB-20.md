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

- [x] the decision is recorded in this ticket's Status
- [ ] `dibber check` passes on baton's and fieldhouse's `tickets/`, apart from unrelated errors listed in DIB-12

## Status

_filed 2026-11-22._

_2026-11-23: since DIB-24, closed tickets stay in place and closure is read from status alone, so the R-DIB-2 errors on both stores are gone: fieldhouse's store passes dibber check, and baton's has only the 3 non-string prs entries. What is left is only whether deferred reads as closed or open. Recommendation: withdraw this ticket unless deferred should show as open._

_2026-11-23: Decided by the owner, 2026-11-23: keep the spec, option (a) as it now reads after DIB-24. `deferred` and `superseded` are closed, and the dibber-board viewer puts them in its closed column, which the owner confirmed is OK. Nothing moves: closed tickets stay in place. Baton's store passes `dibber check` apart from three non-string `prs` entries in archive/B-94 and archive/B-97, which are unrelated; fieldhouse was not re-checked here. Still open within this question: whether a `superseded` dependency satisfies a ticket that depends on it. Baton and the viewer say yes, the `dibber` command says no._
