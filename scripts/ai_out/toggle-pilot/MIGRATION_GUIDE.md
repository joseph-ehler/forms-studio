# ToggleField Migration Guide

**Pattern**: Proven by CheckboxField pilot  
**Time**: 2-3 hours  
**Risk**: Low (isolated changes, refiner prevents regression)

---

## Overview

This guide walks you through migrating ToggleField from generic `.ds-input` to dedicated `.ds-toggle` primitive, following the proven pattern from CheckboxField.

### What You'll Do

1. Add DS primitive CSS
2. Create factory recipe
3. Update generator dispatch
4. Add refiner guardrail
5. Update/generate ToggleField component
6. Add stories and tests
7. Validate everything works
8. Commit with structured message

**Estimated Time**: 2-3 hours including testing

---

## Before & After

### Before (Current State)
```tsx
// ❌ Problem: Toggle using text input styling
<input 
  type="checkbox" 
  role="switch"
  className="ds-input w-full"  // Wrong primitive!
/>
```

**Issues**:
- Visual: Looks like text field, not toggle switch
- Semantic: Correct (`role="switch"`) but wrong styling
- Touch target: May be too small
- No refiner protection

### After (Target State)
```tsx
// ✅ Solution: Toggle using dedicated primitive
<label style={{ minHeight: '44px' }}>
  <input 
    type="checkbox" 
    role="switch"
    className="ds-toggle"  // Correct primitive!
  />
  <span>{label}</span>
</label>
```

**Improvements**:
- Visual: Pill track with sliding thumb
- Semantic: Correct role + correct styling
- Touch target: ≥ 44×44px via label wrap
- Refiner auto-fixes violations

---

## Migration Steps

### Step 1: Add DS Primitive (15 min)

#### 1.1 Copy CSS File
```bash
cp scripts/ai_out/toggle-pilot/ds/ds-toggle.css packages/ds/src/styles/components/
```

#### 1.2 Import in DS Inputs
Edit `packages/ds/src/styles/components/ds-inputs.css`:

```css
/* Add after other component imports */
@import './ds-toggle.css';
```

#### 1.3 Build DS Package
```bash
pnpm --filter @intstudio/ds build
```

**Expected output**: Clean build, no errors

#### 1.4 Verify CSS Exists
```bash
grep -n "ds-toggle" packages/ds/dist/index.css
```

**Expected**: Should find `.ds-toggle` class definitions

---

### Step 2: Create Factory Recipe (10 min)

#### 2.1 Create Recipe File
```bash
mkdir -p packages/forms/src/factory/recipes
cp scripts/ai_out/toggle-pilot/recipe/ToggleRecipe.ts packages/forms/src/factory/recipes/
```

#### 2.2 Verify Recipe Structure
```bash
head -20 packages/forms/src/factory/recipes/ToggleRecipe.ts
```

**Expected**: Should see `ToggleSpec` interface and `ToggleRecipe` function

---

### Step 3: Update Generator (20 min)

#### 3.1 Add Recipe Import
Edit `scripts/process/field-from-spec-v2.mjs`:

Add near top with other imports:
```javascript
import { ToggleRecipe } from '../packages/forms/src/factory/recipes/ToggleRecipe.ts';
```

#### 3.2 Update selectRecipe() Helper
Find the `selectRecipe()` function and add toggle case:

```javascript
function selectRecipe(spec) {
  switch (spec.type) {
    case 'checkbox':
      return CheckboxRecipe(spec);
    
    case 'toggle':  // ← ADD THIS
      return ToggleRecipe(spec);
    
    case 'text':
    case 'email':
    case 'tel':
    case 'url':
    case 'number':
    default:
      return TextInputRecipe(spec);
  }
}
```

#### 3.3 Test Generator
```bash
echo '{
  "name": "testToggle",
  "type": "toggle",
  "label": "Test Toggle",
  "description": "Test description"
}' | node scripts/process/field-from-spec-v2.mjs
```

**Expected output**: Component code using `.ds-toggle` class

---

### Step 4: Add Refiner Guardrail (15 min)

#### 4.1 Copy Refiner Transform
```bash
cp scripts/ai_out/toggle-pilot/refiner/enforce-toggle-primitive-v1.0.mjs scripts/refiner/transforms/
```

#### 4.2 Import Transform
Edit `scripts/refiner/index.mjs`:

Add import near top:
```javascript
import { enforceTogglePrimitiveV1_0 } from './transforms/enforce-toggle-primitive-v1.0.mjs';
```

