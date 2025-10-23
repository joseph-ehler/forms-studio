# 🎯 DESIGN SYSTEM ADOPTION AUDIT

**Mission**: 100% DS token adoption at root level across ALL components  
**Approach**: Systematic, meticulous, foolproof  
**Status**: 🔄 **IN PROGRESS**

---

## 📊 AUDIT FINDINGS

### Scan Results
```
Total files scanned: 72
Hardcoded values found: 610 matches
Files needing attention: ~45 (excluding token definitions)
```

### Categories

#### ✅ LEGITIMATE (Token Definitions)
These files SHOULD have raw values:
- `tokens/colors.ts` (50 matches) - Raw color definitions
- `tokens/themes/dark.ts` (50 matches) - Theme definitions
- `tokens/color.semantic.ts` (16 matches) - Semantic mappings
- `styles/tokens/color.vars.css` - CSS variable definitions

#### 🔴 HIGH PRIORITY (Active Components)
Files used in production that need fixing:

**Fields** (35 files):
1. ColorField.tsx (54 matches) ⚠️ CRITICAL
2. TimeField.tsx (28 matches) ⚠️ HIGH
3. NPSField.tsx (16 matches)
4. TableField.tsx (16 matches)
5. FileField.tsx (15 matches)
6. MultiSelectField.tsx (15 matches)
7. MatrixField.tsx (13 matches)
8. RankField.tsx (13 matches)
9. AddressField.tsx (12 matches)
10. RepeaterField.tsx (11 matches)
11. CurrencyField.tsx (11 matches)
12. PasswordField.tsx (10 matches)
13. DateRangeField.tsx (9 matches)
14. RangeField.tsx (8 matches)
15. ChipsField.tsx (7 matches)
16. PhoneField.tsx (7 matches)
17. RadioGroupField.tsx (7 matches)
18. RatingField.tsx (6 matches)
19. SliderField.tsx (6 matches)
20. TagInputField.tsx (6 matches)
21. ToggleField.tsx (6 matches)
22. OTPField.tsx (6 matches)
23. CalculatedField.tsx (5 matches)
24. SignatureField.tsx (5 matches)

**Components** (21 files):
1. FormMessage.tsx (11 matches)
2. FormText.tsx (11 matches)
3. FormProgress.tsx (7 matches)
4. FormTooltip.tsx (7 matches)
5. FormActions.tsx (6 matches)
6. FormBadge.tsx (6 matches)
7. FormHeading.tsx (6 matches)
8. PickerSearch.tsx (6 matches)
9. FormAccordion.tsx (5 matches)
10. FormDivider.tsx (5 matches)
11. OverlaySheet.tsx (5 matches)
12. PickerOption.tsx (5 matches)
13. FormEmpty.tsx (4 matches)
14. FormHelperText.tsx (4 matches)
15. FormSection.tsx (4 matches)
16. FormSkeleton.tsx (4 matches)

#### 🟡 MEDIUM PRIORITY (Parked/Old)
- `_parked/` files - Can defer
- `.old.tsx` files - Can defer

---

## 🔧 SYSTEMATIC FIX STRATEGY

### Phase 1: Root Primitives (CRITICAL)
**Goal**: Fix overlay/picker primitives first - they affect everything

Files:
- [ ] `OverlaySheet.tsx` (5 matches)
- [ ] `PickerSearch.tsx` (6 matches)
- [ ] `PickerOption.tsx` (5 matches)

**Why First**: These are used by ALL picker-based fields (Select, MultiSelect, Date, etc.)

### Phase 2: Form Components (HIGH)
**Goal**: Fix reusable form components

Files:
- [ ] `FormMessage.tsx` (11 matches)
- [ ] `FormText.tsx` (11 matches)
- [ ] `FormHelperText.tsx` (4 matches)
- [ ] `FormProgress.tsx` (7 matches)
- [ ] `FormTooltip.tsx` (7 matches)
- [ ] `FormBadge.tsx` (6 matches)
- [ ] `FormHeading.tsx` (6 matches)
- [ ] `FormActions.tsx` (6 matches)
- [ ] `FormDivider.tsx` (5 matches)
- [ ] `FormAccordion.tsx` (5 matches)
- [ ] `FormSection.tsx` (4 matches)
- [ ] `FormEmpty.tsx` (4 matches)
- [ ] `FormSkeleton.tsx` (4 matches)

