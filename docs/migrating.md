# Move tickets into Dibber

Initialize Dibber in your repository and work on a branch. Export the issues
you want to move, including their parents and blocking issues. Dibber reads
local files and allocates IDs in the destination store. See the
[tracker terminology table](guide.md#terms-from-other-trackers) for the mapping.
Imported descriptions and comments stay visibly quoted in each ticket.

## GitHub Issues

Export open and closed issues with the GitHub CLI. Set the limit high enough
to include all the issues you want to migrate.

```sh
gh issue list --state all --limit 1000 \
  --json number,title,body,url,state,stateReason,labels,assignees,milestone,parent,subIssues,blockedBy,comments \
  > issues.json
dibber import github issues.json
```

A JSON list from the GitHub REST Issues endpoint also works. Use the GitHub
CLI export for relations and comment bodies.

## Linear

Export issues as CSV from a Linear issue view or from your workspace's
Export data settings. Supply the workspace URL so rows can link back to
their original issue. For comments and blocking issues, use a JSON export
from the Linear API with `identifier`, `url`, `state`, `parent`, `blockedBy`, and
`comments` in the issue records. Use lists or GraphQL `nodes` for relation fields.

```sh
dibber import linear issues.csv --source-url https://linear.app/example
```

## Jira

Search for the issues to move and choose **Export CSV (all fields)**.
Include the parent and inward **Blocks** columns for relationships. The
all-fields export includes comments in repeated columns.

```sh
dibber import jira issues.csv --source-url https://example.atlassian.net
```

## Check and switch

Run `dibber check`, review the new files, and commit them with the migration.
Each ticket links to its original issue. Imported closed issues remain closed.
Keep the old tracker available as a read-only archive and point contributors
to the Dibber store for new work. Attachment files and custom workflow
configuration stay in the original tracker.
