# Migration: batch-numberfield-checkboxfield-textareafield-switchfield

**Date:** 2025-10-23  
**Status:** Planning

---

## Goal

[What we're changing and why]

## Approach

**Codemods needed:**
- [ ] `scripts/codemods/[name].mjs`

**Sequence:**
1. Imports first (normalize paths)
2. Props/patterns second
3. Barrels third
4. Build fourth
5. Guard last

**Risk level:** [low|medium|high]

---

## Success Criteria

- [ ] Build passes
- [ ] Guard passes
- [ ] API report clean
- [ ] 0 manual fixes needed
- [ ] Time: <90 min

---

## Rollback Strategy

```bash
git revert <commit-range>
# OR
git checkout migration-baseline-2025-10-23
```

---

## Checklist

- [ ] Baseline created
- [ ] Codemod tested (--dry-run)
- [ ] Applied in sequence
- [ ] Verification passed
- [ ] Documentation updated
- [ ] Changeset created
- [ ] Compat façade removal scheduled (if applicable)
