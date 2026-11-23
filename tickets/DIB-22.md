---
id: DIB-22
title: DIB-22 — A friendly site on GitHub Pages, with llms.txt and a paste-this-prompt start for agents
status: in-progress
depends_on: [DIB-9, DIB-14, DIB-21]
order: 158
tags: [docs, onboarding, agents]
project: wide-audience
prs: [https://github.com/immediately-run/dibber/pull/10]
---

**Brief:** from the owner, 2026-11-23: a friendly GitHub Pages site for Dibber, with a "For Agents" section.
**Depends on:** DIB-9, DIB-14, DIB-21.

### Why

People who don't use a terminal set tools up by telling their agent to. They need one line to paste, and the agent needs a page written for it: plain Markdown, short, with the exact commands and how to check they worked. The llms.txt convention (llmstxt.org) is where agents look first, and immediately.run's SDK already publishes one.

### What to build

One self-contained page, `site/index.html`, published as the root of this repository's GitHub
Pages. The Pages cache job (`.github/workflows/cache.yml`) publishes exactly one file there
through its `landing-html` input, so the page inlines its CSS, script and icon. It's built from
`site/src/` by `npm run site`.

- **For people:** what Dibber is in one line; one line to paste into a coding agent, with a copy
  button; the `npx` alternative; a ticket as a file; file it, work it, close it; why files; and
  why "Dibber".
- **For agents:** a visible "For coding agents" section on the same page, holding the setup
  steps. The paste line is "Set up Dibber ticket tracking in this repo by following
  https://immediately-run.github.io/dibber/". The same steps are in `docs/install.md`, and
  `llms.txt` at the repository root indexes the project. Both are served from
  raw.githubusercontent.com, since the Pages root holds only the one page.
- **Analytics:** optional Plausible. With `analytics.plausibleDomain` set in `site/site.json`,
  the page counts visits and the events `Copy prompt`, `Copy npx`, `GitHub`, `npm`, `Spec`
  and `Baton`. With it null, the page loads nothing from anywhere else.
- **Publishing:** `cache.yml` passes `landing-html: 'site/index.html'`, the form
  new-project-template's `renderStub({ landingHtml })` writes. The owner's step left is creating
  the Plausible site, if wanted, and setting its domain.

### Exit criteria

- [x] a test: `site/index.html` is the build of `site/src/`; the page loads nothing external without analytics; every in-page link resolves; both paste lines point at the site; the page and `docs/install.md` give the same commands; every `llms.txt` link resolves to a file in this repository
- [ ] the published site at https://immediately-run.github.io/dibber/ serves this page (needs the owner's `cache.yml` change)
- [ ] a scripted agent run: given only the paste line, an agent in an empty repository ends with `dibber check` passing and the three skills installed (needs an agent harness)

## Status

_filed 2026-11-23._

_2026-11-23: the owner asked for the site and that it be simple and sticky. One self-contained page instead of several, because the Pages cache job publishes a single landing file. The agent install steps are on the page itself, so the paste line is the short site URL. docs/install.md and llms.txt live in the repository. Left: the owner's cache.yml change, then the scripted agent run._

_2026-11-23: cache.yml now passes landing-html: 'site/index.html' (the owner asked for the change), so the page is published on the next push to main._

_2026-11-23: in PR #10, https://github.com/immediately-run/dibber/pull/10._

_2026-11-23: analytics on: Plausible's per-site script (pa-uRV8km5SD8BQgQgb49h5T), from the owner. Checked in Chromium: the script is requested, and the copy and outbound clicks queue as events._