#### 4.3 Register Transform
Add to `TRANSFORMS` array:
```javascript
const TRANSFORMS = [
  filterDomPropsV1_1(),
  dedupeJSXAttributesV1_2(),
  noHardcodedColorsV1_0(),
  labelContractV1_0(),
  telemetryPresenceV1_0(),
  ariaCompletenessV1_0(),
  enforceCheckboxPrimitiveV1_0(),
  enforceTogglePrimitiveV1_0(),  // ← ADD THIS
  enforceWCAGContrastV1_0(),
];
```

#### 4.4 Update Version Comment
Update header comment to reflect v1.7:
```javascript
/**
 * Refiner v1.7 - Retroactive Code Upgrades
 * 
 * Transforms:
 * ...
 * - v1.7: enforce-toggle-primitive - Use .ds-toggle for role="switch"
 */
```

#### 4.5 Test Refiner
```bash
pnpm refine:dry
```

**Expected**: Should run without errors, may report findings

---

### Step 5: Update/Generate ToggleField Component (30 min)

#### Option A: Update Existing ToggleField

If ToggleField already exists, update it:

```bash
# Backup current version
cp packages/forms/src/fields/ToggleField/ToggleField.tsx packages/forms/src/fields/ToggleField/ToggleField.tsx.backup

# Replace with new version
cp scripts/ai_out/toggle-pilot/field/ToggleField.tsx packages/forms/src/fields/ToggleField/
```

#### Option B: Create New ToggleField

If ToggleField doesn't exist:

```bash
mkdir -p packages/forms/src/fields/ToggleField
cp scripts/ai_out/toggle-pilot/field/ToggleField.tsx packages/forms/src/fields/ToggleField/
```

#### 5.1 Verify Component
```bash
# Check for correct class
grep "ds-toggle" packages/forms/src/fields/ToggleField/ToggleField.tsx

# Check for role="switch"
grep 'role="switch"' packages/forms/src/fields/ToggleField/ToggleField.tsx
```

**Expected**: Both should return results

#### 5.2 Build Forms Package
```bash
pnpm --filter @intstudio/forms build
```

**Expected**: Clean build

---

### Step 6: Add Stories & Tests (30 min, optional but recommended)

#### 6.1 Copy Storybook Stories
```bash
cp scripts/ai_out/toggle-pilot/stories/ToggleField.stories.tsx packages/forms/src/fields/ToggleField/
```

#### 6.2 Copy Tests
```bash
cp scripts/ai_out/toggle-pilot/tests/ToggleField.test.tsx packages/forms/src/fields/ToggleField/
```

#### 6.3 Run Tests
```bash
pnpm --filter @intstudio/forms test ToggleField
```

**Expected**: All tests pass

#### 6.4 Start Storybook
```bash
pnpm --filter @intstudio/forms storybook
```

**Expected**: Storybook loads, navigate to Forms/ToggleField

---

### Step 7: Validation (30 min)

#### 7.1 Run Refiner Dry-Run
```bash
pnpm refine:dry --scope="packages/forms/src/fields/ToggleField/**/*.tsx"
```

**Expected**: Zero violations (or only behavioral styles like `userSelect`)

#### 7.2 Run Analyzer
```bash
node scripts/analyzer/analyze-batch.mjs --quiet "packages/forms/src/fields/ToggleField/**/*.tsx"
```

**Expected**: Should show ToggleField using `.ds-toggle` primitive

#### 7.3 TypeScript Check
```bash
pnpm --filter @intstudio/forms typecheck
```

**Expected**: No errors

#### 7.4 Manual QA Checklist

Open Storybook and test:

**Visual**:
- [ ] Toggle looks like pill switch (not checkbox)
- [ ] Thumb slides smoothly left/right
- [ ] Off state: gray track, left-aligned thumb
- [ ] On state: primary color track, right-aligned thumb
- [ ] Focus ring visible when tabbing
- [ ] Hover changes border/background

**Keyboard**:
- [ ] Tab focuses toggle
- [ ] Space toggles on/off
- [ ] Enter toggles on/off
- [ ] Focus ring visible

**Mouse/Touch**:
- [ ] Click toggle to toggle
- [ ] Click label to toggle
- [ ] Touch area feels right (not too small)

**States**:
- [ ] Disabled state prevents interaction
- [ ] Error state shows red border
- [ ] Required asterisk appears

**Accessibility** (Storybook A11y panel):
- [ ] Zero violations
- [ ] Announced as "switch" by screen reader
- [ ] Label associated correctly

---

### Step 8: Commit (10 min)

