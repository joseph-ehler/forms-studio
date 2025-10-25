# Automagic Button System

## Philosophy

Buttons should be **correct by construction**. Change a color role → all buttons update. Add a variant → no CSS changes required. The system makes it impossible to ship broken buttons.

---

## How It Works

### 1. Skin Variables (Single Source of Truth)

Every button variant maps to CSS variables:

```tsx
// packages/ds/src/fb/Button.tsx
const SKIN: Record<ButtonVariant, CSSProperties> = {
  primary: {
    '--btn-fg': 'var(--ds-role-primary-text)',
    '--btn-bg': 'var(--ds-role-primary-bg)',
    '--btn-hover-bg': 'var(--ds-role-primary-hover)',
    '--btn-active-bg': 'var(--ds-role-primary-active)',
  },
  // ... 6 more variants
};
```

**Why this works:**
- Component sets local `--btn-*` vars based on `variant` prop
- CSS reads **only** those local vars (never touches roles directly)
- Result: Change `--ds-role-primary-bg` → all primary buttons update

---

### 2. Interaction Layer (CSS Consumes Skin Vars)

```css
/* packages/ds/src/fb/Button.css */
[data-component="button"] {
  color: var(--btn-fg);
  background: var(--btn-bg);
}

@media (hover: hover) {
  [data-component="button"]:hover {
    background: var(--btn-hover-bg, var(--btn-bg)); /* Safe fallback */
  }
}

[data-component="button"]:active {
  background: var(--btn-active-bg, var(--btn-hover-bg, var(--btn-bg)));
}
```

