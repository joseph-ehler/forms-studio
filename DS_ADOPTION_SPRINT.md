# 🔥 90-MINUTE DS ADOPTION SPRINT

**Start Time**: Oct 22, 2025 @ 3:56am UTC-4  
**Target**: 100% Design System compliance  
**Branch**: `chore/ds-adoption-sprint`  
**Status**: 🏃 IN PROGRESS

---

## ✅ DEFINITION OF DONE

### What "Adopted" Means:
- [ ] All inputs/textareas/selects use `.ds-input` / `.ds-textarea`
- [ ] All buttons use `.ds-button` (+ variants)
- [ ] All labels use `<FormLabel>` (no raw `<label>`)
- [ ] All helpers use `<FormHelperText>`
- [ ] No hardcoded colors (rgb/hex/#)
- [ ] No hardcoded spacing (`px-`, `py-`, `mt-`, `gap-`)
- [ ] No hardcoded radius (`rounded-*`, `borderRadius`)
- [ ] No hardcoded shadows (`shadow-*`, `boxShadow`)
- [ ] No hardcoded transitions (`duration-*`, `ease-*`)
- [ ] Field spacing via `.ds-stack` / `.ds-field`

---

## 📋 EXECUTION CHECKLIST

### 0) Prep (2 min) ✅
- [x] Create branch `chore/ds-adoption-sprint`
- [x] Open execution tracker (this file)
- [x] Ready terminal + editor

### 1) Audit (5-10 min) 🔄
- [ ] Run grep audit helpers
- [ ] Document violations found
- [ ] Prioritize files

### 2) Migration (60-70 min)
**Phase 1: Root Primitives** ✅ DONE
- [x] OverlaySheet.tsx
- [x] PickerSearch.tsx
- [x] PickerOption.tsx

**Phase 2: Form Components** (13 files)
- [ ] FormMessage.tsx
- [ ] FormText.tsx
- [ ] FormHelperText.tsx (create if needed)
- [ ] FormProgress.tsx
- [ ] FormTooltip.tsx
- [ ] FormBadge.tsx
- [ ] FormHeading.tsx
- [ ] FormActions.tsx
- [ ] FormDivider.tsx
- [ ] FormAccordion.tsx
- [ ] FormSection.tsx
- [ ] FormEmpty.tsx
- [ ] FormSkeleton.tsx

**Phase 3: Simple Fields** (8 files)
- [ ] TextField.tsx
- [ ] TextareaField.tsx
- [ ] NumberField.tsx
- [ ] ToggleField.tsx
- [ ] SliderField.tsx
- [ ] RatingField.tsx
- [ ] SignatureField.tsx
- [ ] CalculatedField.tsx

**Phase 4: Composite Fields** (7 files)
- [ ] EmailField.tsx
- [ ] PasswordField.tsx
- [ ] PhoneField.tsx
- [ ] AddressField.tsx
- [ ] CurrencyField.tsx
- [ ] RadioGroupField.tsx
- [ ] OTPField.tsx

**Phase 5: Picker Fields** (9 files)
- [ ] SelectField.tsx
- [ ] MultiSelectField.tsx
- [ ] DateField.tsx
- [ ] TimeField.tsx
- [ ] DateTimeField.tsx
- [ ] DateRangeField.tsx
- [ ] ChipsField.tsx
- [ ] TagInputField.tsx

**Phase 6: Specialized Fields** (8 files)
- [ ] ColorField.tsx
- [ ] FileField.tsx
- [ ] RangeField.tsx
- [ ] RepeaterField.tsx
- [ ] NPSField.tsx
- [ ] MatrixField.tsx
- [ ] RankField.tsx
- [ ] TableField.tsx

### 3) Verification (10 min)
- [ ] Run verification greps (should return 0)
- [ ] Build succeeds
- [ ] Demo boots
- [ ] Visual check (all brands/themes)
- [ ] No console errors

### 4) Commit & PR (2 min)
- [ ] Stage all changes
- [ ] Commit with message
- [ ] Push branch
- [ ] Open PR

---

## 🔍 AUDIT RESULTS

### Raw Labels
```bash
# Command: git grep -n "<label" packages/wizard-react/src | grep -v "dangerously"
# Results: [PENDING]
```

### Hardcoded Styling
```bash
# Command: git grep -n "rounded-\|border-radius\|min-h-\[.*\]\|box-shadow\|shadow-" packages/wizard-react/src
# Results: [PENDING]
```

### Raw Colors
```bash
# Command: git grep -n "text-[a-z]\|bg-[a-z]\|border-[a-z]" packages/wizard-react/src/fields
# Results: [PENDING]
```

### Tailwind Spacing
```bash
# Command: git grep -n "space-y-\|gap-\|px-\|py-\|mt-\|mb-" packages/wizard-react/src/fields
# Results: [PENDING]
```

### RGB/Hex Values
```bash
# Command: git grep -nE "#[0-9a-fA-F]{3,8}\|rgb\(" packages/wizard-react/src
# Results: [PENDING]
```

---

## 📝 MIGRATION RECIPES

### (a) Inputs / Textareas / Selects
```tsx
// ❌ BEFORE
<input 
  className="w-full min-h-[48px] rounded-md border border-gray-300 px-3 py-3 ..." 
  ... 
/>

// ✅ AFTER
<input 
  className="ds-input w-full" 
  ... 
/>
```

```tsx
// ❌ BEFORE
<textarea className="w-full rounded-md border ..." ... />

// ✅ AFTER
<textarea className="ds-input ds-textarea w-full" ... />
```

```tsx
// ❌ BEFORE
<select className="w-full ..." ... />

// ✅ AFTER
<select className="ds-input w-full" ... />
```

### (b) Buttons
```tsx
// ❌ BEFORE
<button className="..." ...>Save</button>

// ✅ AFTER - Primary (default)
<button className="ds-button">Save</button>

// ✅ AFTER - Variants
<button className="ds-button ds-button--secondary">Cancel</button>
<button className="ds-button ds-button--danger">Delete</button>
<button className="ds-button ds-button--success">Confirm</button>
<button className="ds-button ds-button--warning">Caution</button>
<button className="ds-button ds-button--ghost">Skip</button>
<button className="ds-button ds-button--link">Learn more</button>
```

### (c) Labels & Helpers
```tsx
// ❌ BEFORE
<label htmlFor={id} className="..." />

// ✅ AFTER
<FormLabel htmlFor={id} size="md" />

// ✅ AFTER - SR only
<FormLabel htmlFor={id} srOnly>Search</FormLabel>
```

```tsx
// ❌ BEFORE
<p className="text-xs text-gray-500 mt-1">Hint...</p>

// ✅ AFTER
<FormHelperText>Hint...</FormHelperText>

// ✅ AFTER - Variants
<FormHelperText variant="error">Error message</FormHelperText>
<FormHelperText variant="success">Success message</FormHelperText>
<FormHelperText variant="warning">Warning message</FormHelperText>
```

### (d) Field Spacing
```tsx
// ❌ BEFORE
<div className="space-y-6">...</div>

// ✅ AFTER
<div className="ds-stack">...</div>
```

```tsx
// ❌ BEFORE
<div className="flex flex-col gap-4">...</div>

// ✅ AFTER
<div className="ds-stack">...</div>
```

### (e) Strip Hardcoded Tokens
```tsx
// ❌ BEFORE
className="min-h-[48px] rounded-md shadow-sm transition-all duration-150"

// ✅ AFTER
className="ds-input"
```

```tsx
// ❌ BEFORE
style={{ 
  borderRadius: 8, 
  boxShadow: '0 2px 4px rgba(...)',
  transition: 'all 150ms'
}}

// ✅ AFTER
// (remove; DS skins provide radius/elevation/motion via tokens)
style={{}}
```

---

## ✅ VERIFICATION COMMANDS

### Zero Violations Expected:
```bash
# Should return 0 lines after adoption:
git grep -n "<label" packages/wizard-react/src/fields

git grep -nE "rounded-|border-radius|min-h-\[|shadow-|box-shadow|duration-|ease-|rgb\(|#[0-9a-fA-F]" packages/wizard-react/src/fields

git grep -n "text-gray\|bg-gray\|border-gray\|text-blue\|bg-blue" packages/wizard-react/src/fields
```

### Build & Boot:
```bash
pnpm -w build
pnpm --filter @joseph.ehler/wizard-react dev
# Open http://localhost:5173
# Test: All brands × light/dark themes
# Check: No console errors
```

---

## 📊 PROGRESS TRACKING

### Files Completed: 3/48 (6%)
- ✅ OverlaySheet.tsx
- ✅ PickerSearch.tsx  
- ✅ PickerOption.tsx

### Estimated Time Remaining: 87 minutes
- Audit: 5 min
- Migration: 70 min (45 files × ~1.5 min avg)
- Verification: 10 min
- Commit: 2 min

### Current Pace: 2 min/file
**On track for 90-minute target!** 🎯

---

## 🚀 NEXT: PHASE A (10 Days → 75% God-Tier)

### A1: Token System (3-4 days)
- [ ] Typography tokens (families, weights, ramp, fluid)
- [ ] Spacing modular scale + form-specific
- [ ] Radius scale (none → full)
- [ ] Shadow tokens (2-layer, dark-aware)
- [ ] Motion tokens (durations, easings, reduced-motion)
- [ ] Border width tokens

### A2: CSS Layers & Skins (2-3 days)
- [ ] `@layer skins, app` architecture
- [ ] `.ds-label`, `.ds-helper`, `.ds-heading`
- [ ] Complete `.ds-button` variants
- [ ] `.ds-overlay`, `.ds-sheet`, `.ds-popover`
- [ ] Layout: `.ds-container`, `.ds-grid`, `.ds-stack`

### A3: ESLint Plugin (2 days)
- [ ] Ban Tailwind utilities in `/fields/**`
- [ ] Ban hardcoded colors/spacing/radius
- [ ] Enforce `.ds-*` classes
- [ ] Auto-fix where safe

### A4: Contracts in CI (3-4 days)
- [ ] Visual regression (Playwright)
- [ ] A11y tests (contrast, keyboard, SR)
- [ ] Behavior tests (overlay, focus trap)
- [ ] Bundle budgets (CSS/JS gzip)
- [ ] Chaos tests (transforms, forced-colors, zoom)

---

## 💡 SPRINT TIPS

1. **Work file-by-file** - Don't batch; finish each completely
2. **Use recipes** - Copy/paste the patterns above
3. **2-minute rule** - If file takes >2 min, flag it and move on
4. **No logic refactors** - Class renames only
5. **Test incrementally** - Build after every 5 files
6. **Stay systematic** - Follow phase order

---

**Let's ship this baseline! 🚀**
