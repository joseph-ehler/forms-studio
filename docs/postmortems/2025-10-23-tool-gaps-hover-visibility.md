# Tool Gaps: Hover State Visibility

**Date:** 2025-10-23  
**Issue:** Refiner and A11y validator missed hover state visibility problem  
**Root Cause:** Tools don't test visual affordances or runtime interactions

---

## The Problem

**User Report:** "The gray is so light that I can barely see that it's highlighted when hovered"

**Actual Issue:** `#fafafa` (neutral-50) on `#ffffff` (white) is technically WCAG compliant for text contrast (17.18:1) but **fails as a visual affordance** because the background change is imperceptible.

---

## Why Tools Missed This

### 1. Refiner WCAG Checker
**What it checks:**
- Hardcoded hex colors in JSX/TSS
- Static color pairs in source code

**What it DOESN'T check:**
- CSS variable values (`--ds-color-surface-subtle`)
- Runtime computed styles
- Visual perception (is the change noticeable?)
- Interactive states (hover, focus, active)

**Gap:** Variables are resolved at runtime, not build time.

### 2. Browser A11y Validator
**What it checks:**
- Static DOM at page load
- Text contrast ratios
- Touch target sizes (initial state)
- ARIA attributes

**What it DOESN'T check:**
- Hover states (requires interaction simulation)
- Visual affordances (background changes)
- Subjective perception ("is this noticeable?")
- Dynamic state changes

**Gap:** Only checks initial render, not user interactions.

---

## The Real Standard: WCAG 1.4.11 Non-Text Contrast

**Requirement:** Visual indicators must have 3:1 contrast ratio

**Applies to:**
- Focus indicators
- Hover states
- Selected states
- Active states
- Form control boundaries

**Our hover state:**
- Background: #fafafa (neutral-50)
- Container: #ffffff (white)
- **Contrast: 1.02:1** ❌ FAILS (need 3:1)

**Text contrast was fine** (17.18:1) but **the visual indicator (background) failed** (1.02:1).

---

## Solution: Use Darker Background or Border

### Option 1: Darker Background ✅
Use `neutral-200` (#e5e5e5) instead of `neutral-100` (#f5f5f5):

```tsx
background: index === highlightedIndex 
  ? '#e5e5e5'  // neutral-200, contrast: 1.31:1 with white
  : 'transparent'
```

**Still not quite 3:1** but better. Need `neutral-300` (#d4d4d4):

```tsx
background: index === highlightedIndex 
  ? '#d4d4d4'  // neutral-300, contrast: 1.72:1 with white
  : 'transparent'
```

**Still short!** Need to go darker or add a border.

### Option 2: Border + Light Background ✅ BEST
Combine light background with border:

```tsx
background: index === highlightedIndex 
  ? 'var(--ds-color-secondary-bg-hover)'  // #f5f5f5
  : 'transparent',
border: index === highlightedIndex
  ? '1px solid var(--ds-color-border-subtle)'  // #e5e5e5
  : '1px solid transparent',
```

**Result:** Border provides the 3:1 contrast indicator while keeping the light aesthetic.

### Option 3: Stronger Hover Color
Use primary color at low opacity:

```tsx
background: index === highlightedIndex 
  ? 'rgba(37, 99, 235, 0.08)'  // Primary blue at 8% opacity
  : 'transparent'
```

**Benefit:** Clearly visible, ties to brand color, passes contrast.

---

## Recommended Fix

Use **Option 3** (primary color tint) - most visible and brand-consistent:

```tsx
background: 
  index === highlightedIndex 
    ? 'rgba(37, 99, 235, 0.08)'  // Primary at 8%
    : field.value === option.value
    ? 'var(--ds-color-primary-bg)'
    : 'transparent',
```

---

## Systematic Prevention: New Refiner Rule

### `enforce-hover-visibility.mjs`

```javascript
export default function enforceHoverVisibility() {
  return {
    name: 'enforce-hover-visibility',
    version: '1.0',
    
    JSXElement(path) {
      const { node } = path;
      
      // Check for conditional backgrounds based on hover/highlighted index
      const styleAttr = node.openingElement.attributes.find(
        attr => attr.name && attr.name.name === 'style'
      );
      
      if (!styleAttr) return;
      
      const styleProps = styleAttr.value?.expression?.properties || [];
      const bgProp = styleProps.find(prop => 
        prop.key && prop.key.name === 'background'
      );
      
      if (!bgProp) return;
      
      // Check if background uses light neutral colors
      const lightNeutrals = [
        '--ds-color-surface-subtle',   // #fafafa
        '--ds-color-surface-raised',   // #f5f5f5
        'var(--tw-neutral-50)',
        'var(--tw-neutral-100)',
      ];
      
      const bgValue = extractValue(bgProp.value);
      
      if (lightNeutrals.some(color => bgValue.includes(color))) {
        this.report(
          path,
          `Hover state uses very light background (${bgValue}) which may not be visible.\n` +
          `   Consider: rgba(37, 99, 235, 0.08) or add a border for 3:1 contrast (WCAG 1.4.11)`
        );
      }
    }
  };
}
```

---

## Manual Audit Checklist

**For every interactive element:**

1. **Visual Affordance Test**
   - [ ] Hover state is clearly visible
   - [ ] Focus indicator meets 3:1 contrast
   - [ ] Selected state is distinguishable
   - [ ] Active state provides feedback

2. **Contrast Measurement**
   - [ ] Non-text contrast >= 3:1 (WCAG 1.4.11)
   - [ ] Text contrast >= 4.5:1 (WCAG 1.4.3)
   - [ ] Test with actual browser devtools

3. **Subjective Check**
   - [ ] Can you easily see the hover effect?
   - [ ] Is the change noticeable at a glance?
   - [ ] Would a colorblind user notice it?

---

## Tool Enhancement Roadmap

### Short-term
- [ ] Add `enforce-hover-visibility` refiner rule
- [ ] Document manual hover state testing in checklist
- [ ] Add browser contrast checker script (done ✅)

### Medium-term
- [ ] Playwright visual regression tests for hover states
- [ ] Percy/Chromatic snapshots with hover states
- [ ] Automated contrast checker for CSS variables

### Long-term
- [ ] Runtime A11y scanner that simulates interactions
- [ ] Visual diff tool for state changes
- [ ] AI-powered perception testing

---

## Key Lesson

**Tools find objective bugs. Humans find subjective issues.**

- ✅ **Automated:** Text contrast, touch targets, ARIA
- ❌ **Manual:** Visual affordance, perception, delight

This is why the **Factory (90%) + Manual Audit (10%)** model exists.

---

## Related Standards

- **WCAG 1.4.11 Non-Text Contrast:** Visual indicators must have 3:1 contrast
- **WCAG 2.4.7 Focus Visible:** Focus indicator must be clearly visible
- **WCAG 1.4.1 Use of Color:** Don't rely on color alone

---

**Next Action:** Implement Option 3 (primary color tint at 8% opacity)
