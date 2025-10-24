# Overlay/Sheet System - Complete Bug Audit

**Date**: 2025-10-24  
**Status**: Critical bugs identified, fixes pending  
**Scope**: OverlaySheet, OverlayPicker, PickerSearch, PickerList, PickerOption, Input primitives

---

## 🔴 CRITICAL BUGS

### 1. OverlaySheet NOT Fixed to Bottom of Viewport
**File**: `OverlaySheet.tsx` line 177  
**Current**: Sheet uses `position: fixed` but with `transform: translateY(${dragOffset}px)`  
**Problem**: Transform creates new stacking context and can break `bottom: 0` behavior  
**Impact**: Sheet bounces/floats instead of staying anchored to bottom  
**Root Cause**: Mixing `position: fixed` + `bottom: 0` + `transform` is unreliable

**Evidence**:
```tsx
// Line 177-188
<div
  className={`fixed bottom-0 left-0 right-0 flex flex-col ...`}
  style={{
    zIndex: getZIndex('sheet'),
    maxHeight: `min(${maxHeight}px, 90vh)`,
    transform: prefersReducedMotion ? 'none' : `translateY(${dragOffset}px)`,
    paddingBottom: 'env(safe-area-inset-bottom)',
    backgroundColor: 'var(--ds-color-surface-base)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
  }}
>
```

**Fix Required**:
- Use `top` with calculated value instead of `bottom: 0`
- OR remove `transform` and use `height` changes for drag feedback
- OR use `translate` CSS property (modern) instead of `transform`

---

### 2. PickerSearch Input Icon Overlap
**File**: `PickerSearch.tsx` lines 62-77, 80-94  
**Current**: Input has inline `paddingLeft: '40px'` but CSS class `.ds-input` might override  
**Problem**: CSS cascade + specificity war between inline styles and `.ds-input` class  
**Impact**: Search text overlaps with search icon on left side  
**Root Cause**: `.ds-input` class has base padding that conflicts with inline override

**Evidence**:
```tsx
// Line 62-77: Icon positioned at left: 0, pl-3 (12px)
<div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
  <svg style={{ width: '20px', height: '20px', color: 'var(--ds-color-text-muted)' }} ...>
  
// Line 80-94: Input with inline padding
<input
  className="ds-input"  // ← has default padding
  style={{
    paddingLeft: '40px',   // ← inline style (should win but might not)
    paddingRight: '40px',
  }}
/>
```

**From `ds-inputs.css`**:
```css
.ds-input {
  padding: var(--ds-space-3) var(--ds-space-4); /* 12px 16px */
}
```

**Fix Required**:
- Add utility class `.ds-input--with-icon-left` that sets `padding-left: 40px !important`
- OR use wrapper pattern with proper class composition
- OR move padding to className instead of inline style

---

### 3. List Items Insufficient Touch Target
**File**: `PickerOption.tsx` line 48  
**Current**: `minHeight: '44px'` is WCAG AA minimum  
**Problem**: With `padding: '10px 12px'`, actual clickable area might be compressed  
**Impact**: Hard to tap on mobile, especially with larger fonts or zoom  
**Root Cause**: minHeight doesn't guarantee touch target size when flexbox involved

**Evidence**:
```tsx
// Line 43-60
style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',   // ← vertical padding eats into minHeight
  minHeight: '44px',      // ← WCAG AA minimum
  fontSize: '14px',
  ...
}}
```

**Math**:
- minHeight: 44px
- padding top+bottom: 20px
- Content height: 24px (if font-size 14px + line-height)
- TOTAL: Could be > 44px OR compressed if content wraps

**Fix Required**:
- Increase `minHeight` to `48px` (WCAG AAA preferred)
- OR use `height: 44px` (fixed) instead of minHeight
- OR adjust padding to `12px` vertical to ensure spacing

---

### 4. PickerList Missing Padding/Spacing
**File**: `PickerList.tsx` line 32  
**Current**: `className="py-1"` (4px vertical padding)  
**Problem**: Insufficient padding around list makes first/last items hard to scroll to  
**Impact**: Poor UX on mobile - items near edges are hard to tap  
**Root Cause**: Minimal padding design doesn't account for scroll momentum

**Evidence**:
```tsx
// Line 26-35
<div
  role={role}
  aria-label={ariaLabel}
  aria-labelledby={ariaLabelledBy}
  aria-multiselectable={ariaMultiselectable}
  onKeyDown={onKeyDown}
  className="py-1"  // ← Only 4px top/bottom
>
```

**Fix Required**:
- Change to `py-2` (8px) minimum
- OR add explicit padding to design tokens
- Consider adding padding to individual items instead

---

### 5. OverlaySheet Scroll Lock Conflicts
**File**: `OverlaySheet.tsx` lines 106-146  
**Current**: Locks `documentElement` overflow  
**Problem**: OverlayPickerCore ALSO locks body scroll (line 66)  
**Impact**: Double scroll lock = potential conflicts, especially on cleanup  
**Root Cause**: Two components managing same state independently

**Evidence OverlaySheet**:
```tsx
// Line 122-125
html.style.overflow = 'hidden'
html.style.overscrollBehaviorY = 'contain'
html.style.position = 'relative'
document.body.style.paddingRight = `${scrollbarWidth}px`
```

**Evidence OverlayPickerCore**:
```tsx
// Line 66-67
document.body.style.overflow = 'hidden'
document.body.style.paddingRight = `${scrollbarWidth}px`
```

**Fix Required**:
- Only ONE component should manage scroll lock
- Prefer OverlaySheet for mobile, OverlayPicker for desktop
- OR create shared scroll lock hook/context
- Add ref counting for multiple overlays

---

