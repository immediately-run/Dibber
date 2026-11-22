---
id: wide-audience
kind: project
title: Dibber for a wide audience
description: Make Dibber the obvious first ticket tracker for people who have never used Jira or Linear, vibe coders working with agents above all.
---

# Dibber for a wide audience.

Dibber is a format: a spec, a schema and a README, with nothing that runs. That serves tools that
already read it. It doesn't help someone who has never used an issue tracker and wants to know
in five minutes whether this one is for them.

This project goes from "sounds nice" to "my agent files and works my tickets" in one command,
with a guardrail that keeps an agent-written store valid. The spec stays the authority, and no
tool becomes required to read or write a store.

The tickets are the ones whose `project` is `wide-audience`. A suggested order is in their
`order` field: config and ids first, then tooling, then agent skills, docs and the README.
