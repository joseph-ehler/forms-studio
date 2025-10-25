# Token System - Usage Guide

## 🎯 Type-Safe Token Access

Use the helper functions instead of raw `var(--ds-*)` calls:

```typescript
import { dsColor, dsSpace, dsRadius, dsTransition } from '@intstudio/tokens';

// ✅ Good - Type-safe, autocomplete works
const styles = {
  background: dsColor('primary'),
  padding: dsSpace(4),
  borderRadius: dsRadius('lg'),
  transition: dsTransition('fast'),
};

// ❌ Bad - Easy to typo, no autocomplete
const styles = {
  background: 'var(--ds-color-primary)',  // typos possible
  padding: 'var(--ds-space-4)',
  borderRadius: 'var(--ds-radius-lg)',
};

// ❌ Forbidden - Will fail lint
const styles = {
  background: '#2F6FED',    // ❌ Raw hex
  padding: '16px',          // ❌ Magic number
  color: 'rgb(47,111,237)', // ❌ Raw rgb
};
```

## 📦 Available Helpers

### Colors
```typescript
dsColor('primary')              // var(--ds-color-primary)
dsColor('primary.hover')        // var(--ds-color-primary-hover)
dsColor('surface.base')         // var(--ds-color-surface-base)
dsColor('text.subtle')          // var(--ds-color-text-subtle)
dsColor('border.medium')        // var(--ds-color-border-medium)

// RGB triplets (for alpha composition)
dsColorRGB('primary')           // var(--ds-color-primary-rgb)
// Use: `rgba(${dsColorRGB('primary')}, 0.4)`
```

### Spacing
```typescript
dsSpace(0)   // var(--ds-space-0)  → 0
dsSpace(2)   // var(--ds-space-2)  → 0.5rem
dsSpace(4)   // var(--ds-space-4)  → 1rem
dsSpace(8)   // var(--ds-space-8)  → 2rem
dsSpace(16)  // var(--ds-space-16) → 4rem
```

### Radius
```typescript
dsRadius('none')    // var(--ds-radius-none)
dsRadius('sm')      // var(--ds-radius-sm)
dsRadius('lg')      // var(--ds-radius-lg)
dsRadius('control') // var(--ds-radius-control) - for inputs/buttons
```

### State Tokens
```typescript
import { dsState } from '@intstudio/tokens';

dsState.hoverBg()    // var(--ds-state-hover-bg)
dsState.activeBg()   // var(--ds-state-active-bg)
dsState.focusRing()  // var(--ds-state-focus-ring)
```

### Control Tokens (Density)
```typescript
import { dsControl } from '@intstudio/tokens';

dsControl.spaceX()  // var(--ds-space-control-x) - horizontal padding
dsControl.spaceY()  // var(--ds-space-control-y) - vertical padding
dsControl.radius()  // var(--ds-radius-control) - border radius
```

### Typography
```typescript
import { dsTypo } from '@intstudio/tokens';

dsTypo.fontSans()       // var(--ds-font-sans)
dsTypo.weightMedium()   // var(--ds-weight-medium)
dsTypo.leadingTight()   // var(--ds-leading-tight)
```

### Shadows, Transitions, Z-Index
```typescript
dsShadow('overlay-md')    // var(--ds-shadow-overlay-md)
dsTransition('fast')      // var(--ds-transition-fast)
dsZIndex('modal')         // var(--ds-z-modal)
```

## 🎨 In CSS Files

**Tokens are directly usable:**
```css
.my-component {
  /* ✅ Use tokens directly */
  background: var(--ds-color-surface-base);
  color: var(--ds-color-text);
  padding: var(--ds-space-4);
  border-radius: var(--ds-radius-control);
  transition: all var(--ds-transition-fast);
}

.my-component:hover {
  background: var(--ds-state-hover-bg);
}

.my-component:focus-visible {
  box-shadow:
    0 0 0 var(--ds-focus-offset) transparent,
    0 0 0 calc(var(--ds-focus-offset) + var(--ds-focus-ring)) var(--ds-state-focus-ring);
}

/* ❌ These will fail Stylelint */
.bad {
  background: #2F6FED;        /* ❌ Raw hex */
  padding: 16px;              /* ❌ Magic number */
  color: rgb(47, 111, 237);   /* ❌ Raw rgb */
}
```

