---
id: DIB-18
title: "DIB-18 — Rename the ticket-wiki viewer baton-board to dibber-board"
status: available
description: The viewer renders Dibber stores for Baton, Fieldhouse, hq and docs alike, so its name should be the format's. Move every opensWith marker across in a window, without a must-land-together set.
depends_on: []
order: 155
tags: [integrations, immediately-run, migration]
project: wide-audience
repos: [immediately-run/baton-board, immediately-run/baton, immediately-run/fieldhouse, immediately-run/docs, immediately-run/hq]
---

**Brief:** from the owner, 2026-11-22: `baton-board` would be better named `dibber-board`.
**Depends on:** none.
**Waits on:** the owner, to create or rename the repository (a repository-settings action no agent session takes).

### Why

The viewer has nothing to do with Baton's leases. It renders ticket stores, and with DIB-13 it
renders any Dibber store. A newcomer who sees "baton-board" in a link will assume they need
Baton.

### What to build

Following docs' `context/cross_repo_migration.mdx`: read the old name and the new, write the new,
and cut over last.

- **Find out first** whether a renamed repository keeps working where it is named. Two places
  to check: (1) the host's `github:immediately-run/baton-board` resolution in `opensWith`
  markers, which may or may not follow GitHub's rename redirect; (2) the pre-cached zip at
  `https://immediately-run.github.io/baton-board/cached_repositories/main.zip`, which is served
  by GitHub Pages and may not follow a rename. Record the answer in this ticket's Status.
- **If either breaks on rename:** the owner creates `immediately-run/dibber-board` from
  `baton-board`'s main, and both serve during the window. Otherwise the owner renames, and the
  redirect covers the window.
- **In the viewer:** package name `@immediately-run/dibber-board`, README title, its `opens`
  entry, and `repository.url`.
- **One PR per consumer, in any order:** the `opensWith` marker in baton's
  `tickets/immediately.run.json`, fieldhouse's, hq's and docs'; baton's README; Fieldhouse's
  `projects/one-ticketing-system.mdx`. Closed tickets that name `baton-board` stay as they are:
  they are the record.
- **Cutover last, in its own step:** archive `baton-board`, or drop the redirect's reliance,
  once a search finds no live marker naming it.

### Exit criteria

- [ ] `gh api -X GET search/code -f q='org:immediately-run "immediately-run/baton-board" filename:immediately.run.json'` finds no live marker
- [ ] each consumer's ticket wiki opens on immediately.run in `dibber-board` (a Playwright check per consumer; needs a browser)

## Status

_filed 2026-11-22._