**Why Second**: Used across multiple fields

### Phase 3: Simple Fields (MEDIUM)
**Goal**: Fix fields with few dependencies

Files:
- [ ] `TextField.tsx`
- [ ] `TextareaField.tsx`
- [ ] `NumberField.tsx`
- [ ] `ToggleField.tsx` (6 matches)
- [ ] `SliderField.tsx` (6 matches)
- [ ] `RatingField.tsx` (6 matches)
- [ ] `SignatureField.tsx` (5 matches)
- [ ] `CalculatedField.tsx` (5 matches)

### Phase 4: Composite Fields (MEDIUM-HIGH)
**Goal**: Fix complex fields

Files:
- [ ] `EmailField.tsx`
- [ ] `PasswordField.tsx` (10 matches)
- [ ] `PhoneField.tsx` (7 matches)
- [ ] `AddressField.tsx` (12 matches)
- [ ] `CurrencyField.tsx` (11 matches)
- [ ] `RadioGroupField.tsx` (7 matches)
- [ ] `OTPField.tsx` (6 matches)

### Phase 5: Picker-Heavy Fields (HIGH)
**Goal**: Fix fields that use picker primitives

Files:
- [ ] `SelectField.tsx`
- [ ] `MultiSelectField.tsx` (15 matches)
- [ ] `DateField.tsx`
- [ ] `TimeField.tsx` (28 matches) ⚠️
- [ ] `DateTimeField.tsx`
- [ ] `DateRangeField.tsx` (9 matches)
- [ ] `ChipsField.tsx` (7 matches)
- [ ] `TagInputField.tsx` (6 matches)

### Phase 6: Specialized Fields (MEDIUM)
**Goal**: Fix specialized/complex fields

Files:
- [ ] `ColorField.tsx` (54 matches) ⚠️ SPECIAL CASE
- [ ] `FileField.tsx` (15 matches)
- [ ] `RangeField.tsx` (8 matches)
- [ ] `RepeaterField.tsx` (11 matches)
- [ ] `NPSField.tsx` (16 matches)
- [ ] `MatrixField.tsx` (13 matches)
- [ ] `RankField.tsx` (13 matches)
- [ ] `TableField.tsx` (16 matches)

---

## 🎯 TOKEN REPLACEMENT PATTERNS

### Colors
```tsx
// ❌ BEFORE - Hardcoded
className="bg-white text-gray-900 border-gray-200"
style={{ color: '#374151', backgroundColor: '#fff' }}
style={{ backgroundColor: 'rgb(249, 250, 251)' }}

// ✅ AFTER - Semantic tokens
className="ds-input" // Uses tokens internally
style={{ 
  color: 'var(--ds-color-text-primary)',
  backgroundColor: 'var(--ds-color-surface-base)',
  border: '1px solid var(--ds-color-border-subtle)'
}}
```

### Spacing
```tsx
// ❌ BEFORE
className="p-4 mt-2 gap-3"
style={{ padding: '16px', marginTop: '8px' }}

// ✅ AFTER
className="ds-field" // Uses tokens
style={{ 
  padding: 'var(--ds-spacing-md)',
  marginTop: 'var(--ds-spacing-sm)'
}}
```

### Radius
```tsx
// ❌ BEFORE
className="rounded-lg rounded-md"
style={{ borderRadius: '8px' }}

// ✅ AFTER
style={{ borderRadius: 'var(--ds-radius-md)' }}
```

### Shadows
```tsx
// ❌ BEFORE
className="shadow-sm shadow-lg"
style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}

// ✅ AFTER
style={{ boxShadow: 'var(--ds-shadow-sm)' }}
```

---

## 📋 AUDIT CHECKLIST (Per File)

For each component, check:

