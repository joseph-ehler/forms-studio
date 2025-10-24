# Touch Target Fixes - WCAG 2.5.5

**Date:** 2025-10-23  
**Issue:** Multiple components fail 44×44px minimum touch target requirement  
**Standard:** WCAG 2.1 Level AAA (2.5.5)

---

## Issues Found

### 1. Checkbox: 18×18px ❌
**Current:** Visual size 18px  
**Required:** 44×44px interactive area  
**Impact:** 15% of users (motor disabilities)

### 2. Toggle: 40×22px ❌
**Current:** Visual size 40×22px  
**Required:** 44×44px interactive area  
**Impact:** 15% of users

### 3. Demo Buttons: 36px height ❌
**Current:** Submit/Log buttons 36px height  
**Required:** 44px minimum  
**Impact:** 15% of users

### 4. Submit Button Contrast: 3.68:1 ❌
**Current:** Blue button (#3b82f6) on white fails contrast  
**Required:** 4.5:1 minimum  
**Impact:** 4% of users (low vision)

---

## Solution Strategy

### Approach 1: Padding Wrapper (Preferred)
Wrap small controls in labels with 44×44px hit area:

```tsx
<label style={{ 
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: '44px',
  minWidth: '44px',
  cursor: 'pointer'
}}>
  <input type="checkbox" className="ds-checkbox" />
  <span>Label text</span>
</label>
```

**Pros:**
- Visual size stays compact (18px checkbox looks right)
- Touch area meets requirements
- No breaking changes to CSS

**Cons:**
- Requires component updates

### Approach 2: Increase Visual Size
Make checkboxes/toggles actually 44px:

```css
.ds-checkbox {
  width: 44px;
  height: 44px;
}
```

**Pros:**
- Simpler implementation
- No wrapper needed

**Cons:**
- Looks too large on desktop
- Breaking visual change
- Users expect compact controls

---

## Selected Approach: Padding Wrapper ✅

**Rationale:**
- Best of both worlds: compact visuals + accessible touch
- Industry standard (iOS/Android use this pattern)
- No breaking changes to existing designs

---

## Implementation

### CheckboxField
```tsx
<label
  htmlFor={name}
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '44px',
    padding: '8px 0',
    cursor: 'pointer',
  }}
>
  <input type="checkbox" className="ds-checkbox" id={name} />
  <span>{label}</span>
</label>
```

### ToggleField
```tsx
<label
  htmlFor={name}
  style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.75rem',
    minHeight: '44px',
    padding: '11px 0', // (44 - 22) / 2
    cursor: 'pointer',
  }}
>
  <input type="checkbox" role="switch" className="ds-toggle" id={name} />
  <span>{label}</span>
</label>
```

### Demo Buttons
```tsx
<button
  type="submit"
  style={{
    padding: '12px 20px', // 44px height
    minHeight: '44px',
    background: '#2563eb', // Darker blue for contrast
    // ... rest
  }}
>
```

---

## Verification

### Before
- Checkbox: 18×18px touch area
- Toggle: 40×22px touch area
- Buttons: 36px height

### After
- Checkbox: 44×44px touch area ✅
- Toggle: 44×44px touch area ✅
- Buttons: 44px minimum height ✅

---

## Related Standards

**WCAG 2.5.5 Target Size (Level AAA):**
> The size of the target for pointer inputs is at least 44 by 44 CSS pixels

**Exceptions:**
- Inline text links (don't need 44px)
- User agent controls (browser default)
- Essential presentation (can't be larger)

**Our fields: NOT exceptions** - must comply.

---

## Files to Update

1. `packages/forms/src/fields/CheckboxField/CheckboxField.tsx`
2. `packages/forms/src/fields/ToggleField/ToggleField.tsx`
3. `packages/demo-app/src/FieldShowcase.tsx` (buttons)

---

## Testing Checklist

- [ ] Touch targets measured in browser (44×44px)
- [ ] Mobile tap testing (iOS Safari, Android Chrome)
- [ ] Desktop mouse click (should still work)
- [ ] Visual appearance unchanged (18px checkbox, 40px toggle)
- [ ] A11y validator passes

---

**Status:** Ready to implement
