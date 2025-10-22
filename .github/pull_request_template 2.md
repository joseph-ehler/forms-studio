# Pull Request — Cascade OS Loop

**Every PR follows the 5-step loop. Fill in evidence for each phase.**

---

## 1️⃣ OBSERVE

**Evidence** (console logs / screenshots / benchmarks / recordings):

```
Paste console output, screenshots, or recording links here.
Show ACTUAL runtime behavior, not assumptions.
```

**Observable artifacts**:
- [ ] Console script output (from DEBUGGING_PLAYBOOK.md)
- [ ] Visual proof (screenshot/recording)
- [ ] Performance metrics (if relevant)

---

## 2️⃣ UNDERSTAND

**Root cause** (what / when / where / why):

- **What** is wrong/needed: 
- **When** does it happen: 
- **Where** in the codebase: 
- **Why** is it happening: 

**Evidence trail**:
- Link to console debug session: 
- Root cause identified in: (file:line)

---

## 3️⃣ PATTERN?

**Will this recur?** Yes / No

**Where else might this apply?**
- Component: 
- Feature: 
- Similar code in: 

**Is this the 3rd occurrence?**
- [ ] Yes → Extract to primitive (required)
- [ ] No → Local implementation OK (document why)

---

## 4️⃣ SYSTEMATIZE

**Check all that apply**:

### Code Patterns
- [ ] **Primitive/Hook extracted** (name: `___________`)
- [ ] **Context auto-wire** (no "remember to..." required)
- [ ] **Design tokens** (no magic numbers)
- [ ] **debugX() helper** (add to debug.ts)

### Guardrails
- [ ] **ESLint rule** added/updated (rule: `___________`)
- [ ] **TypeScript constraint** (invalid states unrepresentable)
- [ ] **Playwright test** (smoke coverage)

### Why this prevents recurrence:
```
Explain how the systematization makes this class of bug impossible.
```

---

## 5️⃣ DOCUMENT

**Links updated** (check all modified):

- [ ] `ENGINEERING_PRINCIPLES.md` (if new pattern/principle)
- [ ] `DESIGN_SYSTEM_PATTERNS.md` (if new extraction pattern)
- [ ] `DEBUGGING_PLAYBOOK.md` (if new console script)
- [ ] `CASCADE_OPERATING_SYSTEM.md` (if OS change)
- [ ] ADR (if architectural decision) → `docs/adr/ADR-XXX-title.md`

**Documentation quality**:
- [ ] Console script is copy-pastable
- [ ] Pattern example shows before/after
- [ ] Debug helper usage documented

---

## ✅ Quality Gates

### Tests
- [ ] **Playwright @overlay-smoke** (375×480 viewport)
  - Footer visible & clickable
  - Content scrolls when needed
  - Overlay ≤ viewport bottom
  - Esc/outside close works
  - Footer clicks don't auto-close

- [ ] **Unit tests** (Context / tokens / behavior)
- [ ] **Storybook visual regression** (if UI change)

### Verification
- [ ] **Console script** confirms fix works
- [ ] **debugX() output** pasted in PR description
- [ ] **Manual smoke test** passed (desktop + mobile)

### Code Quality
- [ ] **ESLint** passes (overlay rules enforced)
- [ ] **TypeScript** strict mode passes
- [ ] **Build** succeeds

---

## 🚨 Risk Assessment

**Blast radius**: (how many components/users affected)

**Rollback plan**: (feature flag / revert strategy)

**Breaking changes**: Yes / No
- If yes, migration path: 

---

## 🎯 Definition of Done

**This PR is complete when**:

- [ ] All 5 loop phases filled with evidence
- [ ] Systematization prevents recurrence
- [ ] Tests pass (lint + Playwright + unit)
- [ ] Docs updated (relevant playbooks)
- [ ] Console script proves it works
- [ ] Manual verification on mobile + desktop

---

## 📊 Metrics Impact

**Expected improvements**:
- Time to diagnose similar issues: 
- Boilerplate reduction: 
- Test coverage: 

---

## 🔗 Related

**Issues**: Closes #
**ADR**: (if applicable)
**Follows pattern**: (link to DESIGN_SYSTEM_PATTERNS.md section)
**Debug script**: (link to DEBUGGING_PLAYBOOK.md section)

---

**Reviewer**: Before approving, verify:
1. ✅ Evidence in phase 1 (not assumptions)
2. ✅ Root cause clear in phase 2 (not symptoms)
3. ✅ Pattern extraction in phase 4 (if 3rd occurrence)
4. ✅ Tests prove it works
5. ✅ Docs updated for future developers
