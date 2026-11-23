---
id: DIB-8
title: "DIB-8 — One-command setup: dibber init and a template repository"
status: in-review
description: Zero to first ticket in one command. Creates .dibber/config.json, tickets/, archive/, a sample ticket and the agent instructions.
depends_on: [DIB-3, DIB-7]
order: 80
tags: [tooling, onboarding]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** suggested in the 2026-11-22 planning session on what Dibber lacks for a wide audience.
**Depends on:** DIB-3, DIB-7.

### Why

The first five minutes decide whether a newcomer stays. Today they read a spec, then build
folders and frontmatter by hand.

### What to build

- `npx @immediately-run/dibber init` asks for a prefix (with a default from the repository name), then writes
  `.dibber/config.json`, `tickets/`, `tickets/archive/`, one sample ticket (`<PREFIX>-1.md`, "Try
  Dibber: move me to done") and the agent instructions from DIB-9. It skips files that already
  exist and says what it skipped.
- Non-interactive flags (`--prefix`, `--yes`), so an agent can run it.
- A template repository, or a `template/` folder this repository publishes, with the same files,
  for people who use "Use this template" rather than a terminal.

### Exit criteria

- [x] a test runs `dibber init --yes` in an empty git repository, then `dibber check` passes and `dibber list` shows the sample ticket
- [x] running `init` twice changes nothing the second time (the test diffs the tree)

## Status

_filed 2026-11-22._

_2026-11-22: implemented on branch claude/affectionate-goodall-95x077; closes when it lands: dibber init writes config, store, first ticket, skills and AGENTS.md/CLAUDE.md, never overwriting. The template repository is split out as DIB-19. --immediately-run waits on DIB-13._

_2026-11-22: in review, https://github.com/immediately-run/Dibber/pull/1._
