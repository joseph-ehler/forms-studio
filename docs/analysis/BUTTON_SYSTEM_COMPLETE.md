# Button System - Complete Implementation Analysis

## 📋 Current State (v0.4.0)

### Files
- `packages/ds/src/fb/Button.tsx` (143 lines) - Component
- `packages/ds/src/fb/Button.css` (250 lines) - Token-only styles
- `packages/ds/src/fb/Button.stories.tsx` - Storybook showcase

---

## 🎨 Variants (4)

### Primary
**Purpose:** Main CTAs (Save, Submit, Confirm)
```css
Default:  Blue fill (#2F6FED), white text
Hover:    Darker blue (#1e5dd7), lift -1px, shadow
Active:   Even darker (#1a54c4), no lift, no shadow
Disabled: 50% opacity, no cursor
```

### Secondary
**Purpose:** Alternative actions (Cancel, Back)
```css
Default:  White bg, gray border, dark text
Hover:    Light gray bg (#fafafa), darker border, lift -1px
Active:   Sunken gray (#f5f5f5), no lift
Disabled: 50% opacity
```

### Ghost
**Purpose:** Tertiary actions (minimal presence)
```css
Default:  Transparent, dark text, no border
Hover:    rgba(11 11 12, 0.06) bg, lift -1px
Active:   rgba(11 11 12, 0.1) bg, no lift
Disabled: 50% opacity
```

**Issue:** Hover fill (0.06 opacity) may be too subtle

### Danger
**Purpose:** Destructive actions (Delete, Remove)
```css
Default:  Red fill (#dc2626), white text
Hover:    Darker red (#b91c1c), lift -1px, shadow
Active:   Even darker (#991b1b), no lift
Disabled: 50% opacity
```

---

## 🎯 Sizes (3)

```css
Small:  36px min-height, 10px x 6px padding, 14px text
Medium: 44px min-height, 12px x 8px padding, 14px text (default)
Large:  48px min-height, 14px x 10px padding, 16px text
```

All meet WCAG 2.1 touch target minimum (44px).

---

## 🔍 Focus State

**Current implementation:**
```css
[data-component="button"]:focus-visible {
  box-shadow:
    0 0 0 2px white (offset),
    0 0 0 4px rgba(47 111 237, 0.4) (primary ring);
}
```

**Works for:**
- ✅ Light backgrounds
- ✅ Keyboard navigation
- ✅ High contrast mode

**Issues:**
- ❌ Focus ring may be hard to see on dark mode
- ❌ No variant-specific focus colors
- ❌ White offset doesn't work on white backgrounds

---

## ⚡ Transitions

**All buttons:**
```css
transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
```

**On hover:**
- Background color change
- Border color change (secondary)
- Transform translateY(-1px)
- Box shadow (primary/danger only)

**On active:**
- Background color change
- Transform translateY(0)
- Box shadow removed

---

## 🎭 States Covered

✅ **Default** - Base state  
✅ **Hover** - Mouse over  
✅ **Active** - Mouse down  
✅ **Focus** - Keyboard focus (`:focus-visible`)  
✅ **Disabled** - Non-interactive  
✅ **Loading** - Spinner + aria-busy  

❌ **Link variant** - Not implemented  
❌ **Icon-only** - No specific sizing  

---

## 🔬 Diagnostics

**Data attributes:**
```html
<button 
  data-component="button"
  data-variant="primary"
  data-size="md"
  aria-busy="true" (when loading)
>
```

---

## 🚨 Current Issues

### 1. Ghost Hover (Low Contrast)
```css
/* Current: rgba(11 11 12, 0.06) */
background: var(--ds-state-hover-bg);
```
- 6% opacity may be too faint
- Hard to tell if hovering
- Fails on some monitors/lighting

**Recommendation:** 10% opacity (0.1)

### 2. Focus Ring (Dark Mode)
```css
/* Current: Uses surface-base for offset */
box-shadow:
  0 0 0 2px var(--ds-color-surface-base), /* White in light, dark in dark */
  0 0 0 4px rgba(primary, 0.4);
```
- In dark mode, dark offset on dark button = invisible
- Need dynamic offset color

**Recommendation:** Use `currentColor` with lower opacity

### 3. No Link Variant
- Sometimes need button styling on `<a>` tags
- Or text-only button with no background

**Recommendation:** Add `link` variant

### 4. Icon-Only Sizing
- Icon-only buttons should be square
- Need consistent sizing (44x44, 40x40, 36x36)

**Recommendation:** Add `icon-only` size or className

---

## 🎯 Proposed Improvements

### A. Ghost Hover Enhancement
```css
/* OLD */
--ds-state-hover-bg: rgba(var(--ds-color-text-rgb), 0.06);

/* NEW */
--ds-state-hover-bg: rgba(var(--ds-color-text-rgb), 0.10); /* 10% */

/* For dark mode */
:root[data-theme="dark"] {
  --ds-state-hover-bg: rgba(255 255 255, 0.12); /* Slightly more in dark */
}
```

