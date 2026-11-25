# Dibber — the git-native ticket format

**Version:** Dibber 1 · **Status:** current

**Dibber** is a way of keeping tickets in a git repository: one Markdown file per ticket, its
frontmatter the ticket's fields, its body the record of the work, and a closed ticket kept where
it is with a status that says so. It is a format, not a product: no server, no database and no tool is needed to read or
write it, and a repository that uses no coordinator at all can keep its tickets this way.

It is named for the orienteer's dibber, the electronic punch a runner carries from control to
control: the ticket travels the course with the work and records what was done at each leg.

**What it is not.** Dibber holds what the work is. It holds no coordination state: who holds a
ticket, where it stands in a workflow, how many times a step ran. A coordinator that tracks those
keeps them itself ([Coordination state](#coordination-state)).

**How to read this page.** The rules are numbered `R-DIB-n` and cited by id; an id is never
reused. The page states the current version only. Tools that read the format are listed under
[Readers](#readers); none of them owns it.

## Dibber alone, or with a coordinator

Dibber alone is enough for one person driving a coding agent on their own machine: one writer
at a time, with the person as the only scheduler. Several runners, several people, or a more complex LLM provider setup (routing work across models or
providers, budgets, retries) need a coordinator as well, such as
[Baton](https://github.com/immediately-run/baton). The coordinator allocates ids, holds claims
and runs the work, and the tickets stay Dibber: moving from one setup to the other changes no
ticket file.

## 1. The store

- **R-DIB-1 (a folder of files, one per ticket).** A Dibber store is one folder in a git
  repository: `tickets/` by convention, or the folder the repository's settings name
  ([R-DIB-14](#1-the-store)).
  Every `*.md` or `*.mdx` file under it, at any depth, whose frontmatter carries `id` and
  `status` and omits `page` is a ticket. A page may give its role with `page` (`project`,
  `goal`, `doc`, `view`, and so on). An entry with an `id` must have either a ticket's
  `status` or a page marker. A
  ticket is one file, named after its id: `<id>.md`, or `<id>.mdx` (read alike) in a store
  rendered as MDX ([R-DIB-13](#7-a-store-that-is-also-a-wiki)). Plain `.md` is the default,
  since a stray `<` or `{` in prose does not compile as MDX.
- **R-DIB-2 (closed in place, never deleted).** A ticket's file never moves: closing it changes
  its `status` ([R-DIB-6](#3-frontmatter)), not its path. A link to a ticket file, from code, a
  commit, a pull request or another page, keeps working for as long as the repository does. A
  ticket is never deleted either: the store is the record of what was done and what was dropped.
  Whether a ticket is closed is read from its `status` alone. A store may still hold an
  `archive/` folder, from before this rule or from a tool that keeps one; readers treat it like
  any other folder, and nothing is moved into it.
- **R-DIB-3 (the schema).** Every ticket's frontmatter satisfies [`ticket.schema.json`](ticket.schema.json),
  this format's schema. A store may also carry its own `item.schema.json`, a stricter shape of
  its own (more required keys, its id pattern, keys of its own), which every ticket in it must
  satisfy as well.
- **R-DIB-14 (the repository's settings).** A repository may keep Dibber's settings in
  `.dibber/config.json` at its root, satisfying [`config.schema.json`](config.schema.json):
  `store`, the store's folder relative to the root (default `tickets`), and `prefix`, the id
  prefix ([R-DIB-4](#2-ids)). A reader takes both from there when the file exists. Without it,
  the store is `tickets/` and the prefix is the one the store's ids share. A coordinator's own
  settings may name them too, but never disagree with `.dibber/config.json`. `.dibber/` holds
  Dibber's per-repository files, and a reader ignores any file there and any key in
  `config.json` that it does not know.

## 2. Ids

- **R-DIB-4 (ids are never reused).** An id has a prefix of letters and digits starting
  with a letter, a dash, and either a decimal number or at least four lowercase base-36
  characters. An id is never reused or renamed, regardless of status. Readers also accept
  legacy split ids such as `R3-51a` and `R3-274e1`. Writers do not allocate split ids.
  - **Allocation.** Set `ids` in `.dibber/config.json` to `random` for random suffixes.
    They are checked against the store and known branches and need no renumbering.
    The default, `numeric`, uses the next number above the highest taken across the store
    and known branches when writing without a coordinator. When a coordinator is in use,
    it allocates the number. If a numeric collision gets through, the second to merge
    renumbers and updates every reference and header that names the old id.
  - **Coordinator.** A trusted repository may configure `coordinator.next` in
    `.dibber/config.json` as an executable followed by its arguments. The writer runs it
    from the repository root, expands `<prefix>` in each argument, and takes the decimal
    number from the final line of stdout. An explicit offline mode uses local allocation.
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
  | `depends_on` | a list of ids, local or qualified | tickets this one waits for: it is ready only once each is done or superseded ([R-DIB-8](#4-relations)) |
  | `parent` | a local id | the ticket this one is a child of ([R-DIB-8](#4-relations)) |
  | `order` | a number | rank among ready tickets, lower first |
  | `type` | `task`, `bug`, `feature`, `epic`, or `chore` | the kind of work |
  | `tags` | a list of words | free labels ([R-DIB-9](#5-tags-and-projects)) |
  | `project` | a project page's name | the project the ticket belongs with ([R-DIB-10](#5-tags-and-projects)) |
  | `repos` | a list of repositories | the other repositories its work changes, `owner/name` or a name the reader maps |
  | `prs` | a list of URLs | the pull requests that carry its work |
  | `assignee` | a name or handle | who says they are working on it: advisory, never a lock ([Coordination state](#coordination-state)) |
  | `updated` | a date | when the ticket last changed in substance |
  | `not_before` | a date or time | the earliest it should be started |

  A store can define its own `priority` in `item.schema.json`. The shared queue rank is `order`.

  **Other keys.** A key that only one tool gives a meaning to (a coordinator's workflow name, a
  wiki's layout) is that tool's, documented in its own specification. Dibber does not list them,
  and a reader that does not know one ignores it.

- **R-DIB-6 (status).** `status` is the store's word on where the ticket stands, for people and
  for readers that keep no state of their own. Importers translate source tracker statuses to
  these canonical values. Its values, in three classes:

  | Class | Values |
  |---|---|
  | live | `available` (ready to be taken), `in-progress`, `in-review`, `deprioritized` |
  | closed, done | `done` |
  | closed, withdrawn | `withdrawn`, `superseded` (another ticket replaces it), `deferred` (not now, maybe never) |

  A coordinator that tracks a ticket's progress itself may weigh `status` as evidence rather than
  take it as its own record; how it does is the coordinator's to specify.

## 4. Relations

- **R-DIB-7 (one file, one writer).** A change to a ticket changes its own file alone:
  separate tickets never share a write target, so any number
  of tickets can be worked in parallel without conflict. A relation that would need a second
  file written — a ticket's list of children, a reverse dependency — is derived by reading, never
  stored, except as the body's courtesy line `**Used by:**` ([R-DIB-11](#6-the-body)).
- **R-DIB-8 (dependencies and children).** `depends_on` is the ticket's whole list of waits on
  other tickets: a dependency written only in prose is one no reader can see. A ticket is ready
  when it is `available` and every ticket it depends on is `done` or `superseded`: a superseded
  ticket's work goes on in the ticket that replaced it, so it no longer holds anyone. A
  `withdrawn` or `deferred` dependency still holds the ticket, since nothing did that work; drop
  it from `depends_on`, or depend on what replaced it. A dependency on
  another repository's ticket is a qualified id; `parent` is always local. A ticket is a child of
  the ticket its `parent` names: filing children is how a large ticket is split. Dependencies form
  no cycle.

## 5. Tags and projects

- **R-DIB-9 (tags).** Tags are free words. A reader may give some of them a meaning of its own,
  documented in its specification; every other tag is the repository's.
- **R-DIB-10 (projects).** A project is a page whose frontmatter says `page: project`, in the
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
  layout, a site descriptor, project pages and views such as a board. Readers identify
  these pages by [R-DIB-1](#1-the-store).

## Coordination state

Coordination state is not kept in a Dibber ticket: who holds a ticket and for how long, where it
stands in a workflow, how many times each step ran, approvals and attestations. A coordinator
that tracks them keeps them itself, may show them to people, and never reads them back from a
ticket file as its record. A ticket file a coordinator writes such state into still reads as
Dibber — readers ignore keys they do not know — but the state there is that coordinator's own
concern. A store whose claims must be exclusive has outgrown
[Dibber alone](#dibber-alone-or-with-a-coordinator).

**`assignee` is not a hold.** A person working without a coordinator, usually alone, still wants
to see who said they would do a ticket, so `assignee` records it ([R-DIB-5](#3-frontmatter)). It
is advisory: it stops no one else taking the ticket, two branches can each write a different
name, and a coordinator never reads it as its record of who holds a ticket. A coordinator may
write it, as a courtesy to people reading the file, but what it holds is the coordinator's own
record.

## Versions

During active development, this specification changes in place. A change that breaks
existing stores ships with a `dibber migrate` step.

Run `dibber migrate` to replace old page markers such as `kind: project` on files without
a status. The migration changes them to `page: project`. It moves a ticket's custom
`type` value outside the standard vocabulary to `legacy_type`. If the store schema
requires a custom `type`, update it to describe `legacy_type` before migrating.
Ticket paths and Markdown bodies stay in place.

## Readers

- **[Baton](https://github.com/immediately-run/baton/blob/main/spec/BATON_SPEC/04-tickets-syncs-board.md#sec-4-2)**
  coordinates work and imports ticket metadata through its default Markdown source.
- **[Dibber Board](https://github.com/immediately-run/dibber-board/blob/main/src/components/roadmapLib.ts)**
  reads ticket frontmatter and renders a read-only board, ticket views and project views
  on the [Grove wiki shell](https://github.com/immediately-run/grove/blob/main/src/GroveWiki.tsx).
  Edits go through the repository.

[Fieldhouse's ticket schema](https://github.com/immediately-run/fieldhouse/blob/main/tickets/item.schema.json)
shows a project using store-specific ticket fields.
