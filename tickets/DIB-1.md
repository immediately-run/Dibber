---
id: DIB-1
title: "DIB-1 — A config file Dibber owns: .dibber/config.json, the store's folder and id prefix"
status: in-review
description: R-DIB-1 and R-DIB-4 leave the store's folder and prefix to "the repository's tools"; without Baton there is nowhere to say them. Add an optional .dibber/config.json.
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

- An optional `.dibber/` directory at the repository root, holding `config.json`:
  `{ "store": "tickets", "prefix": "DIB" }`. `.dibber/` is where Dibber's own per-repository
  files live, so later ones (templates, agent instructions) have a home without cluttering the
  root.
- A JSON Schema for it, `config.schema.json`, published in this repository beside
  `ticket.schema.json`.
- A spec rule saying a reader takes the store and prefix from `.dibber/config.json` when it is
  there, and otherwise from `tickets/` and the prefix the existing ids share. A coordinator's own
  settings may still name them, but they must not disagree with `.dibber/config.json`.
- This repository's own `.dibber/config.json`, prefix `DIB` (already in use by `DIB-1`…).
- A note in the Versions section: an optional file, so this amends Dibber 1 in place.

### Exit criteria

- [x] `.dibber/config.json` in this repository validates against `config.schema.json`
- [x] every id under `tickets/` starts with the prefix `.dibber/config.json` names (a check script, run in DIB-6's validator once that exists)

## Status

_filed 2026-11-22._

_2026-11-22: the config is `.dibber/config.json`, a directory at the repository root (owner, in the planning session), not a root `dibber.json`._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: R-DIB-14, config.schema.json, this repository's .dibber/config.json._
