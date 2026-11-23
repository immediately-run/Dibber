---
id: DIB-13
title: "DIB-13 — Optional immediately.run board: open any Dibber store in the board viewer"
status: in-progress
description: Open a repository's Dibber store on immediately.run and see it as a read-only kanban board, a ticket page and project pages, through the Grove-based viewer now called baton-board (dibber-board after DIB-18). It renders plain Dibber stores, not only the immediately.run roadmap's.
depends_on: [DIB-3, DIB-5]
order: 150
tags: [integrations, immediately-run]
project: wide-audience
repos: [immediately-run/dibber-board]
assignee: Claude
prs: [https://github.com/immediately-run/dibber-board/pull/6, https://github.com/immediately-run/dibber/pull/7]
---

**Brief:** from the owner's list, 2026-11-22: optional immediately.run integration that displays tickets or the whole kanban board. Renderer decided by the owner the same day: the Grove-based viewer in `immediately-run/baton-board`.
**Spec:** R-DIB-1, R-DIB-6, R-DIB-8, R-DIB-9, R-DIB-10, R-DIB-13.
**Depends on:** DIB-3, DIB-5.

### Why

Seeing the board is often what makes tickets click for someone new to them, and immediately.run
can show a repository with no build step or hosting. The viewer already exists.
`immediately-run/baton-board` is an immediately.run app on Grove's thin-shell pattern, with ten
board components (`RoadmapBoard`, `NextAvailable`, `Dependencies`, `ProjectIndex`, …). The
ticket wikis of baton, fieldhouse, hq and docs open in it through an `opensWith` marker in
their `tickets/immediately.run.json`. It is read-only.

It was built for the immediately.run roadmap, though, and a plain Dibber store does not render
in it today. Read on 2026-11-22 at `eeb12d6`:

- **Nothing shows up.** `isItemMeta` (`src/components/roadmapLib.ts`) counts a file as a ticket
  only if it carries the tag `roadmap-item`. R-DIB-1 says any file with an `id` and no other
  `kind` is a ticket.
- **`withdrawn` has no column.** `STATUS_ORDER` (`roadmapData.ts`) lacks it, so a withdrawn
  ticket falls to the unknown-status tail. It also keeps a live `done` as a deprecated alias,
  where Dibber now reads closure from `status` alone, in any folder (R-DIB-2, DIB-24).
- **Roadmap-only rules.** The queue rule (`EXPEDITE` and `OP` tags) and the `Requires:` clause
  read from `description` are the immediately.run roadmap's conventions, not Dibber's (R-DIB-9).
- **Cross-repository dependencies look broken.** A qualified `depends_on` (`baton:B-111`) is
  never found locally, so the ticket is held with nothing saying why, as if it pointed at a
  ticket that doesn't exist.
- **Keys it does not show:** `parent` (no children list) and `assignee`.
- **`.mdx` only.** The record-set descriptor the ticket repositories use selects `*-*.mdx`, so a
  `.md` store (DIB-3) would select nothing.

### What to build

- **In the viewer:**
  - A ticket is whatever R-DIB-1 says it is, in every store. No mode switch is needed: on
    2026-11-22, none of the 1,945 docs pages carrying an `id` lacked a `kind` other than the
    roadmap items, so the rule picks out the same files there. A test over the docs, baton and
    fieldhouse corpora pins this.
  - The queue rule (`EXPEDITE`, `OP`) and the `Requires:` clause stay as the viewer's own
    conventions, documented in its README (R-DIB-9). A store that doesn't use them sees no
    queue chips.
  - All of R-DIB-6's statuses get columns. Closed tickets, by `status`, go in a collapsed column.
  - A qualified dependency still holds the ticket (R-DIB-8), but the board labels it "waits on
    `baton:B-111` in another repository", not as a missing ticket.
  - Cards show `assignee` and a parent's children.
- **A descriptor template:** the `tickets/immediately.run.json` a Dibber store needs to open in
  the viewer (`opensWith`, a record set selecting `.md` and `.mdx`, closed tickets by status).
  `dibber init --immediately-run` (DIB-8) writes it.
- **This repository's own `tickets/`** carries the descriptor, so Dibber's board is the first
  example.
- **Mobile and signed out:** works on a phone, and read-only for public repositories when
  signed out.

### Exit criteria

- [x] the viewer's `npm test` renders DIB-5's every-key store with every ticket in its status's column and every qualified dependency shown as outside the store
- [ ] the viewer's existing tests still pass, and a new test finds the same set of tickets in the docs, baton and fieldhouse corpora under R-DIB-1 as under the `roadmap-item` tag
- [x] a Playwright run opens this repository's `tickets/` on immediately.run and finds every live DIB ticket on the board (needs a browser)

## Status

_filed 2026-11-22._

_2026-11-22: renderer decided by the owner: the Grove viewer with custom components in `immediately-run/baton-board`, not `kanban-board`. Its rename to `dibber-board` is DIB-18. Rewritten from what the viewer does at `eeb12d6`._

_2026-11-22: test data is DIB-5's every-key store; the invented demo store is dropped (DIB-11)._

_2026-11-23: claimed by Claude._

_2026-11-23: Viewer and descriptor built on branch claude/gallant-pascal-qdrrdj in dibber-board and here. The viewer reads R-DIB-1 tickets, gives every live status a column and folds the closed ones, labels qualified dependencies as in another repository, and shows assignee and children; its README documents the EXPEDITE/OP/Requires: queue rule as its own (R-DIB-9). `dibber init --immediately-run` writes `immediately.run.json`, `home.mdx` and `_layout.mdx` into the store, and this repository's `tickets/` carries them. The descriptor has no record set: the board reads the bundle's entries, not a layout, and the layout grammar's single `select` glob and single terminal status could not express `.md`+`.mdx` or four closed statuses anyway. Left: fieldhouse and hq in the corpus test (outside the session), and the Playwright run on immediately.run once both branches are on main._

_2026-11-23: in-review, https://github.com/immediately-run/dibber-board/pull/6._

_2026-11-23: in-review, https://github.com/immediately-run/dibber/pull/7._

_2026-11-23: dibber-board#6 and dibber#7 merged. Playwright on immediately.run, main at fcedc56: the board shows all 15 live DIB tickets in their status columns (available 12, in-progress 2, in-review 1, deprioritized 0) and the 10 closed ones in the folded column; the owner also opened it and confirmed it works. Left: the second criterion's fieldhouse corpus (and hq), outside the session that built this; the docs and baton corpora pass._
