---
id: DIB-5
title: "DIB-5 — Conformance fixtures: example stores that are valid and invalid"
status: available
description: A set of small example stores, each marked valid or invalid with the rule it breaks, so the validator and every reader can prove they read Dibber the same way.
depends_on: []
order: 50
tags: [spec, tests]
project: wide-audience
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
- At least: a minimal store; nested folders; a page with `kind: doc` next to tickets; an archive;
  qualified `depends_on`. Invalid cases: a missing `title`; `done` outside `archive/`; a file
  name that differs from its id; a reused id across store and archive; a `depends_on` cycle; an
  unknown status.
- A README in `conformance/` saying how a reader uses the fixtures.

### Exit criteria

- [ ] every invalid fixture names exactly one rule in `expect.json`
- [ ] every R-DIB rule that can be checked mechanically has at least one invalid fixture (a test lists the rules that have none)

## Status

_filed 2026-11-22._
