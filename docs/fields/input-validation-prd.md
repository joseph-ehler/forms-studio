# Input Validation UX - Product Requirements Document

**Status:** Critical - Fixing Inconsistency  
**Priority:** P0 (Blocking)  
**Date:** 2025-10-23

---

## Problem Statement

**User Report:** "Green validation is inconsistent - some fields show green on empty/touch, email doesn't validate green when valid, phone stays green after clicking out."

**Root Cause:** CSS using HTML5 `:valid` pseudo-class which triggers on ANY valid state, including empty fields.

**Impact:** 
- Confusing UX (green on empty fields)
- Inconsistent behavior across field types
- No control over when validation shows
- Breaks user trust in validation system

---

## Core Principle

**Validation states MUST be intentional, controlled, and consistent.**

❌ **NEVER use HTML5 `:valid/:invalid` pseudo-classes**  
✅ **ALWAYS use explicit classes from form validation library (React Hook Form)**

---

## Validation State Rules

### When to Show Validation

**Rule 1: Never validate on first render**
- Fields start neutral (no green/red)
- User hasn't interacted yet
- Don't show success on empty required fields

**Rule 2: Validate on blur (after user leaves field)**
- User typed something → validate when they leave
- Show error immediately if invalid
- Show success if valid AND field has content

**Rule 3: Validate on submit**
- Show all errors on submit attempt
- Keep errors visible until fixed
- Clear error when user starts typing (optional)

**Rule 4: Real-time validation (optional)**
- Only for specific use cases (password strength, username availability)
- Must be debounced (300-500ms)
- Show loading state while checking

---

## State Matrix

| Field State | Border | Background | Icon | When to Show |
|-------------|--------|------------|------|--------------|
| **Neutral** | Subtle gray | White | None | Default, pristine |
| **Focus** | Primary blue | Subtle tint | None | User typing |
| **Error** | Red | Red tint (5%) | ❌ | After blur + invalid |
| **Success** | Green | Green tint (5%) | ✓ | After blur + valid + has content |
| **Warning** | Amber | Amber tint (5%) | ⚠️ | Soft validation |
| **Disabled** | Dashed gray | Gray | None | Not editable |
| **Readonly** | Dashed gray | Raised gray | None | View only |
| **Loading** | Blue | Subtle tint | ⏳ | Async validation |

---

## Implementation: React Hook Form Integration

### Field Component Pattern

```tsx
export function TextField({ name, control, errors, ...props }: FieldProps) {
  const err = errors?.[name];
  const hasError = Boolean(err);
  
  // Get field state from RHF
  const fieldState = control.getFieldState(name);
  const { isDirty, isTouched, invalid } = fieldState;
  
  // Determine visual state
  const showError = hasError && isTouched;
  const showSuccess = !invalid && isTouched && isDirty && field.value;
  
  return (
    <input
      className={cn(
        'ds-input',
        showError && 'ds-input--error',
        showSuccess && 'ds-input--success'
      )}
      aria-invalid={showError || undefined}
      {...field}
    />
  );
}
```

### Key Logic

```tsx
// NEVER show validation states on pristine fields
const showValidation = isTouched || isSubmitted;

// Error: After touch AND has error
const showError = showValidation && hasError;

// Success: After touch AND valid AND has content
const showSuccess = showValidation && !hasError && field.value && field.value.length > 0;

// Warning: Custom logic (e.g., weak password)
const showWarning = showValidation && customWarningCondition;
```

---

## CSS Class API

### Required Classes

```css
/* Base state */
.ds-input { }

/* Explicit validation states (controlled by JS) */
.ds-input--error { }
.ds-input--success { }
.ds-input--warning { }
.ds-input--loading { }

/* Interactive states (automatic) */
.ds-input:hover { }
.ds-input:focus { }
.ds-input:disabled { }
.ds-input:read-only { }
```

### BANNED Selectors

```css
/* ❌ NEVER USE - Too aggressive */
.ds-input:valid { }
.ds-input:invalid { }
.ds-input:required { }

/* These trigger on empty fields and cause confusion */
```

---

## Field Type Specific Rules

