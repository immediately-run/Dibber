---
id: DIB-31
title: "DIB-31 — In a repository Baton coordinates, take ids (and claims) from Baton, never from Dibber's scan"
status: available
description: R-DIB-4 says that where a coordinator is in use the id is the coordinator's to give, but neither the dibber command nor the skills can tell that one is in use. In a Baton repository they scan git for the next number, and since the id is also the file's name, two filers on two branches write the same file. Detect Baton and ask it.
depends_on: []
order: 31
tags: [spec, tooling, skills]
project: wide-audience
---

**Brief:** from the owner, 2026-11-24: when Dibber works with Baton it must ask Baton for a ticket's id, because the Baton id is also the file's name. The skills don't know to look for Baton in a repository, or to use the Baton command-line tool for the next id.
**Spec:** amends R-DIB-4 (Allocation) and R-DIB-14.
**Depends on:** none.

### Why

R-DIB-4 already says it: "Where a coordinator is in use, the number is the coordinator's to give:
git is never the counter." Nothing says how a reader knows a coordinator is in use, so nothing
acts on it:

- `dibber new` (`src/tickets.mjs`, `nextId`) always takes one more than the highest number in the
  store and on local branches.
- The `dibber-new-ticket` skill tells an agent to run `dibber new`, or without it, to write
  `tickets/<ID>.md` with "one more than the highest number in `tickets/`".
- The `dibber-work-ticket` skill claims with `dibber claim`, a frontmatter note. It mentions Baton
  only as something to add later, never as something that may already be here.

In a repository Baton coordinates, such as baton, fieldhouse, docs or hq, that number comes from
git. Baton's own number comes from its per-repository sequence, `ticket-<prefix>` (BATON_SPEC
R-BTN-199). It is unique across concurrent branches, and its floor counts every open branch's
head, so it never reissues a number git holds. A Dibber-scanned number is unique only among the
branches this checkout has. In Jira or Linear a collision is two rows. Here the id is the file
name, so a collision is two different tickets writing `tickets/B-212.mdx`. The second PR
conflicts, or worse, merges as a rewrite. Baton's sync refuses the duplicate id
(R-BTN-74, R-BTN-147), but only after the fact. The same goes for claims: in a Baton repository
`dibber claim` writes `in-progress` while Baton, which holds the real lease, still offers the
ticket.

### What to build

- **Detection (spec, R-DIB-14).** A repository whose root holds `.baton/baton.json` is
  coordinated by Baton. Its `items` names the store and its `ticket_prefix` the prefix, and
  `.dibber/config.json`, when present, must agree (R-DIB-14 already forbids disagreeing). Name
  Baton's file directly instead of adding a `coordinator` key to `.dibber/config.json`: a second
  place to say it would be one more thing that can disagree. Another coordinator gets its own
  line when one exists.
- **R-DIB-4 Allocation** says how to ask: in a Baton repository, the id comes from
  `baton tickets new` (files the ticket and takes the id) or `baton tickets next ticket-<prefix>
  --for <what>` (prints one), never from the scan.
- **`dibber new`** in a Baton repository refuses and names the command to run instead,
  `baton tickets new …` or `baton tickets next ticket-<prefix>`. It never falls back to the scan
  on its own. Baton's filing also writes its own conventional body (`### Trust`,
  `### Invariants`, a required project) and lands as a PR on `baton-ticket/<id>`, so Dibber
  should not try to reproduce it. An explicit `--id <ID>` taken from Baton is accepted, so a
  filer who got the number from Baton can still use Dibber's body. `dibber claim`, `set` and
  `done` likewise refuse with the `baton tickets claim|set|done` equivalent.
- **The skills.** `dibber-new-ticket` and `dibber-work-ticket` gain a first step: look for
  `.baton/baton.json`. If it is there, file, claim, release and close through
  `baton tickets …` (`node cli/baton.mjs` in the baton repository itself, else `baton` or
  `npx`), and read the repository's own ticket-writing page and CLAUDE.md for the body it
  expects. The "Without the command-line tool" sections stop telling an agent to count files
  when Baton is present. If Baton can't be reached, the agent says so and asks the user, rather
  than scanning: Baton's own `--offline` fallback is the user's call.
- **`dibber check`** warns when `.dibber/config.json` and `.baton/baton.json` disagree on store
  or prefix.

### Exit criteria

- [ ] SPEC.md R-DIB-4 and R-DIB-14 name `.baton/baton.json` as the coordinator signal and Baton's sequence as the id's source; the Versions note says it amends Dibber 1 in place (no store changes validity)
- [ ] a test: in a fixture repository with `.baton/baton.json`, `dibber new` exits non-zero without writing a file, and its message names `baton tickets new`
- [ ] a test: `dibber new --id B-9` in that fixture writes `tickets/B-9.md`; without `.baton/baton.json`, `--id` is refused unless the number is free
- [ ] a test: `dibber claim` in that fixture refuses and names `baton tickets claim`
- [ ] a test: `dibber check` warns when `.dibber/config.json`'s prefix differs from `.baton/baton.json`'s `ticket_prefix`
- [ ] `grep -n "baton.json" skills/dibber-new-ticket/SKILL.md skills/dibber-work-ticket/SKILL.md` finds the detection step in both

## Status

_filed 2026-11-24._
