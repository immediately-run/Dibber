# Your first ticket in ten minutes

A ticket is a Markdown file that records a piece of work. It gives you and your
coding agent the same brief before the code changes. You can review the plan,
implementation, and record of completion together in Git.

If your repository has no ticket store yet, follow the [installation guide](install.md).

## Write one ticket

Include three things:

1. **What to build.** Say what someone should be able to do when the ticket is done.
2. **Why it matters.** Describe who needs the change and what gets in their way today.
3. **How you will know it is done.** Give a test, a command, or a concrete result
   someone can verify.

For example, ask your agent to file a ticket to keep the chosen theme on reload.
Explain that users currently have to select their theme again. Ask for a test
that changes the theme, reloads the page, and checks the result.

## Start simple

- **`available`** means the ticket is open for someone to take. If it has
  prerequisites, it becomes ready when those tickets are done or superseded.
- **`in-progress`** means someone has started. Ask your agent to work the ticket,
  or run `dibber claim APP-1`.
- **`done`** means the exit criteria passed. Use `dibber done APP-1` or ask your
  agent to close it. Keep the ticket file in the same place and commit it with
  the work.

Use `dibber list --ready` to see which tickets you can pick up. Replace `APP-1`
with the ID shown on your board.

When you need a finer distinction, use `in-review` for work awaiting feedback
and `deprioritized` for work you want to keep open but take out of the ready queue.
Use `deferred` to close work you might revisit, `superseded` when another ticket
takes over the work, and `withdrawn` when the request is canceled.

## Terms from other trackers

| What you may know from Jira, Linear, or GitHub Issues | Dibber |
| --- | --- |
| Backlog, To Do, Todo, Open | `available` |
| In Progress | `in-progress` |
| In Review | `in-review` |
| Done, Completed, Closed as completed | `done` |
| Canceled, Won't Do, Closed as not planned | `withdrawn` |
| Duplicate with a replacement | `superseded`; link to the replacement |
| Epic or parent issue | `parent` on each child |
| Blocked by | `depends_on` |
| Labels | `tags` |
| Project or milestone | `project` |
| Assignee | `assignee` records who says they are working on it. The name is advisory. |
| Issue type | Optional `type` with values `task`, `bug`, `feature`, `epic`, and `chore`. |
| Priority | A store can define its own `priority`. Use `order` to pick among ready tickets, with lower numbers first. |
| Estimate | A store can define an estimate in its own `item.schema.json`. |

## Dibber alone, or with Baton

Dibber is enough when you and your coding agent work on your machine. Add a
coordinator such as [Baton](https://github.com/immediately-run/baton) when
several agents work at once, a team shares the queue, or work goes to several
model providers. Baton coordinates claims, and the tickets stay in the same format.

See the [Dibber specification](../SPEC.md) for the complete format.
