---
id: DIB-31
title: DIB-31 — Use the tagline in the CLI help, package.json and the Claude Code plugin descriptions
status: done
depends_on: []
tags: [docs, cli]
updated: 2026-11-24
---

**Depends on:** none.

### Why

DIB-30 put 'Git as your issue tracker. An open format built on Markdown.' on the README and the site, but dibber --help, the npm description and the plugin's marketplace listing still said 'Tickets as files in git'.

### What to build

The first line of dibber --help, package.json's description, and the descriptions in .claude-plugin/plugin.json and .claude-plugin/marketplace.json lead with the tagline. The npm page takes the new description at the next release.

### Exit criteria

- [x] node bin/dibber.mjs --help | head -1 | grep -q 'Git as your issue tracker'
- [x] ! grep -rn 'files in git' src/cli.mjs package.json .claude-plugin/
- [x] npm test

## Status

_filed 2026-11-24._

_2026-11-24: done._

_2026-11-24: `dibber --help`, package.json and both .claude-plugin/ files lead with the tagline; the marketplace's plugin entry matches plugin.json. `npm test` (67 pass) and `npm run check:release` pass. npm shows the new description from the next release._
