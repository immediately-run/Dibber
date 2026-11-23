---
id: DIB-22
title: DIB-22 — A friendly site on GitHub Pages, with llms.txt and a paste-this-prompt start for agents
status: available
depends_on: [DIB-9, DIB-14, DIB-21]
order: 158
tags: [docs, onboarding, agents]
project: wide-audience
---

**Brief:** from the owner, 2026-11-23: a friendly GitHub Pages site for Dibber, with a "For Agents" section.
**Depends on:** DIB-9, DIB-14, DIB-21.

### Why

People who don't use a terminal set tools up by telling their agent to. They need one line to paste, and the agent needs a page written for it: plain Markdown, short, with the exact commands and how to check they worked. The llms.txt convention (llmstxt.org) is where agents look first, and immediately.run's SDK already publishes one.

### What to build

A site built from Markdown in `site/`, published to this repository's GitHub Pages. For people: what Dibber is, who it's for, a 30-second start, the guide (DIB-14), customizing (DIB-15) and migrating (DIB-16). For agents: `/llms.txt` (an index), `/install.md` (run `npx -y @immediately-run/dibber init --yes --prefix <P>`, then `dibber check` and `dibber list`, then what to tell the user), and a `.md` twin of every page. At the top of the home page and the README, one line to copy: "Set up Dibber ticket tracking in this repository by following https://immediately-run.github.io/dibber/llms.txt". Enabling Pages and adding its workflow under `.github/` is the owner's step; the ticket ships the site source and the workflow file as a proposal in the PR body.

### Exit criteria

- [ ] a test: every page under `site/` has a `.md` twin, and every link in llms.txt resolves to a file in the built site
- [ ] a scripted agent run: given only the paste line, an agent in an empty repository ends with `dibber check` passing and the three skills installed (needs an agent harness)

## Status

_filed 2026-11-23._
