# Dibber

**Tickets as files in git.** Dibber is a format for keeping a project's tickets in its own
repository: one Markdown file per ticket, YAML frontmatter for its fields, the body for the
record of the work, and an `archive/` folder for closed tickets. No server, no database, no tool
required — a ticket is a file you can read, diff, review and merge like any other.

It is a format, not a product. Coordinators, boards and wikis can read and write it; none of
them owns it. A dibber is the electronic punch an orienteer carries from control to control:
the ticket travels with the work and records what was done along the way. It is also how you
call dibs on a piece of work — though making the dibs stick, one holder at a time, takes a
coordinator such as [Baton](https://github.com/immediately-run/baton): a file in git can say who
is on it, but cannot stop two people writing their names at once.

## A ticket

`tickets/B-7.md`:

```markdown
---
id: B-7
title: "B-7 — Hide terminated runners on the Runners screen by default"
status: available
depends_on: []
tags: [dashboard]
---

**Brief:** reported 2026-11-22: terminated runners clutter the Runners screen.
**Depends on:** none.

### What to build

Show live runners only by default; a toggle shows the terminated ones.

### Exit criteria

- [ ] a test: a terminated runner is absent from the default list and present with the toggle

## Status

_filed 2026-11-22._
```

When it is done it moves to `tickets/archive/B-7.md` with `status: done`.

## The files

- [`SPEC.md`](SPEC.md) — the format, rule by rule (`R-DIB-n`).
- [`config.schema.json`](config.schema.json) — the schema of a repository's optional
  `.dibber/config.json` (the store's folder and id prefix).
- [`ticket.schema.json`](ticket.schema.json) — the JSON Schema every ticket's frontmatter
  satisfies. A repository can add a stricter schema of its own.
- [`skills/`](skills/), [`bin/`](bin/), [`src/`](src/) — optional tooling: the `dibber`
  command (`check`, `list`, `new`, `claim`, `done`, `init`) and the agent skills `dibber init`
  installs for Claude Code, Codex, opencode and Antigravity. The format needs none of it.
- [`tickets/`](tickets/) — Dibber's own work, kept as a Dibber store: an example of what a
  Dibber-tracked project looks like.

## Readers

Baton, Fieldhouse and Grove read Dibber stores; see [`SPEC.md`](SPEC.md#readers). A tool that
reads or writes the format is welcome to add itself there.

## Changing the format

By pull request against `SPEC.md`. A change that keeps every valid store valid amends the
current version; one that would not is a new version ([`SPEC.md`](SPEC.md#versions)).

## Licence

Apache License 2.0 — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