### Colors
- [ ] No `bg-*` Tailwind classes
- [ ] No `text-*` Tailwind classes
- [ ] No `border-*` Tailwind classes
- [ ] No `#hex` values
- [ ] No `rgb()` values (except in token files)
- [ ] Uses `var(--ds-color-*)` everywhere

### Spacing
- [ ] No hardcoded `px` values for padding/margin
- [ ] No `p-*`, `m-*`, `gap-*` Tailwind classes
- [ ] Uses `var(--ds-spacing-*)` or `ds-field` class

### Sizing
- [ ] No hardcoded heights (except min-height for touch targets)
- [ ] Uses `ds-input`, `ds-button` classes

### Radius
- [ ] No `rounded-*` Tailwind classes
- [ ] No hardcoded `borderRadius` values
- [ ] Uses `var(--ds-radius-*)`

### Shadows
- [ ] No `shadow-*` Tailwind classes
- [ ] No hardcoded `boxShadow` values
- [ ] Uses `var(--ds-shadow-*)`

### Typography
- [ ] No `text-sm`, `text-lg` Tailwind classes
- [ ] No `font-*` Tailwind classes
- [ ] Uses CSS variables or DS classes

---

## 🔍 DETECTION SCRIPT

```bash
# Find all hardcoded colors
grep -r "rgb(" src/fields src/components --include="*.tsx" | wc -l
grep -r "#[0-9a-fA-F]" src/fields src/components --include="*.tsx" | wc -l
grep -r "bg-\|text-\|border-" src/fields src/components --include="*.tsx" | wc -l

# Find hardcoded spacing
grep -r "p-[0-9]\|m-[0-9]\|gap-[0-9]" src/fields src/components --include="*.tsx" | wc -l

# Find hardcoded radius
grep -r "rounded-" src/fields src/components --include="*.tsx" | wc -l
```

---

## 📈 PROGRESS TRACKING

### Overall
- [ ] Phase 1: Root Primitives (0/3)
- [ ] Phase 2: Form Components (0/13)
- [ ] Phase 3: Simple Fields (0/8)
- [ ] Phase 4: Composite Fields (0/7)
- [ ] Phase 5: Picker-Heavy Fields (0/9)
- [ ] Phase 6: Specialized Fields (0/8)

### Metrics
```
Total Components: 48
Fixed: 0
Remaining: 48
Progress: 0%
```

---

## 🎯 SUCCESS CRITERIA

**A component is "DS Compliant" when**:
1. ✅ ZERO hardcoded colors
2. ✅ ZERO hardcoded spacing (except structural)
3. ✅ ZERO hardcoded radius
4. ✅ ZERO hardcoded shadows
5. ✅ Uses semantic tokens ONLY
6. ✅ Adapts to all 4 brands
7. ✅ Works in light/dark themes
8. ✅ Passes visual contract tests

---

## 🚀 EXECUTION PLAN

### Day 1: Root Primitives
- Fix OverlaySheet, PickerSearch, PickerOption
- Test with all brands × themes
- Visual regression tests

### Day 2: Form Components (Part 1)
- Fix FormMessage, FormText, FormHelperText
- Fix FormProgress, FormTooltip, FormBadge
- Test integration

### Day 3: Form Components (Part 2)
- Fix remaining form components
- Test across all fields

### Day 4: Simple Fields
- Fix TextField through CalculatedField
- Test individually

### Day 5: Composite Fields
- Fix EmailField through OTPField
- Integration tests

### Day 6: Picker Fields
- Fix SelectField through TagInputField
- Test picker interactions

### Day 7: Specialized Fields
- Fix ColorField through TableField
- Full system test

---

## 📝 NOTES

### Special Cases

**ColorField**: 
- 54 matches are mostly legitimate (color swatches)
- Need to ensure picker/UI uses tokens
- Color values themselves are user data

**TimeField**:
- 28 matches likely from time picker UI
- High priority for fixing

**NPSField, MatrixField, TableField**:
- Complex layouts
- May need custom token patterns

---

## 🎉 END GOAL

**100% Design System Adoption**:
- Every component uses semantic tokens
- Zero hardcoded values
- Perfect brand/theme adaptation
- Unbreakable, maintainable, scalable

**This is systematic excellence.** 🏆
