---
id: DIB-21
title: DIB-21 — Publish @immediately-run/dibber to npm, by hand once and then from GitHub Releases
status: in-progress
depends_on: [DIB-6, DIB-7, DIB-8]
order: 88
tags: [release]
project: wide-audience
prs: [https://github.com/immediately-run/dibber/pull/2]
---

**Brief:** split from DIB-6 on 2026-11-22: the npm name `dibber` is taken, so the package is `@immediately-run/dibber`; publishing is the owner's step.
**Depends on:** DIB-6, DIB-7, DIB-8.
**Waits on:** the owner, for the one-time setup in `docs/releasing.md` and the first GitHub Release.

### Why

The skills, `AGENTS.md` and the docs say `npx -y @immediately-run/dibber`, which fails until the package exists. The GitHub Action and pre-commit hook should pin a tag, not `main`.

### What to build

- 0.1.0 is published by hand (done by the owner, 2026-11-23). npm needs the package to exist
  before a trusted publisher can be added.
- `.github/workflows/ci.yml` tests every push and pull request. On a published GitHub Release
  it publishes through npm trusted publishing, so no token is stored. It runs in the `npm`
  environment, refuses a tag that doesn't match the version, and publishes a pre-release under
  `next`.
- `npm version <x.y.z>` bumps `package.json` and `.claude-plugin/` together, and tags the
  commit.
- The owner's one-time setup, in `docs/releasing.md`: the trusted publisher on npmjs.com, the
  `npm` environment on GitHub, public access, then disallowing tokens.

### Exit criteria

- [x] `npx -y @immediately-run/dibber --help` prints the usage
- [x] a GitHub Release publishes its version to npm through the workflow, with provenance (`npm view @immediately-run/dibber dist.attestations` shows it)

## Status

_filed 2026-11-22._

_2026-11-23: 0.1.0 was published to npm by the owner by hand. A publish workflow (.github/workflows/ci.yml, requested by the owner) now publishes each GitHub Release through npm trusted publishing; docs/releasing.md has the owner's one-time npm and GitHub setup. Left: that setup, then the first release from the workflow and its tag._

_2026-11-23: workflow in review, https://github.com/immediately-run/dibber/pull/2._

_2026-11-23: tested by the owner with the pre-release v0.1.1-rc.0 (run 45127532061): published under next with public access by the GitHub Actions trusted publisher, with an SLSA provenance attestation signed for ci.yml@refs/tags/v0.1.1-rc.0. Left: the npx check once the tarball is served, and disallowing tokens on npm._

_2026-11-23: npx -y @immediately-run/dibber@next ran help, init, list and check in an empty repository once npm served the tarball (5 minutes after the publish). Left: disallowing tokens on npm (owner)._