## 🟡 MEDIUM PRIORITY BUGS

### 6. OverlayPicker Portal Not SSR-Safe
**File**: `OverlayPicker.tsx` lines 94-98  
**Current**: Memoizes `document.body` but doesn't check hydration  
**Problem**: Can cause hydration mismatches in SSR/Next.js  
**Impact**: Console warnings, potential rendering bugs

**Fix Required**: 
- Use `useEffect` to set portal root after mount
- OR check `typeof window !== 'undefined'` in render

---

### 7. PickerSearch Missing Loading State
**File**: `PickerSearch.tsx`  
**Current**: No visual feedback during async search  
**Problem**: User doesn't know if search is processing  
**Impact**: Poor UX for slow searches (API calls, large datasets)

**Fix Required**:
- Add loading spinner when debounce is active
- OR add aria-busy attribute
- Use `.ds-input--loading` class from ds-inputs.css

---

### 8. OverlaySheet Missing Backdrop
**File**: `OverlaySheet.tsx` lines 152-163  
**Current**: Backdrop exists but NOT portaled  
**Problem**: Backdrop renders in-place, not in portal root  
**Impact**: Can be covered by other elements, z-index issues

**Fix Required**:
- Wrap both backdrop + sheet in `createPortal`
- OR render backdrop separately in portal

---

### 9. PickerOption Background Color Uses `color-mix`
**File**: `PickerOption.tsx` line 55  
**Current**: `color-mix(in oklab, var(--ds-color-primary-bg), transparent 90%)`  
**Problem**: `color-mix` not supported in older browsers  
**Impact**: Fallback to transparent, no visual feedback

**Fix Required**:
- Provide fallback with `background-color` before color-mix
- OR use design token instead of inline color-mix

---

### 10. No Virtualization for Long Lists
**File**: `PickerList.tsx` line 22  
**Current**: Comment says "TODO"  
**Problem**: Rendering 1000+ options causes performance issues  
**Impact**: Lag, jank, poor mobile experience

**Fix Required**:
- Implement react-window or react-virtual
- OR add prop-based virtualization threshold

---

## 🟢 LOW PRIORITY / NICE-TO-HAVE

### 11. OverlaySheet Drag Handle Not Accessible
**File**: `OverlaySheet.tsx` lines 191-204  
**Current**: No ARIA attributes on drag handle  
**Problem**: Screen readers don't announce drag functionality  

**Fix**: Add `role="slider"`, `aria-label`, `aria-valuenow`

---

### 12. PickerSearch No Debounce Cancellation
**File**: `PickerSearch.tsx` lines 33-46  
**Current**: Timeout clears but doesn't cancel pending onChange  
**Problem**: Can cause stale updates if onChange is async  

**Fix**: Use AbortController or track latest query ID

---

### 13. OverlayPicker No Max-Width
**File**: `OverlayPicker.tsx`  
**Current**: Width matches anchor exactly if `sameWidth=true`  
**Problem**: On very wide triggers, picker becomes unusably wide  

**Fix**: Add `maxWidth` token (e.g., 480px for pickers)

---

### 14. List Items No Keyboard Navigation
**Files**: All picker components  
**Current**: No arrow key handling  
**Problem**: Keyboard users can only tab through  

**Fix**: Add keyboard nav in PickerList with roving tabindex

---

## 🔧 ROOT CAUSE ANALYSIS

### Pattern 1: Manual Wiring Everywhere
- PickerSearch manages its own icon positioning
- Each component has inline styles
- No shared layout primitives

**Systematization Needed**:
- Create `InputWithIcon` primitive
- Extract icon positioning to design tokens
- Use composition instead of manual positioning

---

### Pattern 2: Multiple Sources of Truth for Scroll Lock
- OverlaySheet locks `<html>`
- OverlayPickerCore locks `<body>`
- No coordination between them

**Systematization Needed**:
- Create `useScrollLock` hook with ref counting
- Single source of truth
- Auto-cleanup on unmount

---

### Pattern 3: Inline Styles Override Class Styles
- `.ds-input` has padding
- PickerSearch adds inline padding
- Specificity battles ensue

**Systematization Needed**:
- Use modifier classes (`.ds-input--with-icon-left`)
- Move all padding to CSS classes
- Document class composition rules

---

### Pattern 4: No Design Tokens for Layout
- Magic numbers everywhere (40px, 44px, 10px, 12px)
- Inconsistent spacing
- Hard to maintain

**Systematization Needed**:
- Add PICKER_TOKENS to match OVERLAY_TOKENS
- Centralize: icon size, padding, item height, gap
- Use tokens everywhere

---

## 📋 FIX PRIORITY ORDER

**Phase 1: Critical (Blocking UX)**
1. Sheet bottom positioning fix
2. Input icon overlap fix
3. List item touch targets
4. Scroll lock deduplication

**Phase 2: Quality (Important)**
5. PickerList padding
6. Portal SSR safety
7. Backdrop portaling
8. Color-mix fallback

**Phase 3: Enhancement (Nice-to-have)**
9. Virtualization
10. Loading states
11. Keyboard nav
12. A11y improvements

---

## 🎯 NEXT STEPS

1. **RUN DIAGNOSTIC SCRIPT** (diagnose-overlay-sheet.js) to confirm bugs
2. **Fix Critical Bugs** (Phase 1) with minimal, surgical changes
3. **Add Regression Tests** (Playwright) for each fix
4. **Extract Patterns** into primitives (Phase 2)
5. **Systematize** with tokens + hooks (Phase 3)

---

## 📝 NOTES

- Following console-first debugging pattern
- All fixes will be evidence-based (not guessed)
- Systematize on 3rd occurrence of pattern
- No over-engineering - fix root cause minimally first
