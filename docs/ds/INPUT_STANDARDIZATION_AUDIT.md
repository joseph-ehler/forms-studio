# Input Standardization Audit

**Date:** 2025-10-24  
**Priority:** P0 - Critical Inconsistency  
**Status:** Audit Complete → Fixes Needed

---

## Problem Statement

**User Report:** "Why isn't the search input in the overlay for dropdown using input? And why is dropdown input box different than the rest?"

**Finding:** Multiple components render `<input>` elements with **inline styles** instead of using `.ds-input` class, causing visual inconsistencies.

---

## Inconsistency Matrix

| Component | Uses `.ds-input`? | Uses Inline Styles? | Location | Impact |
|-----------|------------------|---------------------|----------|--------|
| **TextField** | ✅ Yes | ❌ No | `packages/forms/src/fields/TextField` | GOOD |
| **EmailField** | ✅ Yes | ❌ No | `packages/forms/src/fields/EmailField` | GOOD |
| **NumberField** | ✅ Yes | ❌ No | `packages/forms/src/fields/NumberField` | GOOD |
| **PickerSearch** | ❌ NO | ✅ YES | `packages/ds/src/components/picker/PickerSearch.tsx` | **BAD** |
| **SelectField trigger** | ⚠️ Partial | ⚠️ Partial | `packages/forms/src/fields/SelectField/SelectField.tsx` | **BAD** |

---

## Critical Issue: PickerSearch

**File:** `packages/ds/src/components/picker/PickerSearch.tsx`  
**Lines:** 88-109

### Current (WRONG):
```tsx
<input
  type="text"
  style={{
    width: '100%',
    paddingLeft: '40px',
    paddingRight: '40px',
    paddingTop: '10px',
    paddingBottom: '10px',
    minHeight: '44px',
    fontSize: '14px',
    color: 'var(--ds-color-text-primary)',
    backgroundColor: 'var(--ds-color-surface-subtle)', // ❌ Different!
    border: '1px solid var(--ds-color-border-subtle)',
    borderRadius: '8px', // ❌ Different! (should be 6px)
    outline: 'none',
  }}
  onFocus={(e) => {
    e.target.style.borderColor = 'var(--ds-color-border-focus)';
    e.target.style.boxShadow = `0 0 0 3px color-mix(in oklab, var(--ds-color-border-focus), transparent 85%)`; // ❌ Different!
  }}
/>
```

### Problems:
1. ❌ **Background:** Uses `surface-subtle` instead of `surface-base`
2. ❌ **Border Radius:** Uses `8px` instead of `6px`
3. ❌ **Focus Ring:** Uses `3px` + `color-mix` instead of `2px` + `primary-bg`
4. ❌ **No Hover State:** Missing hover background change
5. ❌ **Inline Styles:** Doesn't benefit from design system updates
6. ❌ **No Validation States:** Can't show error/success

### Should Be:
```tsx
<input
  type="text"
  className="ds-input"
  style={{
    paddingLeft: '40px', // Only override for search icon
    paddingRight: '40px' // Only override for clear button
  }}
/>
```

---

## Critical Issue: SelectField Trigger

**File:** `packages/forms/src/fields/SelectField/SelectField.tsx`  
**Lines:** ~150-200 (estimate)

### Current (WRONG):
```tsx
<button
  className="ds-input" // ✅ Uses class
  style={{
    position: 'relative',
    padding: '12px 40px 12px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    color: 'var(--ds-color-text-primary)', // ⚠️ Inline override
    textAlign: 'left',
    cursor: 'pointer',
  }}
>
```

### Problems:
1. ⚠️ **Partial Inline Styles:** Mixes class + inline styles
2. ❌ **Not Actually an Input:** Using `<button>` with `.ds-input` class
3. ⚠️ **Color Override:** Inline color might conflict with validation states
4. ⚠️ **Different Structure:** Button semantics vs input semantics

### Should Be:
Either:
- **Option A:** Create `.ds-select-trigger` class (better)
- **Option B:** Use `.ds-input` but remove inline overrides

---

## All Input-Rendering Components

### ✅ GOOD (Using `.ds-input` correctly)

**Text Inputs:**
- TextField
- EmailField  
- NumberField
- TelField
- DateField
- DateTimeField
- ColorField
- FileField
- SliderField (uses `<input type="range">`)

**Composite:**
- EmailEnhancedField
- PasswordField
- PhoneField
- SearchField
- CurrencyField
- OTPField

### ❌ BAD (NOT using `.ds-input`)

