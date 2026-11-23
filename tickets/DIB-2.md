---
id: DIB-2
title: "DIB-2 — Say when Dibber alone is enough, and when to add a coordinator"
status: done
description: Dibber alone fits one person driving a coding agent on their own machine. Several runners, several people, or a more complex LLM provider setup need a coordinator such as Baton. Put that boundary in the spec, and fit R-DIB-4's allocation rule to the one-writer case.
depends_on: []
order: 20
tags: [spec]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1, https://github.com/immediately-run/dibber/pull/1]
updated: 2026-11-23
---

**Brief:** from the owner, 2026-11-22: Dibber is enough by itself for a single user driving a coding agent directly on their machine; multiple runners, multiple humans or a more complex LLM provider setup also need Baton.
**Spec:** amends the opening, R-DIB-4 (Allocation) and Coordination state.
**Depends on:** none.

### Why

A newcomer needs to know straight away whether Dibber is the whole answer or half of it. The
spec says what Dibber is not ("no coordination state"), but not who it is enough for. Without
that line, the tooling tickets drift into rebuilding a coordinator: locks, races, parallel
claims. Those are Baton's job.

### What to build

- **A short section near the top of SPEC.md, "Dibber alone, or with a coordinator".**
  - Dibber alone is for one person driving a coding agent on their own machine: one writer at a
    time, the person as the only scheduler.
  - With several runners, several people, or a more complex LLM provider setup (routing work to
    several models or providers, budgets, retries), add a coordinator such as
    [Baton](https://github.com/immediately-run/baton). It allocates ids, holds claims and runs
    the work, and the tickets stay Dibber.
  - Moving from one to the other changes no ticket file.
- **R-DIB-4 Allocation, for one writer:** without a coordinator, the next free number across the
  store, its archive and the repository's local branches. If an occasional collision gets
  through anyway (the same person on two branches), the second to merge renumbers, and the
  rule names what a renumber must rewrite: `depends_on`, `parent`, and the body's header lines.
- **Coordination state:** one sentence pointing back to the new section. A store that needs
  claims to be exclusive has outgrown Dibber alone.

### Exit criteria

- [x] SPEC.md carries the section, and the Versions note says it amends Dibber 1 in place (no store changes validity)
- [x] DIB-7's `new` test: with a ticket on another local branch, `new` skips its number

## Status

_filed 2026-11-22._

_2026-11-22: rewritten from the owner's statement of scope. The earlier version specified a git-as-lock recipe for several agents filing at once. That is a coordinator's job, so it is dropped; several writers at once is what Baton is for._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: SPEC.md section and one-writer allocation; the new-skips-a-branch's-number test._

_2026-11-22: in review, https://github.com/immediately-run/Dibber/pull/1._

_2026-11-23: done: PR #1 merged, https://github.com/immediately-run/dibber/pull/1._
