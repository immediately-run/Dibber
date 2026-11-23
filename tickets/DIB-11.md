---
id: DIB-11
title: "DIB-11 — This repository is the worked example of a Dibber-tracked project"
status: in-progress
description: Dibber's own repository shows what a Dibber-tracked project looks like, in use, with every piece a newcomer would set up. That means config, tickets closing with their PRs, agent instructions, and the board.
depends_on: [DIB-1, DIB-9]
order: 85
tags: [docs, examples]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** from the owner, 2026-11-22: the Dibber repository can be the example of what a Dibber-tracked project looks like.
**Depends on:** DIB-1, DIB-9.

### Why

A store that is really used teaches more than an invented one, and it can't drift from
practice because it *is* the practice. This repository already keeps its work in `tickets/`.
What's missing is everything else a newcomer would have after `dibber init`, plus a page that
points it out.

### What to build

- **This repository carries what `dibber init` writes:** `.dibber/config.json` (DIB-1), and the
  agent instructions from DIB-9 in `AGENTS.md` and as the Claude Code plugin. Work on Dibber
  itself is done through those skills, so the example is the way the repository works, not a
  showcase.
- **Tickets close the Dibber way:** each landed ticket gets `status: done` in place, with
  `prs` filled in and a dated Status entry. Over time the closed tickets are the example of a finished
  ticket.
- **The board descriptor** from DIB-13, so the repository opens as its own board once DIB-13
  lands.
- **A "This repository is an example" section** in the README (DIB-17 places it), pointing at a
  good open ticket, a closed one, a project page, and the config.
- The invented demo store this ticket used to specify is dropped. Test coverage of every status
  and key moves to DIB-5's fixtures.

### Exit criteria

- [ ] `npx @immediately-run/dibber check` passes on this repository in its CI (enabling CI here is the owner's step; see DIB-6)
- [ ] a test: every file `dibber init --yes` would create, other than the sample ticket, exists in this repository

## Status

_filed 2026-11-22._

_2026-11-22: rewritten from the owner's direction that this repository is the example. It replaces the invented demo store (`examples/recipe-app/`)._

_2026-11-22: this repository now carries .dibber/config.json, the installed skills, AGENTS.md and CLAUDE.md. Left: the README section (DIB-17), the board descriptor (DIB-13) and CI (owner)._

_2026-11-22: partly in, https://github.com/immediately-run/Dibber/pull/1._
