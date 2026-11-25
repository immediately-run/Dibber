---
id: DIB-16
title: "DIB-16 — Migrate from Linear, Jira or GitHub Issues: docs and importers"
status: done
description: A guide and one import command per source that turns an export into a valid Dibber store, keeping ids traceable and relations intact.
depends_on: [DIB-7, DIB-14]
order: 120
tags: [docs, tooling, migration]
project: wide-audience
assignee: Peter Neumark
prs: [https://github.com/immediately-run/dibber/pull/26]
updated: 2026-11-25
---

**Brief:** from the owner's list, 2026-11-22: docs on how to migrate from Linear, Jira or GitHub issues.
**Spec:** R-DIB-4, R-DIB-5, R-DIB-6, R-DIB-8.
**Depends on:** DIB-7, DIB-14.

### Why

People with an existing tracker won't switch if switching means retyping. A migration that
keeps relations and history is the difference between trying Dibber and not.

### What to build

- `dibber import github|linear|jira <export>`, reading each tool's own export (GitHub's REST or
  `gh issue list --json`, Linear's CSV or JSON, Jira's CSV), with no API token handled by Dibber.
  The user runs the export themselves.
- Mapping by DIB-14's table. Closed issues become closed tickets, in place. Parent and sub-issues become
  `parent`, and blocked-by becomes `depends_on`. The original key and URL go in a body header
  line (`**Imported from:**`) so old links stay traceable. Comments go under `## Status` as dated
  entries.
- New ids allocated in the store's prefix, with the old key kept, never reused as the id (R-DIB-4).
- `docs/migrating.md`, one section per source, covering the export steps, the command, what
  doesn't carry over (attachments, custom workflows) and how to stop using the old tracker.

### Exit criteria

- [x] for each source, a fixture export imports to a store that `dibber check` passes, with relations preserved (a test per source)

## Status

_filed 2026-11-22._

_2026-11-25: claimed by Peter Neumark._

_2026-11-25: done, https://github.com/immediately-run/dibber/pull/26._