#### 8.1 Stage Files
```bash
git add packages/ds/src/styles/components/ds-toggle.css
git add packages/ds/src/styles/components/ds-inputs.css
git add packages/forms/src/factory/recipes/ToggleRecipe.ts
git add packages/forms/src/fields/ToggleField/
git add scripts/process/field-from-spec-v2.mjs
git add scripts/refiner/index.mjs
git add scripts/refiner/transforms/enforce-toggle-primitive-v1.0.mjs
git add scripts/ai_out/toggle-pilot/
```

#### 8.2 Commit with Structured Message
```bash
git commit -m "feat(fields): implement ToggleField with .ds-toggle primitive (Phase 1)

Part of Phase 1 beautification (2/7 fields).
Follows CheckboxField pilot pattern.

## Changes

**DS Primitive:**
- Add .ds-toggle CSS primitive (40×22px pill switch)
- Size variants: sm (32×18px), md (40×22px), lg (48×26px)
- Smooth thumb slide animation (200ms)
- All states: off, on, focus, hover, disabled, invalid
- WCAG AA compliant
- Reduced motion support
- Imported in ds-inputs.css

**Factory Recipe:**
- Add ToggleRecipe.ts for type-aware generation
- Uses role=\"switch\" for semantics
- Emits .ds-toggle (not .ds-input)
- Optional onLabel/offLabel for state indication
- Label wraps input for ≥ 44×44px touch target
- Boolean value/onChange handling

**Generator Dispatch:**
- Add toggle case to selectRecipe()
- Routes type: 'toggle' to ToggleRecipe
- Falls back to TextInputRecipe for unknown types

**Refiner Guardrail:**
- Add enforce-toggle-primitive-v1.0.mjs
- Detects role=\"switch\" with wrong classes
- Auto-fixes: .ds-input → .ds-toggle, removes w-full
- Registered in refiner v1.7

**ToggleField Component:**
- Uses .ds-toggle class
- Has role=\"switch\"
- Label wraps input (≥ 44×44px)
- All ARIA attributes complete
- RHF integration maintained

**Stories & Tests:**
- 8 Storybook stories covering all states
- 20+ unit tests for primitives, ARIA, interaction

## Impact

Before: Toggle used .ds-input (text styling) ❌
After: Toggle uses .ds-toggle (pill switch) ✅

- Proper visual affordance (pill track + sliding thumb)
- Better UX (larger touch target via label)
- WCAG AA compliant
- Refiner prevents regression

## Testing

- ✅ DS build passes
- ✅ Forms build passes
- ✅ All tests pass (20+)
- ✅ Storybook renders correctly
- ✅ Refiner catches violations
- ✅ Manual QA complete

## Next Steps

Remaining 5 fields:
- RatingField → .ds-rating (HIGH)
- SliderField → .ds-slider (MED)
- FileField → .ds-file-upload (MED)
- MultiSelectField → .ds-select-multiple (MED)
- ColorField → .ds-color-picker (LOW)

Refs: docs/fields/toggle-field-prd.md
Refs: scripts/ai_out/toggle-pilot/"
```

#### 8.3 Handle Pre-commit Hooks

If hooks run and find issues:

**Name Police violations**:
```bash
# Fix any kebab-case issues
git mv incorrectFile.md correct-file.md
git add .
git commit --amend --no-edit
```

**Import Doctor violations**:
```bash
pnpm imports:fix
git add .
git commit --amend --no-edit
```

---

## Testing Checklist

### Unit Tests
- [ ] All 20+ tests pass
- [ ] Primitive class tests pass
- [ ] ARIA attribute tests pass
- [ ] RHF integration tests pass
- [ ] Keyboard interaction tests pass
- [ ] Coverage ≥ 90%

### Visual Tests (Storybook)
- [ ] Basic story renders
- [ ] DefaultOn story shows checked state
- [ ] Required story shows asterisk
- [ ] Disabled story prevents interaction
- [ ] WithError story shows error message
- [ ] SizeVariants story shows all sizes
- [ ] InteractiveForm story works end-to-end

### Accessibility Tests
- [ ] Storybook A11y panel: zero violations
- [ ] Screen reader announces "switch"
- [ ] Keyboard navigation works (Tab, Space, Enter)
- [ ] Focus ring visible
- [ ] Touch target ≥ 44×44px

### Refiner Tests
- [ ] Dry-run passes on new files
- [ ] Can detect `.ds-input` on toggle
- [ ] Can auto-fix to `.ds-toggle`
- [ ] Removes `w-full` class