## 🔐 Lint Enforcement

**ESLint (`.eslintrc.token-enforcement.json`):**
- Blocks raw hex colors: `#2F6FED`
- Blocks hardcoded px: `16px`
- Blocks raw rgb/rgba: `rgb(47, 111, 237)`

**Stylelint (`.stylelintrc.token-enforcement.json`):**
- Blocks hex in color properties
- Blocks px in spacing properties
- Blocks rgb/rgba/hsl/hsla functions

**Exceptions:**
- `**/tokens/**` - Token definition files exempt
- `*.css` - CSS files use tokens directly, not helpers

## 🌓 Dark Mode

Tokens automatically switch based on `data-theme` attribute:

```typescript
// In your app root
import { useTheme } from '@intstudio/ds/hooks';

function App() {
  const { setTheme } = useTheme();
  
  // User clicks "Dark mode" button
  setTheme('dark'); // <html data-theme="dark">
  
  // All tokens switch automatically:
  // --ds-color-surface-base: #ffffff → #0b0b0c
  // --ds-color-text: #0b0b0c → #ffffff
}
```

## 📚 Common Patterns

### Button with Hover
```tsx
<button
  style={{
    background: dsColor('primary'),
    color: dsColor('text.inverse'),
    padding: `${dsSpace(2)} ${dsSpace(4)}`,
    borderRadius: dsRadius('control'),
    transition: dsTransition('fast'),
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = dsColor('primary.hover');
  }}
>
  Click me
</button>
```

### Modal with Scrim
```tsx
<div style={{
  position: 'fixed',
  inset: 0,
  background: dsVar('scrim'), // rgba(text, 0.06)
  zIndex: dsZIndex('modal'),
}}>
  <div style={{
    background: dsColor('surface.overlay'),
    boxShadow: dsShadow('overlay-md'),
    borderRadius: dsRadius('lg'),
    padding: dsSpace(6),
  }}>
    Modal content
  </div>
</div>
```

### Focus Ring
```css
.my-button:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--ds-focus-offset) transparent,
    0 0 0 calc(var(--ds-focus-offset) + var(--ds-focus-ring)) var(--ds-state-focus-ring);
}
```

## 🚨 Common Mistakes

```typescript
// ❌ Don't call dsColor without return
dsColor('primary'); // This just returns a string, doesn't apply

// ✅ Use the return value
element.style.background = dsColor('primary');

// ❌ Don't concatenate tokens
const bad = dsSpace(2) + dsSpace(4); // "var(--ds-space-2)var(--ds-space-4)"

// ✅ Use calc if you need math
const good = `calc(${dsSpace(2)} + ${dsSpace(4)})`;

// ❌ Don't use tokens in media queries
@media (max-width: var(--ds-breakpoint-md)) {} // Doesn't work

// ✅ Use Tailwind breakpoints or hardcode (media queries can't use custom properties)
@media (max-width: 768px) {}
```

## 🎯 Migration from Magic Values

**Before:**
```tsx
<button style={{
  background: '#2F6FED',
  padding: '8px 16px',
  borderRadius: '8px',
  color: '#fff',
}}>
  Click
</button>
```

**After:**
```tsx
import { dsColor, dsSpace, dsRadius } from '@intstudio/tokens';

<button style={{
  background: dsColor('primary'),
  padding: `${dsSpace(2)} ${dsSpace(4)}`,
  borderRadius: dsRadius('lg'),
  color: dsColor('text.inverse'),
}}>
  Click
</button>
```

**Benefits:**
- ✅ Type-safe (autocomplete works)
- ✅ Dark mode support (automatic)
- ✅ Lint passes (no magic values)
- ✅ Single source of truth (change once, update everywhere)
- ✅ Can't typo token names

---

**Next:** See `GOD_TIER_CHECKLIST.md` for implementation roadmap.
