---
id: DIB-15
title: "DIB-15 — Docs: customizing ticket properties with item.schema.json"
status: available
description: How a repository adds its own keys (priority, estimate, area), requires them, restricts their values, and gets them checked, with copy-paste recipes.
depends_on: [DIB-1, DIB-4, DIB-6]
order: 110
tags: [docs]
project: wide-audience
---

**Brief:** from the owner's list, 2026-11-22: docs on how to customize ticket properties.
**Spec:** R-DIB-3, R-DIB-5, R-DIB-9.
**Depends on:** DIB-1, DIB-4, DIB-6.

### Why

R-DIB-3 lets a store add a stricter `item.schema.json`, and R-DIB-5 lets any tool add keys, but
nothing shows how. The first thing most teams do with a tracker is add a field.

### What to build

- `docs/customizing.md`, covering adding an optional key, making a key required, limiting a key
  to a list of values, a stricter id pattern, and tags with a fixed vocabulary.
- Recipes: `priority`, `estimate`, `area`, `due`, and making `assignee` required for a store
  that wants every live ticket named,
  each as a complete `item.schema.json` fragment.
- How DIB-6's `dibber check` picks up the store's schema, and what an error looks like.
- When to use a tag and when to use a key.

### Exit criteria

- [ ] every recipe in the doc is extracted by a test into a store fixture that `dibber check` passes, with one violating ticket that it fails

## Status

_filed 2026-11-22._
