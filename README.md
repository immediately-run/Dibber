# Dibber

**Git as your issue tracker. An open format built on Markdown.**

Dibber is a format for keeping a project's tickets in its own
repository: one Markdown file per ticket, YAML frontmatter for its fields, the body for the
record of the work, and a status that says when it's closed. No server, no database, no tool
required — a ticket is a file you can read, diff, review and merge like any other.

It is a format, not a product. Coordinators, boards and wikis can read and write it; none of
them owns it. A dibber is the electronic punch an orienteer carries from control to control:
the ticket travels with the work and records what was done along the way. It is also how you
call dibs on a piece of work — though making the dibs stick, one holder at a time, takes a
coordinator such as [Baton](https://github.com/immediately-run/baton): a file in git can say who
is on it, but cannot stop two people writing their names at once.

## Status

Dibber is in active development, and its work is tracked in Dibber itself. The
[board](https://immediately.run/present/github/immediately-run/dibber/main/bundle/tickets/)
shows every ticket by status — what is ready, in progress and in review, and what is done —
read straight from [`tickets/`](tickets/).

## This repository is an example

Dibber tracks its own work here. Compare an [open ticket](tickets/DIB-15.md)
with a [closed ticket](tickets/DIB-10.md). The closed ticket keeps its path
and links to the pull request that shipped it. The [project page](tickets/projects/wide-audience.md)
groups the work, and [repository settings](.dibber/config.json) name the
store and its ID prefix.

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

When it is done, its `status` becomes `done` and the file stays where it is, so every link to it
keeps working.

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

## CLI

Use `dibber new --title "…"` to file a ticket. Point `--body-file PATH` at a complete
Markdown body. Dibber adds a filing entry if the body has no `## Status` section.
Repeat `--field KEY=VALUE` to supply declared fields, with YAML values for lists
and maps. `dibber set ID --field KEY=VALUE` updates fields declared by the store's
`item.schema.json`. You can also give `set` a status.

If another tool reserved the ID, pass `dibber new --id ID`. A trusted repository can
configure its allocator in `.dibber/config.json`:

```json
{
  "coordinator": {
    "next": ["npx", "@immediately-run/baton", "tickets", "next", "ticket-<prefix>"]
  }
}
```

`new` runs that command directly and takes the decimal number from its last line.
Use `--offline` for local allocation when the coordinator is unavailable. Commit
ticket changes through your usual Git workflow.

## Install the skills in your agent

For Claude Code, run `/plugin marketplace add immediately-run/dibber` and then
`/plugin install dibber@dibber`. Recent versions also support
`/plugin install dibber --marketplace immediately-run/dibber`.

For Codex, add the repository as a plugin marketplace and install Dibber:

```sh
codex plugin marketplace add immediately-run/dibber
codex plugin add dibber@dibber
```

For opencode or Antigravity, use the cross-harness installer:

```sh
npx skills add immediately-run/dibber --global --agent opencode antigravity
```

Run `dibber init` inside a repository to set up its ticket store.

## Readers

[Baton's Markdown source](https://github.com/immediately-run/baton/blob/main/spec/BATON_SPEC/04-tickets-syncs-board.md#sec-4-2)
reads tickets to coordinate work. [Dibber Board](https://github.com/immediately-run/dibber-board/blob/main/src/components/roadmapLib.ts)
renders ticket stores as a wiki with a read-only board. See the [format's Readers section](SPEC.md#readers).

## Changing the format

By pull request against `SPEC.md`. A change that keeps every valid store valid amends the
current version; one that would not is a new version ([`SPEC.md`](SPEC.md#versions)).

## Licence

Apache License 2.0 — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