1. **PickerSearch** - Inline styles (CRITICAL)
2. **SelectField trigger** - Partial inline styles
3. **TagInputField** - Need to audit
4. **MultiSelectField** - Need to audit
5. **RadioGroupField** - Uses `<input type="radio">` (needs `.ds-radio` class?)
6. **CheckboxField** - Uses custom checkbox primitive (OK)

---

## Additional Issues Found

### 1. No Validation Icons

Current: Validation shows only via border color  
Should: Add optional checkmark (✓) or error (✗) icons inside input

```tsx
// Proposed API
<input
  className="ds-input ds-input--success"
  aria-invalid="false"
/>
{showSuccess && (
  <span className="ds-input-icon ds-input-icon--success">
    <CheckIcon />
  </span>
)}
```

### 2. Placeholder Inconsistency

Some fields use inline placeholder styling, others rely on CSS.  
Should: All use `.ds-input::placeholder` from design system.

### 3. Search Input Type

PickerSearch uses `type="text"` instead of `type="search"`.  
Should: Use `type="search"` for semantic correctness + mobile keyboard.

---

## Standardization Plan

### Phase 1: Fix PickerSearch (IMMEDIATE)

**Priority:** P0  
**Impact:** High - affects all select/picker overlays

1. Remove all inline styles from `PickerSearch.tsx`
2. Add `className="ds-input"` 
3. Keep only icon positioning styles
4. Test in SelectField, MultiSelectField, DateRangePicker

**Files:**
- `packages/ds/src/components/picker/PickerSearch.tsx`

**Test:**
- SelectField overlay search
- MultiSelectField overlay search
- DateRangePicker overlay search

### Phase 2: Fix SelectField Trigger (HIGH)

**Priority:** P1  
**Impact:** Medium - only affects SelectField appearance

**Decision Needed:** Should select trigger be:
- **Option A:** `.ds-select-trigger` (new class extending `.ds-input` styles)
- **Option B:** `.ds-input` (remove inline overrides)

**Recommendation:** Option A - buttons and inputs have different interaction patterns.

### Phase 3: Add Validation Icons (MEDIUM)

**Priority:** P2  
**Impact:** Low - enhancement, not breaking

1. Create `.ds-input-icon` wrapper class
2. Add icon variants: `--success`, `--error`, `--warning`
3. Position icons inside input (absolute positioned)
4. Add to relevant fields (Email, Password, etc.)

### Phase 4: Audit Remaining Fields (LOW)

**Priority:** P3  
**Impact:** Low - mostly edge cases

- TagInputField
- MultiSelectField
- RadioGroupField
- Any other custom input implementations

---

## Design System Rules

### ✅ DO:

1. **Always use `.ds-input` for text inputs**
2. **Only override positioning/spacing for icons**
3. **Never override colors, borders, or backgrounds**
4. **Let validation classes handle states**
5. **Use `type="search"` for search inputs**

### ❌ DON'T:

1. **Never use inline styles for visual properties**
2. **Don't mix `.ds-input` with inline style overrides**
3. **Don't create one-off input styles**
4. **Don't duplicate hover/focus logic**
5. **Don't hardcode colors or tokens**

---

## Implementation Checklist

### Immediate (Today)

- [ ] Fix PickerSearch inline styles → `.ds-input`
- [ ] Test SelectField overlay search
- [ ] Test MultiSelectField overlay search
- [ ] Test DateRangePicker overlay search
- [ ] Verify hover/focus states work
- [ ] Verify validation states work

### This Week

- [ ] Decide on SelectField trigger approach
- [ ] Create `.ds-select-trigger` class (if Option A)
- [ ] Update SelectField to use new class
- [ ] Remove inline style overrides
- [ ] Test keyboard navigation
- [ ] Test ARIA attributes

### Next Sprint

- [ ] Design validation icon system
- [ ] Implement `.ds-input-icon` primitives
- [ ] Add icons to EmailField
- [ ] Add icons to PasswordField
- [ ] Add icons to SearchField
- [ ] Visual regression tests

---

## Success Metrics

**Before:**
- 2 components use inline styles
- SelectField trigger uses mixed approach
- No validation icons
- Inconsistent focus/hover behavior

**After:**
- 0 components use inline styles
- All inputs use `.ds-input` or approved variants
- Validation icons available
- Consistent hover/focus across all inputs

---

## Related Documents

- [Input Validation PRD](../fields/input-validation-prd.md)
- [Input Styling Audit](./INPUT_STYLING_AUDIT.md)
- [Design System Primitives](./primitives/README.md)

---

**Next Action:** Fix PickerSearch.tsx to use `.ds-input` class.
