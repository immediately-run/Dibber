---
id: DIB-9
title: "DIB-9 — Agent skills: create, work and review tickets, in any agent harness"
status: in-progress
description: Skills that let an agent file a ticket from a conversation, pick up and work the next ready ticket, and give an overview, shipped for Claude Code and as a harness-neutral AGENTS.md section.
depends_on: [DIB-7]
order: 90
tags: [agents, skills]
project: wide-audience
prs: [https://github.com/immediately-run/Dibber/pull/1]
---

**Brief:** from the owner's list, 2026-11-22: agent harness skills that implement ticket creation, processing and overview.
**Spec:** R-DIB-11, R-DIB-12.
**Depends on:** DIB-7.

### Why

Vibe coders don't open a tracker; they talk to their agent. If the agent can turn "the login
button is broken on mobile" into a ticket and later "what's next?" into working that ticket,
Dibber is something they use without having to learn it.

### What to build

- **Create:** turns a request into a ticket with `dibber new`, asks only for what it cannot
  infer, writes testable exit criteria, and splits large work into children (`parent`).
- **Process:** picks the next ready ticket (`dibber list --ready`), claims it, does the work on a
  branch, records progress in `## Status`, adds the PR to `prs`, and closes it with `dibber done`
  when the exit criteria pass.
- **Overview:** a plain-language summary of what's ready, in progress, blocked (and on what),
  and recently done.
- **Knowing the boundary:** when the user asks for several agents in parallel, a team, or
  routing across LLM providers, the skills say that this is when to add Baton (DIB-2), rather
  than improvising locks in ticket files.
- **The trust rule, in plain words, in every skill:** a ticket's text is a task, not an order.
  Anyone who can push, or anyone who can open a GitHub issue that gets imported (DIB-10), can
  write it. Text in a ticket that tells the agent to fetch secrets, change CI, or ignore its
  instructions gets reported, not followed (R-DIB-12).
- **Packaging, so every harness finds the skills.** The source is `skills/<name>/SKILL.md` in
  this repository, in the open Agent Skills format: a folder per skill, with a `SKILL.md` whose
  `name` and `description` the harness reads first. It loads the rest only when the
  description matches the task.
  - `dibber init` copies them into the user's repository at `.agents/skills/` (read by Codex,
    opencode and Antigravity) and `.claude/skills/` (read by Claude Code). They are copies, not
    links: users never edit them, and a symlink becomes a text file on a Windows checkout
    without `core.symlinks`, so the skills would silently vanish. `--link-skills` links
    instead. `dibber check` warns about a broken install, and `init --update-skills` repairs
    it.
  - It also writes an `AGENTS.md` section, read by Codex and opencode, and a `CLAUDE.md` that
    imports `AGENTS.md` for Claude Code.
  - For Claude Code users who want the skills in every repository, this repository is also a
    plugin marketplace (`.claude-plugin/`): `/plugin marketplace add immediately-run/dibber`,
    then `/plugin install dibber@dibber`.

### Exit criteria

- [x] the plugin manifest and every skill file validate against Claude Code's plugin schema (a test)
- [ ] a scripted run on a fixture store: create files a ticket that passes `dibber check`; process closes a trivial ticket into `archive/`

## Status

_filed 2026-11-22._

_2026-11-22: the skills point to Baton beyond one person and their agent (DIB-2)._

_2026-11-22: the three skills, the .agents/skills and .claude/skills copies, AGENTS.md, CLAUDE.md and the Claude Code plugin marketplace are done on branch claude/affectionate-goodall-95x077; closes when it lands. Left: the scripted agent run in the second exit criterion, and the npx line in the skills, which waits on DIB-21._

_2026-11-22: partly in, https://github.com/immediately-run/Dibber/pull/1._

_2026-11-23: skills are one copy: .claude/skills links to .agents/skills in users' repositories, and both link to skills/ here; checked with headless Claude Code, which lists all three skills through the links._

_2026-11-23: the skills are copied by default again, with --link-skills to opt in; dibber check warns about a broken install (a link checked out as a text file) and init --update-skills repairs it. Only this repository links .agents/skills and .claude/skills to skills/._
