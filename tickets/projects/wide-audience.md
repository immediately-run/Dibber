---
id: wide-audience
title: Dibber for a wide audience
description: Make Dibber the obvious first ticket tracker for people who have never used Jira or Linear, vibe coders working with agents above all.
page: project
---

# Dibber for a wide audience.

Dibber is a format: a spec, a schema and a README, with nothing that runs. That serves tools that
already read it. It doesn't help someone who has never used an issue tracker and wants to know
in five minutes whether this one is for them.

The audience is one person driving a coding agent on their own machine, for whom Dibber alone
is enough. Several runners, several people or a more complex LLM provider setup is when Baton
joins, and the tickets stay as they are (DIB-2). This repository is the worked example of a
Dibber-tracked project (DIB-11).

This project goes from "sounds nice" to "my agent files and works my tickets" in one command,
with a guardrail that keeps an agent-written store valid. The spec stays the authority, and no
tool becomes required to read or write a store.

The tickets are the ones whose `project` is `wide-audience`. A suggested order is in their
`order` field: config and ids first, then tooling, then agent skills, docs and the README.
