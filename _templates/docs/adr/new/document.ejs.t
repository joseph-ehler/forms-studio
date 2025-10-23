---
to: docs/adr/<%= new Date().toISOString().split('T')[0] %>-<%= title %>.md
---
---
title: <%= title.replace(/-/g, ' ') %>
owner: <%= owner %>
status: <%= status %>
lastReviewed: <%= new Date().toISOString().split('T')[0] %>
tags: [adr, architecture]
---

# <%= title.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) %>

## Context

What problem are we solving? What is the background?

## Decision

What did we decide to do?

## Consequences

### Positive

- What benefits does this bring?

### Negative

- What trade-offs are we accepting?

### Neutral

- What else changes?

## Alternatives Considered

What other options did we evaluate and why did we reject them?

## References

- Link to related docs
- Link to relevant issues/PRs
