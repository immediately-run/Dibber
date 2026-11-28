---
id: DIB-34
title: "DIB-34 — Change a filed ticket's dependencies, parent, order, title and description: dibber edit"
status: available
depends_on: []
order: 161
tags: [cli, coordinator]
---

**Brief:** from the owner, 2026-11-28, asked whether Dibber should be able to change an existing ticket's dependencies: "Yes. Should Dibber be able to change dependencies of an existing ticket? This issue has come up before." Baton's home repository only lets Dibber write ticket files (`baton:B-326`), so a key Dibber writes only when filing can afterwards be changed only by hand.

**Depends on:** none.

### Why

`dibber set --field` refuses every key Dibber defines, not only `id` and `status` as DIB-33's item 3 said (`extensionFields` in `src/tickets.mjs`, its `readerOnly` branch). No other command writes them. So `depends_on`, `parent`, `order`, `title` and `description` can be set at `dibber new` and never again through Dibber. What that costs, in Baton's store on 2026-11-27 and 2026-11-28:

- **Re-ranking took a hand edit.** Baton's 0.1 plan needed the `order` of 25 existing tickets changed. Dibber answered "`--field` cannot write Dibber-owned key `order`", so the owner had to approve a one-off hand edit, twice (`baton:docs/plans/baton-0-1.mdx`, decisions D7 and D9).
- **Dependencies, the same.** Moving `baton:B-120` off a dependency, and making `baton:B-366` wait on five new tickets, were hand edits of `depends_on`.
- **A rewritten ticket kept its old title.** `baton:B-374`'s scope changed before it landed; its title and description could not be changed through Dibber, and re-filing it under its own id was refused as taken.
- **The two copies drift.** R-DIB-11 requires the body's `**Depends on:**` line to equal `depends_on`. Edited by hand, one changes without the other: `dibber check` reports dozens of R-DIB-11 mismatches in Baton's store.

A coordinator does not want to write these keys itself. They are the store's: Baton's ticket-ownership design lists the title, the description and the relations among the fields a store owns, which Baton changes only by writing through the store. So the store's own tool must be able to write them.

### What to build

1. **`dibber edit <id>`** with any of:
   - `--depends-on <ids>` (the whole list), `--add-dependency <id>`, `--remove-dependency <id>`;
   - `--parent <id>`, `--no-parent`;
   - `--order <n>`;
   - `--title "…"` (the `<id> — ` prefix kept), `--description "…"`.
2. **It validates what it writes.** A dependency or parent must name a ticket (qualified ids are not checked locally), no cycle may form (R-DIB-8), and the result must pass `ticket.schema.json` and the store's `item.schema.json` (R-DIB-3). A refusal changes nothing.
3. **It keeps R-DIB-11's courtesy lines true.** Changing `depends_on` rewrites the body's `**Depends on:**` line in the same write, and `**Used by:**` stays derived, never written to another file (R-DIB-7).
4. **It records the change.** `updated` moves to today, and a dated line is appended to the ticket's `## Status`: which keys changed, from what to what (`--note` adds a reason).
5. **No commits, as today** (DIB-33, item 4). The caller commits.
6. **The spec, the README's CLI section and the work and new-ticket skills** say that these keys change through `dibber edit`.

### Exit criteria

- [ ] Tests: `dibber edit` sets, adds and removes dependencies and keeps the `**Depends on:**` line equal; refuses an unknown id and a cycle; sets `order`, `parent`, `title` and `description`; appends a dated status line; leaves the file untouched on a refusal.
- [ ] `dibber check` passes on the conformance stores and this store after an edit of each kind.
- [ ] `npm test` green; published in the next release.

## Status

_filed 2026-11-28._
