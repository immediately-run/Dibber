---
id: DIB-19
title: DIB-19 — A template repository for people who start from GitHub, not a terminal
status: available
depends_on: [DIB-8]
order: 82
tags: [onboarding]
project: wide-audience
---

**Brief:** split from DIB-8 on 2026-11-22: its template-repository half.
**Depends on:** DIB-8.

### Why

Some newcomers never open a terminal. A "Use this template" repository gives them the same start as `dibber init`.

### What to build

A template repository (or a `template/` folder this repository publishes) holding exactly what `dibber init --yes` writes, kept in step by a test. Creating the repository is the owner's step.

### Exit criteria

- [ ] a test: the template's files equal what `dibber init --yes` writes into an empty repository, apart from the prefix

## Status

_filed 2026-11-22._
