---
id: APP-1
title: "APP-1 — Try Dibber: move this ticket to done"
status: available
description: A first ticket, to see how Dibber works. Read it, then close it.
depends_on: []
---

**Brief:** filed by `dibber init` on 2026-11-25.
**Depends on:** none.

### Why

A ticket is a short note in your repository that says what to do, why, and how you'll know
it's done. You and your coding agent both read it, and it travels with the code in git.

### What to build

Nothing. Try the loop instead:

1. Ask your agent "what's on the board?". It lists this ticket.
2. Ask it to file a ticket for something you actually want, such as "add a dark mode".
3. Close this one: ask your agent to mark it done, or run `dibber done APP-1`. Its status
   becomes `done`, and the file stays where it is.

### Exit criteria

- [ ] `dibber list` no longer shows APP-1 as open

## Status

_filed 2026-11-25._
