---
id: DIB-21
title: DIB-21 — Publish @immediately-run/dibber to npm and tag the first release
status: available
depends_on: [DIB-6, DIB-7, DIB-8]
order: 88
tags: [release]
project: wide-audience
---

**Brief:** split from DIB-6 on 2026-11-22: the npm name `dibber` is taken, so the package is `@immediately-run/dibber`; publishing is the owner's step.
**Depends on:** DIB-6, DIB-7, DIB-8.
**Waits on:** the owner, to publish to npm and push the tag.

### Why

The skills, `AGENTS.md` and the docs say `npx -y @immediately-run/dibber`, which fails until the package exists. The GitHub Action and pre-commit hook should pin a tag, not `main`.

### What to build

The owner publishes `@immediately-run/dibber` 0.1.0 from this repository's main and tags `v0.1.0`. Then the docs' `@main` pins become `@v0.1.0`.

### Exit criteria

- [ ] `npx -y @immediately-run/dibber --help` prints the usage
- [ ] `git ls-remote --tags origin v0.1.0` finds the tag

## Status

_filed 2026-11-22._
