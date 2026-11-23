---
id: DIB-25
title: "DIB-25 — Link code to its ticket: the work skill adds a Markdown link on larger code units"
status: available
depends_on: [DIB-24]
order: 92
tags: [agents, skills]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: for larger code units (classes, large functions or file headers), the ticket implementation skill adds a markdown comment reference linking to the ticket file, so someone browsing the source can immediately navigate to it.
**Depends on:** DIB-24.

### Why

Someone reading code wants to know why it exists. A one-line comment with a relative Markdown link to the ticket file is clickable on GitHub and in editors, and it keeps working because ticket files never move (DIB-24).

### What to build

`dibber-work-ticket` gains a step: on each class, large function or file header the ticket adds or reshapes, add a comment holding a Markdown link to the ticket file, by a path relative to the source file. Use the language's comment syntax. Extend an existing link when another ticket reshapes the unit, and give a ticket in another repository its full URL. Small edits and tests don't need one. This repository's own source files carry such links, and a test checks that every one resolves.

### Exit criteria

- [x] a test: every Markdown link to a ticket in this repository's source files resolves to an existing ticket
- [x] `skills/dibber-work-ticket/SKILL.md` states the rule, with examples in two languages

## Status

_filed 2026-11-23._
