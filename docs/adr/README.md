# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records for significant design system decisions.

## What is an ADR?

An ADR documents:
- **Context**: What problem are we solving?
- **Decision**: What did we decide?
- **Consequences**: What are the trade-offs?

ADRs are lightweight (10-30 lines), living documents that prevent tribal knowledge and make the codebase self-documenting.

---

## Format

```markdown
# ADR-XXX: Title

**Date**: YYYY-MM-DD
**Status**: ✅ Accepted / 🚧 Proposed / ❌ Rejected / 📦 Superseded

## Context
What problem/pattern requires a decision?

## Decision  
What did we decide to do?

## Consequences
- Positive: What improves?
- Negative: What trade-offs?
- Mitigations: How do we address negatives?

## Related
- PR/Issues
- Documentation links
- Related patterns
```

---

## Index

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [001](./ADR-001-contentref-auto-wiring.md) | Auto-wire contentRef via Context | ✅ Accepted | 2025-10-22 |

---

## When to Create an ADR

**Create an ADR when**:
- You extract a pattern (3rd occurrence)
- You change system architecture
- You add auto-wiring via Context
- You create design tokens
- You add ESLint rules
- You change the build/deploy process
- You make a decision that affects >3 files

**Don't create an ADR for**:
- Local implementation details
- Obvious bug fixes
- Documentation updates
- Test additions

---

## How to Create an ADR

1. **Copy the template**:
   ```bash
   cp docs/adr/TEMPLATE.md docs/adr/ADR-XXX-title.md
   ```

2. **Fill it out** (10-30 lines max)

3. **Link it**:
   - Add to index above
   - Link from PR description
   - Reference in relevant docs

4. **Update when superseded**:
   - Mark status as 📦 Superseded
   - Link to new ADR

---

## ADR Template

See [`TEMPLATE.md`](./TEMPLATE.md) for the standard format.

---

**Remember**: ADRs are living documents. Update them when:
- Status changes
- New consequences discovered
- Related decisions made
- Lessons learned
