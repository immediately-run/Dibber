---
id: DIB-4
title: "DIB-4 — Decide: assignee, priority and type for people without a coordinator"
status: in-progress
description: Newcomers expect assignee, priority and type. Dibber keeps "who holds it" out of the ticket by design. Decide whether to add optional advisory keys or to say clearly why not.
depends_on: []
order: 40
tags: [spec, decision]
project: wide-audience
assignee: Peter Neumark
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** R-DIB-5, Coordination state.
**Depends on:** none.
**Waits on:** the owner's decision on `priority` and `type` (assignee is decided; see Status).

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

- [x] the assignee decision is recorded in this ticket's Status, and SPEC.md and `ticket.schema.json` carry `assignee`
- [x] the priority and type decision is recorded in this ticket's Status
- [x] SPEC.md and `ticket.schema.json` match it (no change if neither is added)

## Status

_filed 2026-11-22._

_2026-11-22: assignee decided by the owner: an optional, advisory `assignee` for solo users. Added to R-DIB-5's table, to `ticket.schema.json`, and to Coordination state, which says it is not a hold. Priority and type are still open: option a less assignee, or c._

_2026-11-25: claimed by Peter Neumark._

_2026-11-25: Owner agreed to optional type with task, bug, feature, epic, and chore. Priority remains store-specific and order ranks ready tickets. Existing custom type values outside the enum need the DIB-27 migration before release._