### Generator Tests
- [ ] Sample toggle spec generates correct code
- [ ] Generated code uses `.ds-toggle`
- [ ] Generated code has `role="switch"`
- [ ] Generated code passes refiner

---

## Rollback Plan

If issues discovered after merge:

### Immediate Rollback
```bash
# Revert the commit
git revert <commit-hash>

# Or reset to previous commit
git reset --hard HEAD~1

# Force push (if already pushed)
git push --force-with-lease
```

### Partial Rollback (Keep Some Changes)
```bash
# Keep DS primitive, remove field
git checkout HEAD~1 -- packages/forms/src/fields/ToggleField/

# Disable refiner transform temporarily
# Comment out in scripts/refiner/index.mjs:
# // enforceTogglePrimitiveV1_0(),

# Commit
git commit -m "chore: temporarily disable ToggleField pending fixes"
```

### Document Issues
Create postmortem in `docs/postmortems/YYYY-MM-DD-toggle-field.md`:
- What went wrong
- Why it wasn't caught
- How to prevent in future
- Lessons learned

---

## Common Issues & Solutions

### Issue: CSS Not Loading in Storybook
**Symptom**: Toggle has no styling, looks like default checkbox  
**Solution**:
1. Verify import in `ds-inputs.css`
2. Rebuild DS: `pnpm --filter @intstudio/ds build`
3. Restart Storybook
4. Check browser DevTools for CSS

### Issue: Generator Still Using .ds-input
**Symptom**: Generated code has wrong class  
**Solution**:
1. Verify toggle case in `selectRecipe()` is before default
2. Check import path for ToggleRecipe
3. Test generator with sample spec
4. Clear any caches: `rm -rf node_modules/.vite`

### Issue: Refiner Not Catching Violations
**Symptom**: Code with `.ds-input` passes refiner  
**Solution**:
1. Check transform is imported
2. Check transform is in TRANSFORMS array
3. Check transform order (should be after dedupeJSXAttributes)
4. Run with verbose output: `DEBUG=refiner pnpm refine:dry`

### Issue: Tests Failing
**Symptom**: `role="switch"` not found  
**Solution**:
1. Check component has both `type="checkbox"` AND `role="switch"`
2. Check tests import correct component
3. Run single test: `pnpm test ToggleField.test.tsx`

### Issue: TypeScript Errors
**Symptom**: Cannot find module 'ToggleRecipe'  
**Solution**:
1. Check file exists at import path
2. Check file extension (.ts not .tsx)
3. Rebuild: `pnpm --filter @intstudio/forms build`

### Issue: Touch Target Too Small
**Symptom**: Hard to tap on mobile  
**Solution**:
1. Verify label has `minHeight: '44px'`
2. Verify label wraps input
3. Test in mobile viewport in DevTools

---

## Success Metrics

After migration, verify these metrics:

### Code Quality
- **Primitive Usage**: 100% (all toggles use `.ds-toggle`)
- **ARIA Completeness**: 100% (all required attributes present)
- **WCAG Compliance**: AA (≥ 4.5:1 contrast for all states)
- **Touch Target**: 100% (all ≥ 44×44px)
- **Test Coverage**: ≥ 90%

### Pattern Consistency
- Recipe generates correct code
- Refiner prevents violations
- Size variants work
- All ARIA wired automatically
- Error handling consistent

### Developer Experience
- Clear error messages
- Easy to generate new toggles
- No manual ARIA wiring needed
- Refiner catches mistakes early

---

## Next Steps

After successful merge:

1. **Monitor Production**
   - Check error tracking for toggle-related issues
   - Monitor accessibility reports
   - Gather user feedback

2. **Update Documentation**
   - Mark ToggleField as complete in tracking doc
   - Update field primitives map
   - Add to pattern library

3. **Prepare Next Field**
   - Review RatingField PRD
   - Identify any unique requirements
   - Plan DS primitive design

4. **Improve System**
   - Document any lessons learned
   - Update refiner if new patterns discovered
   - Consider automating more of this process

---

## Time Breakdown

| Step | Estimated | Actual |
|------|-----------|--------|
| 1. DS Primitive | 15 min | ___ |
| 2. Recipe | 10 min | ___ |
| 3. Generator | 20 min | ___ |
| 4. Refiner | 15 min | ___ |
| 5. Component | 30 min | ___ |
| 6. Stories/Tests | 30 min | ___ |
| 7. Validation | 30 min | ___ |
| 8. Commit | 10 min | ___ |
| **Total** | **2-3 hours** | ___ |

---

**Ready to start?** Begin with Step 1 and work through systematically. Good luck! 🚀
