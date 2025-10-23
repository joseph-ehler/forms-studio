# CheckboxField Migration Guide

**Phase:** Pilot (1 of 7 fields)  
**Risk:** Low  
**Estimated Time:** 2-3 hours  
**Rollback:** `git restore packages/`

---

## 📊 Before vs After

### Before (Wrong Primitive)
```tsx
<input
  type="checkbox"
  className="ds-input w-full"  // ❌ Text input styling on checkbox!
  checked={field.value ?? false}
  onChange={(e) => field.onChange(e.target.checked)}
/>
```

**Problems:**
- Checkbox styled like text input box
- Full-width (checkboxes shouldn't be full-width)
- No visual affordance (looks like input field, not checkbox)
- Confusing UX

### After (Correct Primitive)
```tsx
<input
  type="checkbox"
  className="ds-checkbox"  // ✅ Proper checkbox styling!
  checked={field.value ?? false}
  onChange={(e) => field.onChange(e.target.checked)}
/>
```

**Benefits:**
- Clear checkbox appearance (square box)
- Proper sizing (18x18px, not full-width)
- Visual states (hover, focus, checked, disabled)
- Platform conventions followed

---

## 🎯 What Changes

### 1. Design System (New Primitive)
**File:** `packages/ds/src/styles/components/ds-checkbox.css`
- Adds `.ds-checkbox` class with proper checkbox styling
- Focus ring, hover states, checkmark animation
- Disabled and invalid states
- Uses design tokens (no magic values)

### 2. Factory (New Recipe)
**File:** `packages/forms/src/factory/recipes/CheckboxRecipe.ts`
- Type-aware template for checkbox generation
- Emits `.ds-checkbox` instead of `.ds-input`
- Handles boolean value/onChange correctly
- Label wraps checkbox for larger hit area

### 3. Generator (Type Dispatch)
**File:** `packages/forms/src/factory/field-from-spec-v2.mjs`
- Adds `selectRecipe()` helper function
- Routes `type: 'checkbox'` to CheckboxRecipe
- Falls back to existing generator for text inputs

### 4. Refiner (Guardrail)
**File:** `packages/forms/src/factory/refiner/transforms/enforce-checkbox-primitive-v1.0.mjs`
- Detects `<input type="checkbox">` with `.ds-input`
- Auto-fixes: replaces with `.ds-checkbox`, removes `w-full`
- Prevents regression (runs in CI)

### 5. CheckboxField (Regenerated)
**File:** `packages/forms/src/fields/CheckboxField/CheckboxField.tsx`
- Uses `.ds-checkbox` class
- No `w-full` class
- Label wraps input for better UX
- Proper boolean handling

---

## 📋 Step-by-Step Migration

### Step 1: Copy Files (5 min)

```bash
# From repo root
cd /Users/josephehler/Desktop/Desktop/apps/intelligence-studio-forms

# Copy DS primitive
cp scripts/ai_out/checkbox-pilot/ds/ds-checkbox.css \
   packages/ds/src/styles/components/

# Copy recipe
mkdir -p packages/forms/src/factory/recipes
cp scripts/ai_out/checkbox-pilot/recipe/CheckboxRecipe.ts \
   packages/forms/src/factory/recipes/

# Copy refiner transform
cp scripts/ai_out/checkbox-pilot/refiner/enforce-checkbox-primitive-v1.0.mjs \
   packages/forms/src/factory/refiner/transforms/

# Copy regenerated field
cp scripts/ai_out/checkbox-pilot/field/CheckboxField.tsx \
   packages/forms/src/fields/CheckboxField/

# Copy stories (optional)
cp scripts/ai_out/checkbox-pilot/stories/CheckboxField.stories.tsx \
   packages/forms/src/fields/CheckboxField/

# Copy tests (optional)
cp scripts/ai_out/checkbox-pilot/tests/CheckboxField.test.tsx \
   packages/forms/src/fields/CheckboxField/
```

### Step 2: Import DS Primitive (2 min)

Edit your DS styles entry point to include the new primitive:

**File:** `packages/ds/src/styles/index.css` (or `components/index.css`)

```css
/* Add this line */
@import './components/ds-checkbox.css';
```

Or if you have a components barrel:

**File:** `packages/ds/src/styles/components/index.css`

```css
@import './ds-checkbox.css';
```

### Step 3: Update Generator Dispatch (10 min)

**File:** `packages/forms/src/factory/field-from-spec-v2.mjs`

**Add import at top (after line 43):**
```javascript
import { CheckboxRecipe } from './recipes/CheckboxRecipe.js';
```

**Add selectRecipe helper (before generateFormsField, around line 150):**
```javascript
/**
 * Select recipe based on field type
 */
function selectRecipe(spec) {
  const type = (spec?.type || '').toLowerCase();
  
  // Type-specific recipes
  if (type === 'checkbox' || type === 'boolean') {
    return CheckboxRecipe;
  }
  
  // Future: toggle, rating, slider, file, color, multiselect recipes
  
  // Standard text inputs use existing inline generator
  return null;
}
```

**Update generateFormsField (around line 273):**
```javascript
function generateFormsField(spec, allowlist) {
  const { name, type } = spec;
  
  // ============================================================
  // COMPOSITE FIELDS - Use dedicated generator
  // ============================================================
  if (type === 'composite') {
    const implementation = generateCompositeField(spec, allowlist);
    // ... existing composite logic
    return;
  }
  
  // ============================================================
  // TYPE-SPECIFIC RECIPES - NEW!
  // ============================================================
  const recipe = selectRecipe(spec);
  if (recipe) {
    const implementation = recipe(spec);
    
    // Write to file
    const fieldDir = path.join(ROOT, `packages/forms/src/fields/${name}`);
    fs.mkdirSync(fieldDir, { recursive: true });
    fs.writeFileSync(path.join(fieldDir, `${name}.tsx`), implementation);
    fs.writeFileSync(path.join(fieldDir, 'index.ts'), `export * from './${name}';\n`);
    updateFieldsIndex(name);
    
    console.log(`   ✅ Created (via ${recipe.name}): packages/forms/src/fields/${name}/${name}.tsx`);
    return; // Exit early
  }
  
  // ============================================================
  // SIMPLE FIELDS - Use existing logic (unchanged)
  // ============================================================
  // ... rest of existing generateFormsField code
}
```

See `scripts/ai_out/checkbox-pilot/generator/dispatch-snippet.mjs` for complete code.

### Step 4: Register Refiner Transform (5 min)

**Find your refiner registration file** (likely `scripts/refiner/refiner.mjs` or similar).

**Add import:**
```javascript
import { enforceCheckboxPrimitiveV1_0 } from './transforms/enforce-checkbox-primitive-v1.0.mjs';
```

**Add to transforms array:**
```javascript
export const ALL_TRANSFORMS = [
  // ... existing transforms
  enforceCheckboxPrimitiveV1_0(),
];
```

### Step 5: Build & Test (15 min)

```bash
# Build DS to pick up new CSS
pnpm --filter @intstudio/ds build

# Build forms
pnpm --filter @intstudio/forms build

# Run tests
pnpm --filter @intstudio/forms test CheckboxField

# Verify no build errors
echo $?  # Should be 0
```

### Step 6: Visual Validation (10 min)

```bash
# Start Storybook
pnpm storybook
```

**Navigate to:** `Fields > CheckboxField`

**Verify:**
- [ ] Checkbox appears as square box (not text input)
- [ ] Clicking checkbox toggles checked state
- [ ] Clicking label toggles checkbox
- [ ] Focus ring appears on keyboard Tab
- [ ] Checkmark appears when checked
- [ ] Disabled state looks disabled
- [ ] Error state shows red border
- [ ] Required asterisk appears

### Step 7: Run Refiner (Validation)

```bash
# Dry run to see what refiner would change
node scripts/refiner/refine.mjs --dry packages/forms/src/fields/CheckboxField/CheckboxField.tsx

# Should report: ✅ No changes needed (already compliant)
```

### Step 8: Commit (5 min)

```bash
git add packages/ds/src/styles/components/ds-checkbox.css \
        packages/forms/src/factory/recipes/CheckboxRecipe.ts \
        packages/forms/src/factory/refiner/transforms/enforce-checkbox-primitive-v1.0.mjs \
        packages/forms/src/factory/field-from-spec-v2.mjs \
        packages/forms/src/fields/CheckboxField/

git commit -m "feat(fields): implement CheckboxField with proper .ds-checkbox primitive

Part of Phase 1 beautification (1/7 fields).

Changes:
- Add .ds-checkbox DS primitive with proper checkbox styling
- Create CheckboxRecipe for type-aware generation
- Add enforce-checkbox-primitive refiner guard
- Update generator to dispatch checkbox type to CheckboxRecipe
- Regenerate CheckboxField.tsx with correct primitive

Before: Checkbox used .ds-input (text input styling)
After: Checkbox uses .ds-checkbox (proper checkbox styling)

Impact:
- Clear visual affordance (square box, not text field)
- Follows platform conventions
- Better UX (label wraps checkbox for larger hit area)
- Prevents regression via refiner

Refs: scripts/ai_out/ANALYSIS_REPORT_2025-10-23.md
Refs: scripts/ai_out/checkbox-pilot/README.md"
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] `pnpm --filter @intstudio/forms test CheckboxField`
- [ ] All tests pass
- [ ] Snapshot updated (if any)

### Visual Tests (Storybook)
- [ ] Basic story renders
- [ ] Required story renders
- [ ] Disabled story renders
- [ ] Error story renders
- [ ] Interactive form works

### Manual Tests
- [ ] Checkbox is square (not rectangle like text input)
- [ ] Clicking checkbox toggles state
- [ ] Clicking label toggles checkbox
- [ ] Keyboard Tab focuses checkbox
- [ ] Space key toggles when focused
- [ ] Focus ring visible on focus
- [ ] Checkmark appears when checked
- [ ] Required asterisk shows when required
- [ ] Error message displays below checkbox
- [ ] Description shows below checkbox
- [ ] Disabled state prevents interaction

### Refiner Tests
- [ ] Dry run shows no issues
- [ ] If you manually add `.ds-input` and run refiner, it auto-fixes

---

## 🔄 Rollback Plan

If something breaks:

```bash
# Restore previous state
git restore packages/ds/src/styles/components/ds-checkbox.css \
            packages/forms/src/factory/recipes/CheckboxRecipe.ts \
            packages/forms/src/factory/refiner/transforms/enforce-checkbox-primitive-v1.0.mjs \
            packages/forms/src/factory/field-from-spec-v2.mjs \
            packages/forms/src/fields/CheckboxField/

# Rebuild
pnpm --filter @intstudio/ds build
pnpm --filter @intstudio/forms build

# Verify green
pnpm preflight:green
```

---

## 📈 Success Metrics

**Before Pilot:**
- Fields with wrong primitive: 7/23 (30%)
- CheckboxField: Uses `.ds-input` (text input styling)
- User confusion: High (checkbox looks like text field)

**After Pilot:**
- Fields with wrong primitive: 6/23 (26%)
- CheckboxField: Uses `.ds-checkbox` (proper checkbox styling)
- User confusion: Zero for checkbox
- Pattern established: Ready to repeat for 6 remaining fields

---

## 🚀 Next Steps

Once this pilot lands cleanly:

### Repeat for 6 Remaining Fields

**Priority Order:**

1. **ToggleField** (HIGH) - Toggle switch looks like text input
2. **RatingField** (HIGH) - Star rating looks like text input
3. **SliderField** (MEDIUM) - Range slider needs custom styling
4. **FileField** (MEDIUM) - File upload needs drag-drop zone
5. **MultiSelectField** (MEDIUM) - Multi-select needs tag UI
6. **ColorField** (LOW) - Color picker works but could show swatch

**Pattern:**
1. Create DS primitive (`.ds-toggle`, `.ds-rating`, etc.)
2. Create recipe (`ToggleRecipe`, `RatingRecipe`, etc.)
3. Update generator dispatch
4. Add refiner transform
5. Regenerate field
6. Test & commit

**Estimated Timeline:**
- CheckboxField (pilot): 2-3 hours ✅
- Remaining 6 fields: 1-2 hours each (pattern established)
- Total Phase 1: ~12-15 hours
- Completion: Week of 2025-10-30

---

## ❓ Troubleshooting

### CSS not applied
- Verify `ds-checkbox.css` is imported in DS styles entry point
- Run `pnpm --filter @intstudio/ds build`
- Check browser DevTools: `.ds-checkbox` class should have styles

### TypeScript errors
- Verify `CheckboxRecipe.ts` is in correct location
- Check import path in `field-from-spec-v2.mjs`
- Run `pnpm --filter @intstudio/forms typecheck`

### Refiner not running
- Verify transform is registered in refiner config
- Check `appliesTo` function returns true for checkbox specs
- Run with `--verbose` flag for debugging

### Generator not using recipe
- Verify `selectRecipe()` is called before existing generator logic
- Check `type` value in spec (should be 'checkbox')
- Add console.log to debug dispatch

---

**Questions?** Review `scripts/ai_out/checkbox-pilot/README.md` for detailed checklist.
