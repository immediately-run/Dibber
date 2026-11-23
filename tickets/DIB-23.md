---
id: DIB-23
title: "DIB-23 — List the skills where agent harnesses look: Claude Code marketplace, cross-harness installers, Codex plugins"
status: available
depends_on: [DIB-9, DIB-21]
order: 159
tags: [agents, integrations]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: follows the discovery question for Claude Code, Codex, opencode and Antigravity users.
**Depends on:** DIB-9, DIB-21.

### Why

`dibber init` installs the skills per repository. People who browse for skills inside their agent tool, or want them in every repository, look in that tool's catalog. This repository is already a Claude Code plugin marketplace, but nothing tells anyone.

### What to build

(1) Claude Code: the README's install line (`/plugin marketplace add immediately-run/dibber`, then `/plugin install dibber@dibber`), which `claude plugin validate` asks for, and an icon, which it warns is missing. (2) Cross-harness installers such as Vercel's `npx skills add`, which reads `.claude-plugin/marketplace.json`: confirm it installs all three skills, and document the line. (3) Codex plugins: read the current docs, and add a manifest if the format allows it without duplicating `skills/`. (4) Antigravity and opencode global skill folders: document the copy step if no installer covers them. Submitting to any public directory is the owner's step.

### Exit criteria

- [ ] `claude plugin validate .` passes with no warnings
- [ ] a test: each install line in the docs names a manifest that exists in this repository

## Status

_filed 2026-11-23._
