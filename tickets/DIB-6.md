---
id: DIB-6
title: "DIB-6 — dibber check: a validator, plus a ready-made GitHub Action and pre-commit hook"
status: in-review
description: ticket.schema.json exists but nothing applies it. A validator that checks a store against the spec is the guardrail that keeps agent-written tickets valid.
depends_on: [DIB-1, DIB-5]
order: 60
tags: [tooling]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** R-DIB-1 to R-DIB-8 (whatever can be checked from the files).
**Depends on:** DIB-1, DIB-5.

### Why

Agents will write frontmatter that doesn't parse, a `status` the schema doesn't know, or a
`depends_on` to a ticket that doesn't exist. Someone new to issue tracking won't notice until a
board shows nothing. A check that runs on every push catches it.

### What to build

- `dibber check [path]`, a Node command (published to npm, run with `npx`, no install). It reads
  `.dibber/config.json` (DIB-1), validates every ticket against `ticket.schema.json` plus any
  `item.schema.json`, and checks file name = id, `done` only in `archive/`, no reused id, no
  dangling or cyclic `depends_on`, and a local `parent`. Errors name the file, the key and the
  rule, in plain words.
- An `action.yml` at this repository's root, so a user's workflow can say
  `uses: immediately-run/dibber@v1`, and a `.pre-commit-hooks.yaml`.
- A worked example workflow in the docs. Adding CI to *this* repository's `.github/` is the
  owner's to do in its own PR.

### Tests

- Runs every fixture under `conformance/`: valid passes, invalid fails naming the rule in its
  `expect.json`.

### Exit criteria

- [x] `npm test` passes, covering every conformance fixture
- [ ] `npx @immediately-run/dibber check` passes on this repository's own `tickets/`

## Status

_filed 2026-11-22._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: dibber check, action.yml, .pre-commit-hooks.yaml, docs/checking.md. The npx criterion waits on publishing (DIB-21); from source it passes. Enabling CI in this repository's .github/ is the owner's step. Running it on baton and fieldhouse found the conflict filed as DIB-20._

_2026-11-22: in review, https://github.com/immediately-run/Dibber/pull/1._