### Email Field
- **Error:** Show after blur if invalid email format
- **Success:** Show after blur if valid email AND has content
- **Never:** Show green on empty field

```tsx
// Email validation example
const showSuccess = 
  isTouched && 
  !errors.email && 
  field.value && 
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
```

### Phone Field
- **Error:** Show after blur if invalid format
- **Success:** Show after blur if valid format AND has content
- **Never:** Show green just from clicking in/out

```tsx
// Phone validation example
const showSuccess = 
  isTouched && 
  !errors.phone && 
  field.value && 
  field.value.length >= 10;
```

### Number Field
- **Error:** Show after blur if out of range or non-numeric
- **Success:** Show after blur if valid number AND in range
- **Never:** Show green on empty optional field

```tsx
// Number validation example
const showSuccess = 
  isTouched && 
  !errors.age && 
  field.value && 
  field.value >= 18;
```

### Required Fields
- **Error:** Show after submit attempt OR after blur if empty
- **Success:** Show after blur if valid AND has content
- **Never:** Show success indicator on empty required field

---

## Visual Feedback Timing

### Immediate (0ms)
- Focus ring appears
- Border color changes
- Hover effects

### Fast (150ms)
- Background color transitions
- Border color transitions
- Icon fade in/out

### Medium (300ms)
- Error shake animation
- Success checkmark animation

### Slow (500ms)
- Debounced async validation
- Loading spinner appears

---

## Accessibility Requirements

### ARIA Attributes

```tsx
<input
  aria-invalid={showError}
  aria-describedby={showError ? `${name}-error` : undefined}
  aria-required={required}
/>

{showError && (
  <span id={`${name}-error`} role="alert" aria-live="polite">
    {errorMessage}
  </span>
)}
```

### Screen Reader Announcements

- **Error:** "Email field, invalid. Please enter a valid email address."
- **Success:** "Email field, valid."
- **Loading:** "Email field, checking availability..."

---

## Migration Plan

### Phase 1: Fix CSS (DONE)
- ✅ Remove `:valid/:invalid` selectors
- ✅ Keep explicit `.ds-input--error/success` classes
- ✅ Document why HTML5 validation is disabled

### Phase 2: Update All Fields (Next)
- [ ] Audit all field components
- [ ] Add proper validation state logic
- [ ] Test each field type individually
- [ ] Verify consistency across all fields

### Phase 3: Add Visual Tests
- [ ] Playwright snapshots for each state
- [ ] Test email, phone, number separately
- [ ] Verify no green on empty fields
- [ ] Verify no green on click-in-click-out

---

## Testing Checklist

### Per Field Type

**Email Field:**
- [ ] Empty → Neutral (no color)
- [ ] Type invalid → Blur → Red error
- [ ] Type valid → Blur → Green success
- [ ] Delete content → Red error (if required)
- [ ] Click in/out empty → Neutral (no green!)

**Phone Field:**
- [ ] Empty → Neutral (no color)
- [ ] Type partial → Blur → Red error
- [ ] Type valid → Blur → Green success
- [ ] Click in/out empty → Neutral (no green!)

**Number Field:**
- [ ] Empty → Neutral (no color)
- [ ] Type below min → Blur → Red error
- [ ] Type valid → Blur → Green success
- [ ] Type above max → Blur → Red error

**Required Text:**
- [ ] Empty → Blur → Red error
- [ ] Type content → Blur → Green success
- [ ] Clear content → Red error

---

## Success Criteria

✅ **Consistency:** All fields behave identically  
✅ **No False Positives:** Never green on empty fields  
✅ **Intentional:** Only show validation after user interaction  
✅ **Clear:** Users understand what's wrong and how to fix it  
✅ **Delightful:** Smooth animations, positive reinforcement  

---

## Related Documents

- [Input Styling Audit](../ds/INPUT_STYLING_AUDIT.md)
- [Field Creation Checklist](../handbook/FIELD_CREATION_CHECKLIST.md)
- [WCAG Refiner Enhancement](../refiner/GOD_TIER_WCAG_REFINER.md)

---

**Next:** Update all field components to follow this validation logic consistently.
