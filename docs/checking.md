# Checking tickets on every push

`dibber check` reads every ticket in the store and reports anything that breaks the
[Dibber spec](../SPEC.md): a missing title, an unknown status, a file not named after its id,
a dependency on a ticket that doesn't exist. Each problem names the rule, the file
and what to do.

```
$ npx -y @immediately-run/dibber check
✗ tickets/APP-7.md: R-DIB-6 — `status` must be one of: available, in-progress, …
1 problem in tickets/ (12 tickets).
```

It exits 1 on a problem, so it works as a gate. Warnings (`!`) are conventions, such as the
`**Depends on:**` line matching `depends_on`; they fail only with `--strict`.

## GitHub Actions

Add a workflow such as `.github/workflows/tickets.yml`:

```yaml
name: tickets
on: [push, pull_request]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: immediately-run/dibber@main   # pin a release tag or commit once there is one
```

Inputs: `root` (default `.`) and `strict` (default `false`).

## pre-commit

With [pre-commit](https://pre-commit.com), add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/immediately-run/dibber
    rev: main   # pin a release tag or commit once there is one
    hooks:
      - id: dibber-check
```

## Your own rules

A store can add stricter rules of its own, such as required keys or allowed values, in
`tickets/item.schema.json`. `dibber check` applies it to every ticket (R-DIB-3).
