---
id: DIB-35
title: "DIB-35 — A coordinated store's tickets say status: orchestrator, and Dibber asks the coordinator where they stand"
status: available
depends_on: []
order: 162
tags: [spec, coordinator]
---

**Brief:** from the owner, 2026-11-28: "Dibber tickets should use "status: orchestrator" when used with baton." Asked what a file says once the coordinator closes the ticket, the owner chose that it stays `orchestrator`: closure lives only in the coordinator, and withdrawals stay the store's to write.

**Depends on:** none.

### Why

R-DIB-6 calls `status` "the store's word on where the ticket stands", and lets a coordinator "weigh `status` as evidence rather than take it as its own record". With a coordinator in use, that word is a second copy of state the coordinator keeps, and the copy goes stale. In Baton's store on 2026-11-27, Baton held 93 tickets at its end station `merged` whose files still said `available`, `in-review` or `in-progress`:

- **People and agents read the file.** Baton's 0.1 plan ranked six finished tickets as open work, because their files said `available`.
- **Readers treat `available` as ready.** A Dibber-alone reader (`dibber list --ready`, an agent following R-DIB-8) would hand out work a coordinator holds, has finished, or has never released.
- **The coordinator reads `done` as closure.** Baton's markdown source takes a `done` in the file as the ticket's closure, while Baton's own design makes closure at an end station the coordinator's record.

A status that says "ask the coordinator" removes the second copy.

### What to build

1. **A status, `orchestrator`** (R-DIB-6), in its own class: the ticket is live and its progress is a coordinator's record, not the store's. It is valid only in a store whose `.dibber/config.json` names a coordinator (R-DIB-14); `dibber check` refuses it elsewhere.
   - It is never ready to a reader that keeps no state of its own (R-DIB-8): such a reader asks the coordinator, or lists the ticket as coordinated.
   - It stays `orchestrator` when the coordinator finishes the ticket. Closure lives in the coordinator, and no tool writes `done` over it.
   - The store keeps its own word for withdrawal: `withdrawn`, `superseded` and `deferred` may replace `orchestrator`, written by a person through `dibber set`.
   - A dependency on an `orchestrator` ticket holds until the coordinator says it is done (item 2).
2. **A coordinator status query.** `.dibber/config.json`'s `coordinator` gains an optional `status` command (beside `next`, DIB-33): given ticket ids, it prints for each its state as the coordinator holds it, in a small JSON shape (state, closed or not, a one-line reason). Baton's would be `baton tickets status <ids> --coordinator`.
3. **The CLI follows.**
   - `dibber new` writes `status: orchestrator` when a coordinator is configured; `--status` overrides it.
   - `dibber claim`, `set <status>` and `done` refuse an `orchestrator` ticket and point to the coordinator, except `set withdrawn | superseded | deferred`.
   - `dibber list` and `--ready` show coordinated tickets under the coordinator's state when the query is configured, and as "coordinated" when it is not.
4. **A migration.** `dibber migrate --to-orchestrator` turns every live ticket (`available`, `in-progress`, `in-review`, `deprioritized`) of a coordinated store into `orchestrator`, and leaves closed ones as they are.
5. **The spec, the schema, the README and the skills** (the work skill above all: with a coordinator, claim through it).

### Exit criteria

- [ ] Tests: `orchestrator` is refused without a coordinator; never ready without the query; `new` writes it with a coordinator; `claim`, `set <live status>` and `done` refuse it; `set withdrawn` is accepted; `list` shows a fake coordinator's states; `migrate --to-orchestrator` converts live tickets only.
- [ ] `dibber check` passes on the conformance stores, a coordinated one among them.
- [ ] `npm test` green; published in the next release.

**Used by:** Baton's half (a `baton:` ticket filed with this one), which reads `orchestrator` as live, takes closure from its own record, answers the status query, and migrates its home.

## Status

_filed 2026-11-28._
