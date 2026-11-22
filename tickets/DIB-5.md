---
id: DIB-5
title: "DIB-5 — Conformance fixtures: example stores that are valid and invalid"
status: in-review
description: A set of small example stores, each marked valid or invalid with the rule it breaks, so the validator and every reader can prove they read Dibber the same way.
depends_on: []
order: 50
tags: [spec, tests]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** every R-DIB rule a fixture exercises.
**Depends on:** none.

### Why

The spec is the only definition of "valid", and nothing tests a reader against it. Fixtures give
the validator (DIB-6) its test data. They also give Baton, Fieldhouse and Grove a way to show
that the README's Readers section is true (DIB-12).

### What to build

- `conformance/valid/<name>/` and `conformance/invalid/<name>/`, each a small store with an
  `expect.json` naming the rule (`R-DIB-n`) an invalid store breaks and the file that breaks it.
- At least: a minimal store; an every-key store, with every status in `ticket.schema.json` and
  every key in R-DIB-5 used at least once (the board's test data, DIB-13); nested folders; a page with `kind: doc` next to tickets; an archive;
  qualified `depends_on`. Invalid cases: a missing `title`; `done` outside `archive/`; a file
  name that differs from its id; a reused id across store and archive; a `depends_on` cycle; an
  unknown status.
- A README in `conformance/` saying how a reader uses the fixtures.

### Exit criteria

- [x] every invalid fixture names exactly one rule in `expect.json`
- [x] every R-DIB rule that can be checked mechanically has at least one invalid fixture (a test lists the rules that have none)

## Status

_filed 2026-11-22._

_2026-11-22: gains the every-key store, which DIB-11 no longer provides now that this repository is the example._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: 27 fixtures (9 valid, 18 invalid) under conformance/, every checkable rule covered._

_2026-11-22: in review, https://github.com/immediately-run/Dibber/pull/1._