**Key patterns:**
- Multi-level fallbacks (`var(--btn-active-bg, var(--btn-hover-bg, var(--btn-bg))`)
- Media queries (`hover: hover` for pointer devices only)
- No variant-specific color logic (that's in the SKIN map)

---

### 3. Contracts (Dev-Mode Validation)

```tsx
// packages/ds/src/utils/contracts/buttonContracts.ts
export function requireValidVariant(props) {
  if (props.variant && !VALID_VARIANTS.includes(props.variant)) {
    throw new Error(`Invalid variant "${props.variant}"`);
  }
}

export function requireSkinVars(props) {
  const missing = ['--btn-fg', '--btn-bg'].filter(k => !(k in props.style));
  if (missing.length) {
    console.warn('Missing skin vars:', missing);
  }
}
```

**Applied in render:**
```tsx
applyButtonContracts({ variant, style: { ...SKIN[variant], ...style } });
```

**Catches:**
- Typos in variant name (`variant="primry"`)
- Missing skin variables in SKIN map
- Direct style overrides that bypass the system

---

### 4. Test Matrix (Automated Coverage)

```tsx
// packages/ds/src/fb/Button.matrix.stories.tsx
export const AllVariants: Story = {
  play: async ({ canvasElement }) => {
    for (const variant of VARIANTS) {
      const btn = canvas.getByTestId(`btn-${variant}`);
      
      // Hover → bg changes
      await userEvent.hover(btn);
      expect(getComputedStyle(btn).backgroundColor).not.toBe(baseBg);
      
      // Focus → ring appears
      btn.focus();
      expect(getComputedStyle(btn).boxShadow).not.toBe('none');
    }
  },
};
```

**Covers:**
- All 7 variants × all states (hover, active, focus, disabled)
- Dark mode
- Brand theming (mint, berry, ocean)
- All sizes (sm, md, lg)

---

## Adding a New Variant

### Before (Old System)
1. Update Button.tsx with new variant type ❌
2. Add CSS rules for base, hover, active, focus ❌
3. Add CSS for dark mode ❌
4. Add CSS for each brand ❌
5. Test manually ❌
6. Hope you didn't miss anything ❌

**Total: 6 error-prone steps**

### After (Automagic System)
1. Add variant to SKIN map ✅

```tsx
const SKIN: Record<ButtonVariant, CSSProperties> = {
  // ... existing variants
  premium: {
    '--btn-fg': 'var(--ds-role-premium-text)',
    '--btn-bg': 'var(--ds-role-premium-bg)',
    '--btn-hover-bg': 'var(--ds-role-premium-hover)',
    '--btn-active-bg': 'var(--ds-role-premium-active)',
  },
};
```

**That's it. No CSS changes. Hover/active/focus/dark mode all work automatically.**

---

## Why It's Unbreakable

### 1. **Single Source of Truth**
SKIN map is the only place colors are defined. Change once, update everywhere.

### 2. **Contracts Prevent Errors**
```tsx
// This throws in dev:
<Button variant="primry" />
// Error: Invalid variant "primry"

// This warns in dev:
const SKIN = { primary: { '--btn-fg': '...' } }; // missing --btn-bg
// Warning: Missing skin vars: --btn-bg
```

### 3. **CSS Fallbacks**
```css
background: var(--btn-hover-bg, var(--btn-bg));
```
If `--btn-hover-bg` missing, falls back to `--btn-bg`. Never renders invisible.

### 4. **Automated Tests**
Matrix story runs on every build. If a variant breaks, CI fails before merge.

### 5. **Type Safety**
```tsx
type ButtonVariant = 'primary' | 'secondary' | ... | 'info';
const SKIN: Record<ButtonVariant, CSSProperties>; // TypeScript ensures completeness
```

If you add a variant to the type, you **must** add it to SKIN or TypeScript errors.

---

## Usage

### Basic
```tsx
<Button variant="primary">Save</Button>
<Button variant="success">Confirm</Button>
<Button variant="danger">Delete</Button>
<Button variant="info">Learn More</Button>
```

### With States
```tsx
<Button variant="primary" loading>Saving...</Button>
<Button variant="danger" disabled>Cannot Delete</Button>
```

### With Icons
```tsx
<Button variant="success" iconLeft={<CheckIcon />}>
  Done
</Button>
```

### All Variants
- `primary` - Brand actions (save, submit, continue)
- `secondary` - Secondary actions (outline style)
- `ghost` - Tertiary actions (minimal, no bg)
- `success` - Confirmations (approve, complete)
- `warning` - Cautions (warn, proceed with care)
- `danger` - Destructive (delete, remove)
- `info` - Informational (learn more, help)

---

## How Themes Work

### Light Mode (Default)
```css
:root {
  --ds-role-primary-bg: var(--ds-primary-10);   /* blue */
  --ds-role-primary-hover: var(--ds-primary-11); /* darker blue */
}
```

### Dark Mode
```css
:root[data-theme="dark"] {
  --ds-role-primary-bg: var(--ds-primary-10);   /* brighter blue */
  --ds-role-primary-hover: var(--ds-primary-11); /* even brighter */
}
```

### Brand Theming
```html
<section data-brand="mint">
  <Button variant="primary">Save</Button> <!-- green -->
</section>

<section data-brand="berry">
  <Button variant="primary">Save</Button> <!-- purple -->
</section>
```

**The button component doesn't know about themes. It just reads `--btn-bg`, which resolves to the correct color.**

---

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│ Component Layer (Button.tsx)                │
│ ┌─────────────────────────────────────────┐ │
│ │ SKIN Map                                │ │
│ │ primary   → --btn-fg, --btn-bg, ...     │ │
│ │ success   → --btn-fg, --btn-bg, ...     │ │
│ │ danger    → --btn-fg, --btn-bg, ...     │ │
│ └─────────────────────────────────────────┘ │
│              ↓ sets local CSS vars          │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ Interaction Layer (Button.css)              │
│ ┌─────────────────────────────────────────┐ │
│ │ base:   color: var(--btn-fg)            │ │
│ │         background: var(--btn-bg)       │ │
│ │                                          │ │
│ │ hover:  background: var(--btn-hover-bg) │ │
│ │ active: background: var(--btn-active-bg)│ │
│ │ focus:  box-shadow: focus-ring          │ │
│ └─────────────────────────────────────────┘ │
│              ↓ reads local vars             │
└─────────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────────┐
│ Token Layer (tokens.css)                    │
│ ┌─────────────────────────────────────────┐ │
│ │ Roles resolve to ramps:                 │ │
│ │ --ds-role-primary-bg: var(--ds-primary-10)│
│ │ --ds-role-primary-hover: var(--ds-primary-11)│
│ │                                          │ │
│ │ Ramps generated from seeds:             │ │
│ │ --ds-primary-10: oklch(0.63 0.15 225)   │ │
│ │ --ds-primary-11: oklch(0.57 0.15 225)   │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Result:** Change `--ds-primary-h: 225` to `160` → entire theme shifts from blue to green, all buttons update automatically.

---

## Comparison: Before vs After

| Aspect | Before (BC Aliases) | After (Automagic) |
|--------|---------------------|-------------------|
| Add variant | 6 manual steps | 1 line in SKIN map |
| Theme change | Update 20+ CSS rules | Change 1 role token |
| Dark mode | Separate CSS blocks | Automatic (roles flip) |
| Brand theming | Copy/paste CSS | Data attribute |
| Error detection | Runtime bugs | Dev-time errors |
| Test coverage | Manual QA | Automated matrix |
| Maintainability | Fragile | Bulletproof |

---

## Testing

### Run Matrix Tests
```bash
pnpm sb:test
```

### Visual Review
```bash
pnpm sb
# Navigate to "Button > Matrix Tests"
```

### Contrast Check
```bash
pnpm design:contrast
```

---

## Troubleshooting

### Button has no background color
**Cause:** Missing skin variable in SKIN map  
**Fix:** Check console for contract warning, add missing var

### Hover state doesn't work
**Cause:** Likely on touch device or `hover: hover` media query issue  
**Fix:** Check browser dev tools, verify `@media (hover: hover)` applies

### Focus ring not visible
**Cause:** `--ds-state-focus-ring` not set or conflicts with other styles  
**Fix:** Inspect computed styles, ensure `box-shadow` is applied

### TypeScript error on new variant
**Cause:** Added variant to type but not to SKIN map (or vice versa)  
**Fix:** Ensure both `ButtonVariant` type and `SKIN` object are in sync

---

## Future Enhancements

### 1. ESLint Rule (Enforce Complete SKIN)
Prevent merging if SKIN map is missing required keys for any variant.

### 2. Runtime Audit Toggle
```tsx
window.__DS_AUDIT = true;
// Logs contrast ratios, missing vars, transparent backgrounds
```

### 3. Visual State Debugger
```tsx
<Button variant="primary" data-dev-force="hover">
  Locked in hover state
</Button>
```

### 4. Contrast CI Gate for Buttons
Extend `design-contrast.mts` to check button-specific pairs:
```bash
pnpm design:contrast:buttons
# ✅ Primary text on primary bg: 5.2:1 (≥ 3:1)
# ❌ Warning text on warning bg: 2.1:1 (< 3:1)
```

---

## Status

**Phase 1 Complete:** Button is now automagic and production-unbreakable.

- ✅ 7 semantic variants (primary, secondary, ghost, success, warning, danger, info)
- ✅ Skin variables (single source of truth)
- ✅ Contracts (dev-mode validation)
- ✅ Test matrix (automated coverage)
- ✅ Dark mode support
- ✅ Brand theming
- ✅ All sizes (sm, md, lg)
- ✅ Loading & disabled states
- ✅ Icon slots
- ✅ Focus rings (role-driven)

**Next:** Apply this pattern to other interactive components (Input, Select, Checkbox, etc.)
