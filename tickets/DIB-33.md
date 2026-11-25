---
id: DIB-33
title: "DIB-33 — Everything a coordinator's ticket writes needs: ids from the coordinator, a full ticket on new, and a reader's own keys on set"
status: in-review
depends_on: []
order: 33
tags: [cli, coordinator]
assignee: Peter Neumark
---

**Brief:** from the owner, 2026-11-24: Baton's CLI should not write ticket files; that is Dibber's job. Baton keeps allocating ids (`baton tickets next`) and checking its reading of a store (`baton tickets check`). Everything that creates or changes a ticket file goes through `dibber`, both the commands people and agents run and the Baton course legs that file tickets or mark them.
**Depends on:** none.
**Used by:** Baton's half, `baton:B-326` ([baton#409](https://github.com/immediately-run/baton/pull/409)), which retires `baton tickets new|claim|set|done` once this lands.

### Why

What `baton tickets new|claim|set|done` do today and `dibber` cannot:

- **Ids from the coordinator.** R-DIB-4 already says that where a coordinator is in use, the number is the coordinator's to give. Baton gives it: `POST /v1/repositories/{repository}/sequences/ticket-<prefix>/next` (BATON_SPEC R-BTN-199), also printed by `baton tickets next ticket-<prefix>`. `dibber new` only scans the store and the branches.
- **A whole ticket.** Baton's filings carry a body written in full (`--body-file`) and keys Dibber does not name but a stricter schema may (R-DIB-3's extensions): `description`, `repos`, `tier`, `course`, `topics`, `owns`, `prs`. `dibber new` builds its body from `--why`, `--what` and `--criterion`, and writes only its own keys.
- **A reader's own keys.** Baton's `create-spec` legs record a marker in the ticket's frontmatter when the owner's conversation begins and when a round is answered (BATON_SPEC R-BTN-83, `closeTicket` in Baton's `src/defaults/ticket-state.ts`). `dibber set` changes only `status`.

### What to build

1. **`dibber new --id <ID>`, and a coordinator in the config.**
   - `--id` files the ticket under an id someone else allocated. It is refused if the id is taken in the store or on any branch, or does not carry the store's prefix.
   - `.dibber/config.json` gains an optional `"coordinator": {"next": ["<argv>", …]}`: a command whose stdout's last line is the next number. Baton's is `["npx", "@immediately-run/baton", "tickets", "next", "ticket-<prefix>"]`. With a coordinator set, `new` takes its number from it. When the command fails, `new` refuses, unless `--offline` is passed, in which case it uses the scan and says so. Git is never the counter where a coordinator is in use (R-DIB-4).
2. **`dibber new --body-file <path>` and `--field key=value` (repeatable).** The body is written as given. A `## Status` with a `_filed <date>._` line is appended when the body has none. A field must be a key the store's schema allows. A value that parses as YAML (a list, a map) is written as that value. Frontmatter is written in the store's key order.
3. **`dibber set <id> --field key=value`**, with or without a status. It writes one frontmatter key a reader owns, Baton's markers included, and refuses a key Dibber defines (`id`, `status`) except through its own options.
4. **No commits, as today.** `dibber` writes the working tree and the caller commits. A leg or a session that files a ticket commits and pushes it itself, by its own route. Baton's courses do this on a `baton-ticket/<id>` branch.
5. **The spec and the skills.** Amend R-DIB-4 (the coordinator's command) and the CLI section of `README.md`. Teach the create skill `--id`, `--body-file` and the coordinator.

### Exit criteria

- [x] `dibber new` with a coordinator takes its id from the command, refuses when it fails, and falls back to the scan only with `--offline`. Tested with a fake coordinator.
- [x] `--id`, `--body-file` and `--field` on `new`, and `--field` on `set`, write what they say. Unknown or Dibber-owned keys are refused. Tested against the conformance stores.
- [ ] `dibber check` green on this store; published in the next release.

## Status

_filed 2026-11-24._

_2026-11-25: claimed by Peter Neumark._

_2026-11-25: Implementation verified with npm test and dibber check. Publication remains for the next release._
