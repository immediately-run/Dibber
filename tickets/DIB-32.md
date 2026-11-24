---
id: DIB-32
title: DIB-32 — Write all of a command's output before exiting, even when it is piped
status: available
description: "bin/dibber.mjs calls process.exit right after writing to stdout. When stdout is a pipe the write is asynchronous, so output past the pipe's buffer is lost: dibber check --json on a large store stops at 64 KiB and is not valid JSON."
depends_on: []
tags: [tooling, bug]
project: wide-audience
---

**Brief:** found 2026-11-24 while running dibber check on the docs store for DIB-31; filed at the owner's request.
**Depends on:** none.

### Why

An agent or a CI step reads `dibber check --json` (or `list --json`) through a pipe. On a large store the JSON is cut off: on the docs store (1,408 tickets) `dibber check --root docs --json | wc -c` prints 65536, while the same command run in-process produces 255,158 bytes. The reader gets a parse error instead of the problems, and the exit code still looks like a normal result. Small stores fit in the buffer, so the tests never saw it.

### What to build

bin/dibber.mjs writes stdout and stderr in full before the process ends, with the exit code unchanged: set `process.exitCode` and let Node exit on its own, or exit in the write's callback. Nothing else in the CLI changes.

### Exit criteria

- [ ] a test: spawning `bin/dibber.mjs` with stdout piped, on a store whose `check --json` output is over 64 KiB, yields output that parses as JSON and is as long as `run()` produces in-process
- [ ] a test: the exit code is still 1 when check finds an error and 2 on a refusal, with stdout piped
- [ ] npm test passes

## Status

_filed 2026-11-24._
