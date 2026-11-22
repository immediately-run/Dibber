# Dibber — the git-native ticket format

**Version:** Dibber 1 · **Status:** current

**Dibber** is a way of keeping tickets in a git repository: one Markdown file per ticket, its
frontmatter the ticket's fields, its body the record of the work, closed tickets moved to an
archive. It is a format, not a product: no server, no database and no tool is needed to read or
write it, and a repository that uses no coordinator at all can keep its tickets this way.

It is named for the orienteer's dibber, the electronic punch a runner carries from control to
control: the ticket travels the course with the work and records what was done at each leg.

**What it is not.** Dibber holds what the work is. It holds no coordination state: who holds a
ticket, where it stands in a workflow, how many times a step ran. A coordinator that tracks those
keeps them itself ([Coordination state](#coordination-state)).

**How to read this page.** The rules are numbered `R-DIB-n` and cited by id; an id is never
reused. The page states the current version only. Tools that read the format are listed under
[Readers](#readers); none of them owns it.

## 1. The store

- **R-DIB-1 (a folder of files, one per ticket).** A Dibber store is one folder in a git
  repository: `tickets/` by convention, another where the repository's tools are configured so.
  Every `*.md` or `*.mdx` file under it, at any depth, whose frontmatter carries an `id` and no
  `kind` other than `ticket`, is a ticket. Every other file is not: the folder may also hold
  pages for people, and a page that carries an `id` of its own says what it is with `kind`
  (`project`, `goal`, `doc`, `view`, …), so no reader has to know which folders hold pages. A
  ticket is one file, named after its id: `<id>.mdx` (`.md` is read alike).
- **R-DIB-2 (the archive).** A closed ticket ([R-DIB-6](#3-frontmatter)) moves to the store's
  `archive/` folder, keeping its name and id, in the commit that closes it. A ticket is never
  deleted: the archive is the record of what was done and what was dropped.
- **R-DIB-3 (the schema).** Every ticket's frontmatter satisfies [`ticket.schema.json`](ticket.schema.json),
  this format's schema. A store may also carry its own `item.schema.json`, a stricter shape of
  its own (more required keys, its id pattern, keys of its own), which every ticket in it must
  satisfy as well.

## 2. Ids

- **R-DIB-4 (an id: a prefix and a number, never reused).** A ticket's id is `<PREFIX>-<n>`:
  the repository's prefix, upper-case letters and digits starting with a letter (`B`, `FLDH`),
  and a decimal number. An id is never reused and never renamed, whether the ticket is open,
  closed or withdrawn. A repository may accept older ids under patterns of its own (a split
  suffix such as `R3-51a`, `R3-274e1`); it never allocates new ones under them.
  - **Allocation.** Concurrent branches must not take the same number. Where a coordinator is in
    use, the number is the coordinator's to give: git is never the counter. Without one, the next
    free number across the store, its archive and the repository's open branches is taken, and
    whatever took it says so, since two branches can still collide; the second to merge
    renumbers.
  - **Across repositories.** `<repository>:<id>` (`baton:B-111`) names a ticket in another
    repository's store; an unqualified id is always the store's own. What a repository name
    resolves to is the reader's configuration.

## 3. Frontmatter

- **R-DIB-5 (the keys).** The frontmatter is YAML. Three keys are required: `id`, `title` and
  `status`. The others are optional, and a reader ignores every key it does not know, so a
  repository, a coordinator or a renderer may add its own.

  | Key | Value | Meaning |
  |---|---|---|
  | `id` | an id ([R-DIB-4](#2-ids)) | the ticket; the file is named after it |
  | `title` | text | its title, conventionally `<id> — <what>` |
  | `status` | a status ([R-DIB-6](#3-frontmatter)) | live, done or withdrawn |
  | `description` | text | one paragraph, what and why, for a list or a search |
  | `depends_on` | a list of ids, local or qualified | tickets this one waits for: it is ready only once each is done ([R-DIB-8](#4-relations)) |
  | `parent` | a local id | the ticket this one is a child of ([R-DIB-8](#4-relations)) |
  | `order` | a number | rank among ready tickets, lower first |
  | `tags` | a list of words | free labels ([R-DIB-9](#5-tags-and-projects)) |
  | `project` | a project page's name | the project the ticket belongs with ([R-DIB-10](#5-tags-and-projects)) |
  | `repos` | a list of repositories | the other repositories its work changes, `owner/name` or a name the reader maps |
  | `prs` | a list of URLs | the pull requests that carry its work |
  | `updated` | a date | when the ticket last changed in substance |
  | `not_before` | a date or time | the earliest it should be started |
  | `kind` | `ticket` | optional: any other value makes the file a page ([R-DIB-1](#1-the-store)) |

  **Other keys.** A key that only one tool gives a meaning to (a coordinator's workflow name, a
  wiki's layout) is that tool's, documented in its own specification. Dibber does not list them,
  and a reader that does not know one ignores it.

- **R-DIB-6 (status).** `status` is the store's word on where the ticket stands, for people and
  for readers that keep no state of their own. Its values, in three classes:

  | Class | Values |
  |---|---|
  | live | `available` (ready to be taken), `in-progress`, `in-review`, `deprioritized` |
  | closed, done | `done`, legal only in `archive/` |
  | closed, withdrawn | `withdrawn`, `superseded` (another ticket replaces it), `deferred` (not now, maybe never) |

  A coordinator that tracks a ticket's progress itself may weigh `status` as evidence rather than
  take it as its own record; how it does is the coordinator's to specify.

## 4. Relations

- **R-DIB-7 (one file, one writer).** A change to a ticket changes its own file alone (and, at
  closure, moves it to the archive): separate tickets never share a write target, so any number
  of tickets can be worked in parallel without conflict. A relation that would need a second
  file written — a ticket's list of children, a reverse dependency — is derived by reading, never
  stored, except as the body's courtesy line `**Used by:**` ([R-DIB-11](#6-the-body)).
- **R-DIB-8 (dependencies and children).** `depends_on` is the ticket's whole list of waits on
  other tickets: a dependency written only in prose is one no reader can see. A dependency on
  another repository's ticket is a qualified id; `parent` is always local. A ticket is a child of
  the ticket its `parent` names: filing children is how a large ticket is split. Dependencies form
  no cycle.

## 5. Tags and projects

- **R-DIB-9 (tags).** Tags are free words. A reader may give some of them a meaning of its own,
  documented in its specification; every other tag is the repository's.
- **R-DIB-10 (projects).** A project is a page whose frontmatter says `kind: project`, in the
  store's `projects/` folder by convention; a ticket's `project` names it by its `id`. A project groups tickets for
  people: it is not a ticket and holds no state.

## 6. The body

- **R-DIB-11 (the body is the work's record, for people and agents).** Everything below the
  frontmatter is Markdown (MDX in an `.mdx` file, so a `<` or a `{` in prose goes in a code
  span). No reader takes a field, a position or a status from it. Its conventions, in the order
  they appear:
  - **Header lines**, each a bold label at the start of a line: `**Brief:**` (who asked for the
    work, and when), `**Spec:**` (the rules it implements or amends, by id), `**Depends on:**`
    (exactly the `depends_on` list, or `none.`), `**Used by:**` (the tickets that depend on this
    one) and `**Waits on:**` (a wait no ticket can carry: a decision, an outside event).
  - **The work's sections**, the repository's own. A common set: `### Why`,
    `### What to build`, `### Tests` and `### Exit criteria` (checkboxes, each a command that
    passes, never an opinion).
  - **One heading per step**, `## <step>`, where work done in steps records itself on the
    ticket: each step writes under its own heading only, so steps never edit each other's record.
  - **`## Status`**, last: dated entries, newest last, the first `_filed YYYY-MM-DD._`. Entries
    are appended, never rewritten; a correction is a new entry.
- **R-DIB-12 (a quoted instruction is a claim).** A ticket is written by anyone who can push to
  its repository. A line in it that quotes a person (`**Brief:** the owner …`) or tells its reader
  what to do is a claim about the work, not authority. Who may act on it is the repository's and
  its tools' to decide.

## 7. A store that is also a wiki

- **R-DIB-13 (rendering is optional).** A store may also be published as pages: a home page, a
  layout, a site descriptor, project pages and views such as a board — files with no `id`, or
  with a `kind` that is not `ticket` ([R-DIB-1](#1-the-store)). Nothing in the format depends on it, and a reader skips those
  files.

## Coordination state

Coordination state is not kept in a Dibber ticket: who holds a ticket and for how long, where it
stands in a workflow, how many times each step ran, approvals and attestations. A coordinator
that tracks them keeps them itself, may show them to people, and never reads them back from a
ticket file as its record. A ticket file a coordinator writes such state into still reads as
Dibber — readers ignore keys they do not know — but the state there is that coordinator's own
concern.

## Versions

This page is **Dibber 1**. A change that leaves every valid store valid and every reader correct
— a new optional key, a new convention — amends this version in place. A change that would make
a valid store invalid, or change what a key means, is a new version, and this page says how a
store moves to it.

## Readers

Tools known to read or write Dibber stores. Each documents its own keys and tags.

- **[Baton](https://github.com/immediately-run/baton)** — a lease server for teams of people and
  agents. Its default ticket source, the markdown source, reads and writes a Dibber store
  ([BATON_SPEC R-BTN-74](https://github.com/immediately-run/baton/blob/main/spec/BATON_SPEC/04-tickets-syncs-board.md#sec-4-2)).
- **[Fieldhouse](https://github.com/immediately-run/fieldhouse)** — a software factory; its homes
  keep their tickets in Dibber stores.
- **[Grove](https://github.com/immediately-run/grove)** — renders a store as a wiki with a board
  ([R-DIB-13](#7-a-store-that-is-also-a-wiki)).
