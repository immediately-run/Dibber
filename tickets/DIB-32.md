---
id: DIB-32
title: DIB-32 — dibber init opens the store on immediately.run by default; --no-immediately-run turns it off
status: done
depends_on: []
tags: [cli]
updated: 2026-11-24
---

**Depends on:** none.

### Why

The owner, 2026-11-24: the immediately.run board should be on by default, with a switch only to turn it off. As DIB-13 built it, a new store got the board files only with --immediately-run.

### What to build

dibber init writes immediately.run.json, home.mdx and _layout.mdx into the store unless --no-immediately-run is given, and prints the board's address. It still never overwrites a file. The help text, docs/install.md and the site say so.

### Exit criteria

- [x] a test: init --yes writes the three board files and check passes
- [x] a test: init --yes --no-immediately-run writes none of them
- [x] npm test

## Status

_filed 2026-11-24._

_2026-11-24: done._

_2026-11-24: `init` writes the board files unless `--no-immediately-run`; the help, docs/install.md and the site say so. Tests cover both. Re-running `init` on an existing store, as `init --yes --update-skills` does, now adds the three files too if they are missing (it still never overwrites). `npm test`: 67 pass._