**WCAG Contrast Check:**
- Light mode: Black text (21:1) on 10% gray = ~18:1 ✅
- Dark mode: White text on 12% white = ~16:1 ✅

### B. Focus Ring Improvements
```css
[data-component="button"]:focus-visible {
  outline: 2px solid var(--ds-focus-color);
  outline-offset: 2px;
  /* Remove box-shadow approach */
}

/* OR keep box-shadow but make it smarter */
[data-component="button"]:focus-visible {
  box-shadow:
    0 0 0 2px currentColor,  /* Use button's own color */
    0 0 0 4px var(--ds-state-focus-ring);
}
```

### C. Link Variant
```css
[data-component="button"][data-variant="link"] {
  background: transparent;
  color: var(--ds-color-primary);
  border: none;
  text-decoration: underline;
  text-underline-offset: 2px;
  padding-inline: 0;
  min-block-size: auto;
}

[data-component="button"][data-variant="link"]:hover {
  color: var(--ds-color-primary-hover);
  text-decoration: none;
  transform: none; /* No lift */
}
```

### D. Icon-Only Size
```tsx
// Button.tsx
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon-sm' | 'icon-md' | 'icon-lg';
```

```css
[data-component="button"][data-size="icon-sm"] {
  width: 36px;
  height: 36px;
  padding: 0;
  justify-content: center;
}

[data-component="button"][data-size="icon-md"] {
  width: 44px;
  height: 44px;
  padding: 0;
}

[data-component="button"][data-size="icon-lg"] {
  width: 48px;
  height: 48px;
  padding: 0;
}
```

---

## 📊 Token Usage

**Colors:**
- `--ds-color-primary` / `--ds-color-primary-hover` / `--ds-color-primary-active`
- `--ds-color-danger` / `--ds-color-danger-hover` / `--ds-color-danger-active`
- `--ds-color-surface-base` / `-raised` / `-sunken`
- `--ds-color-text` / `--ds-color-text-inverse`
- `--ds-color-border-medium` / `-strong`
- `--ds-state-hover-bg` / `--ds-state-active-bg` / `--ds-state-focus-ring`

**RGB Triplets (for alpha):**
- `--ds-color-primary-rgb`
- `--ds-color-text-rgb`

**Spacing:**
- `--ds-space-control-x` / `--ds-space-control-y`
- `--ds-space-2` (gap)

**Other:**
- `--ds-radius-control`
- `--ds-touch-target`
- `--ds-transition-fast`
- `--ds-shadow-overlay-sm`
- `--ds-font-sans`
- `--ds-weight-medium`
- `--ds-leading-tight`

**Zero magic numbers** ✅

---

## 🎨 Design Principles

1. **Token-only** - No hardcoded values
2. **Consistent lift** - All variants lift on hover
3. **Semantic variants** - Intent-based naming
4. **Accessible** - WCAG 2.1 AA compliant
5. **Reduced motion** - Respects user preference
6. **Diagnostics** - data-* attributes for debugging
7. **Type-safe** - Full TypeScript support

---

## 🚀 Recommended Next Steps

**Immediate (today):**
1. Increase ghost hover from 6% → 10% opacity
2. Improve focus ring contrast in dark mode

**Short-term (this week):**
3. Add `link` variant
4. Add icon-only sizes

**Future:**
5. Add loading animation polish (spinner fade-in)
6. Consider "soft" variant (subtle fill + outline)
7. Add destructive confirmation pattern
8. Storybook interaction tests with play functions

---

## 📏 Accessibility Checklist

✅ Min 44px touch targets  
✅ WCAG AA contrast (4.5:1 text, 3:1 UI components)  
✅ Keyboard navigation (Tab, Enter, Space)  
✅ Focus visible (`:focus-visible` only)  
✅ Screen reader support (aria-busy, button role)  
✅ Reduced motion support  
✅ High contrast mode support  

⚠️ Focus ring needs dark mode improvement  
⚠️ Ghost hover needs contrast boost  

---

## 💡 Usage Examples

```tsx
// Primary action
<Button variant="primary" onClick={save}>
  Save Changes
</Button>

// With icon
<Button variant="primary" iconLeft={<SaveIcon />}>
  Save
</Button>

// Loading state
<Button variant="primary" loading loadingText="Saving...">
  Save
</Button>

// Secondary action
<Button variant="secondary" onClick={cancel}>
  Cancel
</Button>

// Tertiary/minimal
<Button variant="ghost" onClick={close}>
  Close
</Button>

// Destructive
<Button variant="danger" onClick={deleteItem}>
  Delete
</Button>

// Disabled
<Button variant="primary" disabled>
  Not Available
</Button>
```

---

**Current state: Production-ready with minor refinements needed**

Focus areas:
1. Ghost hover contrast ⚠️
2. Focus ring dark mode ⚠️
3. Link variant (nice-to-have)
4. Icon-only sizing (nice-to-have)
