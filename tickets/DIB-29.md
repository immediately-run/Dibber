---
id: DIB-29
title: DIB-29 — Project pages list their tickets on immediately.run
status: done
depends_on: []
tags: [immediately-run]
project: wide-audience
assignee: claude
prs: [https://github.com/immediately-run/dibber/pull/11]
updated: 2026-11-23
---

**Brief:** from the owner, 2026-11-23: keep going until dibber-board works.
**Depends on:** none.

### Why

On immediately.run a project page shows only its own text: wide-audience says 'the tickets are the ones whose project is wide-audience' above nothing. The store's _layout.mdx (and the init template it is copied from) wraps tickets with RoadmapMeta and Dependencies but never adds dibber-board's ProjectMembers, the section that lists a project's tickets.

### What to build

Add <ProjectMembers /> to templates/immediately-run/_layout.mdx and to this repository's tickets/_layout.mdx, after <Dependencies />. It renders nothing on a page that is not a kind: project page, so it belongs in the root layout wherever a store keeps its projects. Assert it in the init test.

### Exit criteria

- [ ] dibber init --immediately-run writes a _layout.mdx containing <ProjectMembers />
- [ ] the wide-audience project page on immediately.run lists its tickets
- [ ] npm test passes

## Status

_filed 2026-11-23._

_2026-11-23: claimed by claude._

_2026-11-23: done, https://github.com/immediately-run/dibber/pull/11._
