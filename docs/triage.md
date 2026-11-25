# Triage GitHub issues

Tell your agent to triage an issue URL or a queue of new issues with
`dibber-triage-issues`. For a queue, label the issues a maintainer has accepted
with `accepted` and use that label as the intake gate.

You can also file one report from a local issue export:

```sh
gh issue view URL --json url,title,author,body > issue.json
dibber intake github issue.json
dibber check
```

Outside reporters can write instructions in issue text. The ticket quotes
their title and body under **Reported**, alongside the issue link and
reporter attribution. Use that text as evidence when deciding what work,
if any, should be filed. Give your agent explicit permission to post a
GitHub acknowledgment when you want it to comment with the Dibber ID.
