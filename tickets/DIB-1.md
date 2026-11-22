---
id: DIB-1
title: "DIB-1 — A config file Dibber owns: the store's folder and id prefix"
status: available
description: R-DIB-1 and R-DIB-4 leave the store's folder and prefix to "the repository's tools"; without Baton there is nowhere to say them. Add an optional dibber.json.
depends_on: []
order: 10
tags: [spec, tooling]
project: wide-audience
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** amends R-DIB-1, R-DIB-4.
**Depends on:** none.

### Why

R-DIB-1 puts the store in `tickets/` "by convention, another where the repository's tools are
configured so", and R-DIB-4 gives each repository a prefix without saying where it is written. A
repository using Baton or Fieldhouse writes both in `.baton/baton.json`. A repository with no
coordinator has no such file, so every tool (validator, CLI, setup, skills) would have to guess.

### What to build

- An optional `dibber.json` at the repository root: `{ "store": "tickets", "prefix": "DIB" }`,
  with a JSON Schema of its own (`dibber.schema.json`).
- A spec rule saying a reader takes the store and prefix from `dibber.json` when it is there,
  and otherwise from `tickets/` and the prefix the existing ids share. A coordinator's own
  settings may still name them, but they must not disagree with `dibber.json`.
- This repository's own `dibber.json`, prefix `DIB` (already in use by `DIB-1`…).
- A note in the Versions section: an optional file, so this amends Dibber 1 in place.

### Exit criteria

- [ ] `dibber.json` in this repository validates against `dibber.schema.json`
- [ ] every id under `tickets/` starts with the prefix `dibber.json` names (a check script, run in DIB-6's validator once that exists)

## Status

_filed 2026-11-22._
