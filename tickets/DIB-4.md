---
id: DIB-4
title: "DIB-4 — Decide: assignee, priority and type for people without a coordinator"
status: available
description: Newcomers expect assignee, priority and type. Dibber keeps "who holds it" out of the ticket by design. Decide whether to add optional advisory keys or to say clearly why not.
depends_on: []
order: 40
tags: [spec, decision]
project: wide-audience
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** R-DIB-5, Coordination state.
**Depends on:** none.
**Waits on:** the owner's decision between the options below.

### Why

Everyone coming from Jira, Linear or GitHub Issues looks for assignee, priority and type
(bug, feature, chore) first. Dibber has `order` and free `tags`. It keeps "who holds a ticket"
out of the file on purpose ("Coordination state"): a file can say who is on it but cannot stop
two people writing their names at once. If the docs don't explain this, it reads as a gap rather
than a choice.

### Options

- **a.** Add optional keys: `assignee` (advisory only, never a lock), `priority` (a small enum)
  and `type` (`bug`, `feature`, `chore`). This amends Dibber 1, since all are optional.
- **b.** Add `priority` and `type`, but not `assignee`. The docs explain that a claim belongs to
  a coordinator and that an advisory name is a convention a store adds in its own schema.
- **c.** Add none of them. Documented recipes for each go in the customization guide (DIB-15)
  as `item.schema.json` additions.

Recommendation: **b**. Priority and type are what the work is, so they fit the format. Assignee
is who holds the work, which the spec deliberately leaves to coordinators.

### Exit criteria

- [ ] the decision is recorded in this ticket's Status
- [ ] SPEC.md and `ticket.schema.json` match it (no change for c)

## Status

_filed 2026-11-22._
