---
id: DIB-17
title: "DIB-17 — A README that is concise, inviting and fun"
status: available
description: Rewrite the README for someone who has never used a ticket tracker. Lead with why tickets in files suit agents, show the one-command setup, and keep the spec for those who want it.
depends_on: [DIB-8, DIB-11, DIB-14, DIB-18]
order: 160
tags: [docs, onboarding]
project: wide-audience
---

**Brief:** from the owner's list, 2026-11-22: a good README which is concise, inviting and fun.
**Depends on:** DIB-8, DIB-11, DIB-14, DIB-18.

### Why

Today's README is accurate but addressed to tool authors: format first, readers, versioning. A
vibe coder decides in about thirty seconds whether a project is for them.

### What to build

- **Opening:** what it is in one line, and who it's for: you and your coding agent, on your
  machine. One more line says when to add Baton (several runners, a team, several LLM
  providers), from DIB-2.
- **"Why not GitHub Issues?"** Your agent reads tickets as files, with no API, login or rate
  limit. It works offline. A ticket is reviewed in the same PR as the code. Nothing to host.
- **A 30-second start:** `npx @immediately-run/dibber init`, then "ask your agent to file a ticket" with DIB-9's
  skills, then see it on the board in `dibber-board` (DIB-13, DIB-18).
- A picture: this repository's own board or `tickets/` tree.
- "This repository is an example" (DIB-11): links to a good open ticket, a closed one, a project
  page and the config.
- The orienteering name and "calling dibs", kept short and playful.
- Links onward: guide (DIB-14), customizing (DIB-15), migrating (DIB-16), the spec, Readers.
- No emoji, matching the immediately.run house style.

### Exit criteria

- [ ] the README is at most 120 lines (a test)
- [ ] every command in the README's start section runs in a test against an empty repository
- [ ] every link in the README resolves (a link check)

## Status

_filed 2026-11-22._

_2026-11-22: the audience line and the example section follow the owner's direction (DIB-2, DIB-11)._
