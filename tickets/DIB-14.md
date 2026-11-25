---
id: DIB-14
title: "DIB-14 — A newcomer's guide: tickets in ten minutes, and the words Jira and Linear use"
status: done
description: A guide for people who have never used issue tracking. Start with three statuses, learn the rest when needed, and see a table mapping Jira, Linear and GitHub Issues words to Dibber's.
depends_on: [DIB-2]
order: 100
tags: [docs, onboarding]
project: wide-audience
assignee: Peter Neumark
updated: 2026-11-25
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** R-DIB-5, R-DIB-6, R-DIB-8, R-DIB-11.
**Depends on:** DIB-2.

### Why

SPEC.md is written for tool authors: numbered rules and precise edge cases. Someone new to
tickets needs to know what a ticket is for, what to write in one, and that three statuses are
enough to start. The eight statuses are a lot to take in at once.

### What to build

- `docs/guide.md`: what a ticket is, and why it's worth writing one before asking an agent to
  build something. A good ticket's three parts: what, why, and how you'll know it's done.
- "Start simple": `available` → `in-progress` → `done`, then when to reach for `in-review`,
  `deprioritized`, `deferred`, `superseded` and `withdrawn`.
- A table mapping Jira, Linear and GitHub Issues terms to Dibber: backlog and todo → `available`;
  in progress; in review; done; canceled → `withdrawn`; duplicate → `superseded`; epic and parent
  issue → `parent`; blocked by → `depends_on`; labels → `tags`; project and milestone → `project`;
  assignee → `assignee` (advisory: a note of who is on it, not a lock); priority and estimate →
  DIB-4's outcome.
- "Dibber alone, or with Baton": in plain words, from DIB-2. You and your coding agent on your
  machine: Dibber is all you need. Several agents running at once, a team, or several LLM
  providers: add Baton, and keep your tickets as they are.
- The same table is reused by the migration docs (DIB-16).

### Exit criteria

- [x] every status in `ticket.schema.json` appears in the guide (a test)
- [x] every link in `docs/` resolves (a link check)

## Status

_filed 2026-11-22._

_2026-11-22: gains the "Dibber alone, or with Baton" section (DIB-2)._

_2026-11-25: claimed by Peter Neumark._

_2026-11-25: done._
