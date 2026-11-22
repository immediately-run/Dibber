---
id: DIB-3
title: "DIB-3 — Default to .md tickets; MDX as the opt-in"
status: in-review
description: A stray < or { in prose breaks an .mdx ticket, which agents do often and newcomers cannot debug. Make .md the default in the spec's examples, the template and the tools.
depends_on: []
order: 30
tags: [spec, docs]
project: wide-audience
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Spec:** amends R-DIB-1 (file naming), R-DIB-11 (the body).
**Depends on:** none.

### Why

R-DIB-1 names a ticket `<id>.mdx` and treats `.md` as the alternative. An `.mdx` body is compiled
as MDX, so prose like `use <div>` or `{name}` fails to render. Agents write that kind of text
all the time, and someone who has never heard of MDX gets an error they cannot read. Plain `.md`
renders on GitHub and everywhere else with no such failure.

### What to build

- R-DIB-1: `<id>.md` is the default name and `<id>.mdx` is read alike, for stores rendered as
  MDX wikis (R-DIB-13). Both stay valid, so this amends Dibber 1 in place.
- README and SPEC examples use `.md`.
- DIB-7's CLI and DIB-8's template create `.md`, with an option for `.mdx`.

### Exit criteria

- [x] `grep -n '\.mdx' README.md` shows only the opt-in mention
- [x] the CLI's `new` test asserts a `.md` file by default and `.mdx` with the option

## Status

_filed 2026-11-22. This repository's own store already uses `.md`._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: R-DIB-1 names .md the default; README examples are .md; the CLI writes .md unless --mdx._
