# Migration Checklist - Quick Reference

**Use this checklist for EVERY large change (>10 files)**

---

## ⚠️ **Pre-Flight Check**

Before starting ANY migration, ask:

- [ ] Does this touch >10 files? → **MUST use codemod**
- [ ] Am I thinking "sed will do"? → **STOP, use AST transform**
- [ ] Is this a pattern we've seen before? → **Check docs/handbook/ for playbook**

---

## 📋 **The 7-Step Sequence**

### ☐ Step 1: Preflight (30-45 min)

- [ ] Write RFC in `docs/adr/YYYY-MM-DD-[name].md`
- [ ] List codemods needed
- [ ] Define success metrics
- [ ] Document rollback strategy

**Output:** ADR file ready to commit

---

### ☐ Step 2: Baseline (5 min)

```bash
# Tag current state
git tag migration-baseline-$(date +%Y-%m-%d)

# Record current state
pnpm build > baseline-build.log 2>&1
pnpm guard > baseline-guard.log 2>&1
pnpm api:extract

# Commit baseline
git add .reports/api/ baseline-*.log
git commit -m "chore: baseline before [change name]"
```

- [ ] Tag created
- [ ] Baseline logs saved
- [ ] API snapshot committed

---

### ☐ Step 3: Codemod-First (NEVER Skip)

**If codemod doesn't exist:**
```bash
# Create codemod
cp scripts/codemods/template.mjs scripts/codemods/[name].mjs
# Edit and implement transform
```

**Run dry-run:**
```bash
node scripts/codemods/[name].mjs --dry-run
```

- [ ] Dry-run shows diffs
- [ ] File count looks correct
- [ ] Risk level acceptable
- [ ] Reviewed output with team (if high risk)

---

### ☐ Step 4: Apply in Sequence (Lock This Order!)

```bash
# 1. Imports FIRST
pnpm imports:fix

# 2. Props/patterns second
node scripts/codemods/[name].mjs

# 3. Barrels third
pnpm barrels

# 4. Build fourth
pnpm build

# 5. Guard last
pnpm guard
```

- [ ] Each step passes before next
- [ ] No errors in any step
- [ ] Git diff reviewed

---

### ☐ Step 5: Compat Façade (Only if Breaking)

**If this is a breaking change:**

- [ ] Add re-export with `@deprecated` JSDoc
- [ ] Set removal date (1-2 releases max)
- [ ] Create ESLint rule forbidding old pattern
- [ ] Test façade works
- [ ] Schedule removal (GitHub issue/calendar)

**Example:**
```typescript
/**
 * @deprecated Import from [new-location] instead
 * This re-export will be removed in v[X.Y.Z] ([Month Year])
 * Migration: pnpm codemod [codemod-name]
 */
export { Thing } from '[new-location]';
```

---

### ☐ Step 6: Verification

```bash
# All must pass
pnpm build
pnpm guard
pnpm depgraph:check
pnpm api:extract

# Review API changes
git diff .reports/api/
```

- [ ] Build passes
- [ ] Guard passes
- [ ] dep-cruiser passes
- [ ] API report reviewed
- [ ] No unexpected changes

---

### ☐ Step 7: Close

**Documentation:**
- [ ] ADR updated with results
- [ ] Session summary in `docs/archive/SESSION_YYYY-MM-DD_[name].md`
- [ ] Deprecation warnings in code
- [ ] Changeset created: `pnpm changeset`
- [ ] Removal date scheduled (if compat added)

**Commit:**
```bash
git add .
git commit -m "feat: [description]

- [what changed]
- [why it changed]
- [how to migrate if breaking]

Migration: pnpm codemod [name]
Closes #[issue]"
```

- [ ] Clear commit message
- [ ] Migration command included
- [ ] Issue linked

---

## 🚨 **Red Flags**

**STOP immediately if you hear yourself say:**

- ❌ "Let's land this and fix later"
  - Only OK if guardrail prevents regression

- ❌ "Quick sed/find-replace will do"
  - Use AST codemod instead

- ❌ "Hand-editing more than 10 files"
  - STOP, write codemod

- ❌ "Green locally but failing in CI"
  - Add pre-commit step mirroring CI

- ❌ "We've seen this bug before"
  - Extract pattern, add lint rule

---

## ✅ **Success Criteria**

### Time Targets
- [ ] Preflight → Done: <45 min
- [ ] Dry-run → Apply: <30 min
- [ ] Apply → Green CI: <15 min
- [ ] **Total: <90 min**

### Quality Targets
- [ ] Rollbacks needed: **0**
- [ ] Regressions introduced: **0**
- [ ] Manual fixes after: **0**
- [ ] CI rounds to green: **1**

---

## 🎯 **Quick Decision Tree**

```
Does this touch >10 files?
├─ YES → Write codemod
└─ NO → Is it a new pattern?
    ├─ YES → Will we do it again?
    │   ├─ YES → Write codemod anyway (future leverage)
    │   └─ NO → Manual edit OK
    └─ NO → Manual edit OK
```

---

## 📚 **Reference Documents**

- **Full methodology:** `docs/handbook/OPERATING_PRINCIPLES.md`
- **Codemod examples:** `scripts/codemods/`
- **ADR template:** `docs/adr/TEMPLATE.md`
- **Playbook details:** Memory system ("Migration Playbook")

---

## 🔄 **After Every Migration**

**Update this checklist if:**
- [ ] New step needed
- [ ] Better approach discovered
- [ ] Anti-pattern encountered
- [ ] Time estimates off

**Last updated:** Oct 23, 2025

---

**Remember:** We build systems, not features. Every migration should make the next one easier.
