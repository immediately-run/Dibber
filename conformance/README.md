# Conformance fixtures

Small example stores that show what Dibber 1 accepts and what it rejects. A tool that reads or
writes Dibber runs them to show it reads the format the way the spec says.

Each folder under `valid/` and `invalid/` is a repository root: a store (`tickets/`, or the
folder its `.dibber/config.json` names) and an `expect.json`.

- `valid/<name>/expect.json` is `{ "valid": true }`. A reader accepts the store and finds
  every ticket in it.
- `invalid/<name>/expect.json` is `{ "valid": false, "rule": "R-DIB-n", "file": "<path>" }`. A
  validator rejects the store, naming that rule against that file (relative to the fixture's
  root). Each invalid fixture breaks exactly one rule.

`valid/every-key/` uses every status in `ticket.schema.json` and every key in R-DIB-5 at least
once, with a project page, a parent and a qualified dependency. It is the test data for boards
and other renderers.

Dibber's own `npm test` runs every fixture through `dibber check`. Another reader can vendor
this folder at a pinned commit and run its own reader over it.
