---
id: DIB-30
title: DIB-30 — Lead the README and the website with the tagline 'Git as your issue tracker. An open format built on Markdown.'
status: done
depends_on: []
tags: [docs, site]
updated: 2026-11-24
---

**Depends on:** none.

### Why

The owner chose a new tagline on 2026-11-24. The README opened with 'Tickets as files in git' and the site with 'Your to-do list belongs in your repo', so the first thing a visitor read differed between the two.

### What to build

The README's first line and the website's headline, page title and og:title say 'Git as your issue tracker. An open format built on Markdown.' (the title and og:title use the first sentence). The site's lead paragraph no longer repeats 'Markdown' straight after the tagline. site/index.html is rebuilt.

### Exit criteria

- [x] grep -q 'Git as your issue tracker. An open format built on Markdown.' README.md
- [x] grep -q 'Git as your issue tracker' site/src/index.html && npm run site -- --check
- [x] npm test

## Status

_filed 2026-11-24._

_2026-11-24: done._

_2026-11-24: the README opens with the tagline; the site's headline is 'Git as your issue tracker.' with 'An open format built on Markdown.' under it, its title and og:title use the first sentence, and the lead says 'plain files' so Markdown isn't said twice. Checked at 1280px and 390px, light and dark. `npm test` and `npm run site -- --check` pass._
