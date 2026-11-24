---
id: DIB-31
title: "DIB-31 — Orchestrator-assigned ids: a third value of the ids setting, where Dibber takes the id from the orchestrator"
status: available
description: In a repository Baton coordinates, the id is also the ticket's file name and only Baton may hand it out, but dibber new and the skills count ids from git. Add "orchestrator" as a third value of .dibber/config.json's ids setting, beside numeric and random (DIB-26). With it, Dibber accepts any id and always gets new ones from the orchestrator, today Baton.
depends_on: []
order: 31
tags: [spec, ids, tooling, skills]
project: wide-audience
---

**Brief:** from the owner, 2026-11-24: when Dibber works with Baton it must ask Baton for a ticket's id, because the Baton id is also the file's name. The skills don't know to look for Baton in a repository, or to use the Baton command-line tool for the next id. Then, the same day: the ticket id can be numeric, random, or orchestrator-assigned; when it is orchestrator-assigned, Dibber doesn't care what the value is, but it knows it must get it from the orchestrator. Baton is the only orchestrator that works with Dibber today, so in practice orchestrator means Baton.
**Spec:** amends R-DIB-4 and R-DIB-14.
**Depends on:** none.

Shares the `ids` setting with DIB-26: whichever lands first adds the key.

### Why

R-DIB-4 already says it: "Where a coordinator is in use, the number is the coordinator's to give:
git is never the counter." But nothing says how a reader knows that, so nothing acts on it:

- `dibber new` (`src/tickets.mjs`, `nextId`) always takes one more than the highest number in the
  store and on local branches.
- The `dibber-new-ticket` skill runs `dibber new`, or without it writes `tickets/<ID>.md` with
  "one more than the highest number in `tickets/`".
- The `dibber-work-ticket` skill mentions Baton only as something to add later, never as
  something that may already be in use.

Baton's number comes from its per-repository sequence `ticket-<prefix>` (BATON_SPEC R-BTN-199).
It is unique across concurrent branches, and its floor counts every open branch's head. A number
counted from git is unique only among the branches this checkout has. In Jira or Linear a
collision is two rows. Here the id is the file name, so a collision is two different tickets
writing the same `tickets/B-212.mdx`. Baton's sync refuses the duplicate id (R-BTN-74,
R-BTN-147), but only after the fact.

The id's shape is Baton's business, not Dibber's. Baton accepts legacy patterns of its own
(`R3-\d+[a-z]?\d*`) and per-prefix patterns (`prefixes` in `.baton/baton.json`). Dibber
re-checking them would make it a second authority on ids, which could disagree with the first.

### What to build

- **The setting (R-DIB-14, `config.schema.json`).** `ids` in `.dibber/config.json` takes one of
  three values: `numeric`, `random` (DIB-26) or `orchestrator`.
  - **The default:** `orchestrator` when the repository root holds `.baton/baton.json`, else
    `numeric`. That way baton, docs and fieldhouse, which have `.baton/` and no `.dibber/`, are
    right without editing them.
  - **One name for now.** `orchestrator` means Baton, the only orchestrator that works with
    Dibber today. The spec says so in one sentence. A key naming which orchestrator waits until
    there is a second one.
- **R-DIB-4 under `orchestrator`.** The id is whatever the orchestrator assigns. Dibber checks
  only what it needs to name the file and refer to the ticket: an id is
  `[A-Za-z0-9][A-Za-z0-9._-]*`, with no `/`, `:` or whitespace. It is never reused and never
  renamed, like every other id, and the file is named after it. The store's own
  `item.schema.json` (R-DIB-3) and the orchestrator narrow it further. `prefix` is optional
  under `orchestrator`, since the orchestrator holds it. Dibber never makes up an id in this
  mode: the Allocation paragraph's count and renumbering apply to `numeric` only.
  - `ticket.schema.json`'s `id` pattern widens to that file-safe form, and so does the local
    half of the qualified `<repository>:<id>` form. `dibber check` applies the numeric or random
    form for those two modes, where the schema cannot read the setting.
- **Getting an id from Baton.** `baton tickets new …` files the ticket and takes its id.
  `baton tickets next ticket-<prefix> --for <what>` prints an id for a filer who writes the
  file itself. That is `node cli/baton.mjs` in the baton repository, else `baton` or `npx`.
- **`dibber new` under `orchestrator`** refuses without writing, and names both Baton commands.
  `--id <ID>`, taken from the orchestrator, is accepted: the file is written with Dibber's body,
  under the store's id check. `dibber new` never falls back to counting. If Baton can't be
  reached, Baton's own `--offline` fallback is the person's call, not Dibber's.
- **Claims follow the ids.** A store whose ids come from an orchestrator is one the
  orchestrator coordinates, so under `orchestrator`, `dibber claim`, `set` and `done` refuse
  and name `baton tickets claim|set|done`. Baton holds the claims, and a frontmatter claim
  written past it is the same collision as a counted id.
- **The skills.** `dibber-new-ticket` and `dibber-work-ticket` read the `ids` setting first,
  including its default from `.baton/baton.json`. Under `orchestrator` they file, claim, release
  and close through `baton tickets …`, and take the body's shape from the repository's own
  ticket-writing page and CLAUDE.md. Baton's filing needs `### Trust`, `### Invariants` and a
  project, and lands as a PR on `baton-ticket/<id>`. The "Without the command-line tool"
  sections stop telling an agent to count files under `orchestrator`. If Baton can't be reached,
  the agent says so and asks the person.
- **`dibber init`** writes `"ids": "orchestrator"` when `.baton/baton.json` is present.
  **`dibber check`** warns when `.baton/baton.json` is present and `ids` says otherwise.
  Under `orchestrator`, it also warns when `.dibber/config.json`'s `store` or `prefix` disagrees
  with `.baton/baton.json`'s `items` or `ticket_prefix`.

### Exit criteria

- [ ] SPEC.md R-DIB-4 and R-DIB-14 define the three values, the default, and `orchestrator` meaning Baton; the Versions note says it amends Dibber 1 in place (no valid store becomes invalid)
- [ ] `config.schema.json` accepts `ids` with exactly the three values; `ticket.schema.json` accepts a file-safe id such as `R3-274e1` or `ABC-x.1`
- [ ] conformance: a valid store with `ids: orchestrator` and ids no numeric or random form accepts passes; an invalid one whose id holds a `/` fails on R-DIB-4
- [ ] a test: in a fixture with `.baton/baton.json` and no `.dibber/`, `dibber new` exits non-zero without writing a file, and its message names `baton tickets new` and `baton tickets next`
- [ ] a test: `dibber new --id B-9` in that fixture writes `tickets/B-9.md`
- [ ] a test: `dibber claim` in that fixture refuses and names `baton tickets claim`
- [ ] a test: `dibber check` warns when `.baton/baton.json` is present and `.dibber/config.json` says `"ids": "numeric"`
- [ ] `grep -n "orchestrator" skills/dibber-new-ticket/SKILL.md skills/dibber-work-ticket/SKILL.md` finds the step in both
- [ ] `npm test` passes, and `dibber check` passes on the baton, docs and fieldhouse stores, apart from the errors DIB-12 already lists

## Status

_filed 2026-11-24._

_2026-11-24: redesigned from the owner's direction. Instead of Dibber detecting Baton, `.dibber/config.json`'s `ids` takes three values: numeric, random or orchestrator. Under orchestrator Dibber accepts any file-safe id and takes new ones from Baton. `.baton/baton.json` now only sets the default._
