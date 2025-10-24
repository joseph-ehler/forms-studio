# Postmortem: Hardcoded Colors Bypassed Factory (2025-10-23)

## Incident
WCAG AA contrast violations discovered in CheckboxField:
- Red asterisk (`#EF4444`) = 3.76:1 contrast ❌
- Blue submit button (`#3B82F6`) = 3.68:1 contrast ❌

**Expected**: Factory system prevents hardcoded colors  
**Actual**: Inline styles with hardcoded fallbacks slipped through

## Root Cause (4 Failures - Generator Template Was The Source!)

### 0. Recipe Template Had Hardcoded Colors 🔴 **PRIMARY CAUSE**
`CheckboxRecipe.ts` created (2025-10-23 19:50) WITH hardcoded colors:
```typescript
{required && <span style={{ color: 'var(--color-error, #EF4444)' }}>*</span>}
```
- Recipe was **hand-written**, not validated
- Commit message claimed "design tokens (no magic values)" but used `#EF4444` fallback
- **Generator blindly emits template strings** → propagated violation to all generated fields
- No validation runs on recipe templates themselves

### 1. Overly Aggressive Refiner ❌
`no-inline-styles-v1.0.mjs` removed ALL `style` attributes:
- Couldn't distinguish behavioral (`userSelect: 'none'`) from visual (`color: '#EF4444'`)
- Too blunt → developers disable transform → violations slip through

### 2. WCAG Transform Was Report-Only ⚠️
`enforce-wcag-contrast.mjs` could detect violations but didn't auto-fix:
- Reported issues but required manual intervention
- Manual fixes get forgotten or delayed

### 3. Refiner Not Run After Field Generation 🚫
- CheckboxField generated from template
- Refiner never executed post-generation
- No automated enforcement in CI/pre-commit

## What Failed

**The Factory DID have protection**, but it failed because:

1. **Transform was too aggressive** → Got disabled
2. **Auto-fix didn't exist** → Manual fixes required
3. **No automated enforcement** → Refiner only runs on-demand

## The Fix (Systematized)

### Immediate
✅ Manually fixed CheckboxField, CheckboxRecipe, stories (use DS tokens)

### Systematic
✅ Created `no-hardcoded-colors-v1.0.mjs`:
- **Surgical**: Only targets visual properties with hex colors
- **Allows**: Behavioral styles (`userSelect`, `pointerEvents`)
- **Auto-fixes**: Replaces known hex codes with semantic tokens
- **Maps**: `#EF4444` → `--ds-color-state-danger`, etc.

✅ Disabled overly aggressive `no-inline-styles-v1.0.mjs`

### Process Improvements

**1. Add Refiner to CI** (TODO)
```yaml
# .github/workflows/quality.yml
- name: Run Refiner (dry-run)
  run: pnpm refine:dry
  
- name: Fail if violations found
  run: |
    if [ $? -ne 0 ]; then
      echo "❌ Refiner found violations. Run 'pnpm refine:run' locally."
      exit 1
    fi
```

**2. Add Pre-commit Hook** (TODO)
```sh
# .husky/pre-commit
pnpm refine:dry --scope=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx)$')
```

**3. Document in Field PRD Template** (TODO)
Add to checklist:
- [ ] Run `pnpm refine:dry` before PR
- [ ] No inline styles with hardcoded colors
- [ ] WCAG AA contrast verified

## Lessons

1. **Transforms must be surgical, not sweeping**
   - Overly broad rules get disabled
   - Target specific anti-patterns

2. **Auto-fix > Report-only**
   - Manual fixes get forgotten
   - Automated fixes scale

3. **Enforcement must be automated**
   - On-demand tools don't prevent issues
   - CI/pre-commit hooks catch violations early

4. **The system existed but wasn't enforced**
   - Having guardrails != using guardrails
   - Automate the activation

## Success Criteria

✅ New transform can auto-fix hardcoded colors  
✅ Behavioral styles (e.g., `userSelect`) allowed  
⬜ Refiner runs in CI (blocks PRs with violations)  
⬜ Pre-commit hook runs refiner on changed files  
⬜ Documentation updated with refiner workflow  

## Timeline
- **21:15** - User discovers WCAG violations in Storybook
- **22:00** - Root cause: hardcoded hex colors in inline styles
- **22:15** - Fixed manually in 3 files
- **22:19** - User asks "how did this bypass the factory?"
- **22:25** - Diagnosed refiner failures, created surgical transform
- **22:30** - Documented learnings, created action items

## Action Items

**Critical (Prevent Recurrence):**
1. [ ] **Validate recipe templates on save/commit** - Run refiner transforms on recipes themselves
2. [ ] **Test recipe output** - Generate sample field, run refiner, assert zero violations
3. [ ] Add refiner to CI pipeline
4. [ ] Add pre-commit hook for refiner

**High Priority:**
5. [ ] Run `pnpm refine:run` on entire codebase to catch other violations
6. [ ] Update field PRD template with refiner checklist
7. [ ] Create recipe linting tool (validates templates before they generate bad code)

**Future:**
8. [ ] Create `no-magic-numbers` transform for spacing/sizing
9. [ ] Add recipe test suite (generate → refine → assert clean)

---

**Meta-Learning**: When a guardrail fails, ask:
1. Why wasn't it enforced? (automation gap)
2. Was it too aggressive? (granularity)
3. Could it auto-fix? (reduce manual burden)
