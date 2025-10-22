# Brand CSS Files - Cascade Layers Pattern

## Overview

Brand CSS files use **CSS Cascade Layers** (`@layer`) + **zero-specificity selectors** (`:where()`) for deterministic, conflict-free styling.

## Pattern

```css
@layer brand {
  :where([data-brand="acme"]) {
    --ds-color-primary-bg: oklch(60% 0.2 280);
  }
}
```

## Benefits

### 1. **Zero Specificity** (`:where()`)
- Brand tokens have **0,0,0** specificity
- Components **always win** without `!important`
- No specificity wars!

### 2. **Layer Precedence** (`@layer brand`)
- Explicit order: `tokens → brand → components → utils`
- Predictable, deterministic cascade
- Components override brands automatically

### 3. **Scoped Branding**
- Multiple brands on same page works
- Each subtree inherits its brand tokens
- Pure CSS, no JS switching needed

---

## Usage

### Import in your app entry:

```typescript
// main.tsx or App.tsx
import './styles/layers.css'           // Layer definitions
import './styles/brands/brand-acme.css'    // Brand A
import './styles/brands/brand-vertex.css'  // Brand B
```

### Apply brand via data attribute:

```html
<html data-brand="acme" data-theme="light">
  <!-- Entire app uses Acme brand -->
</html>
```

### Scoped per-subtree:

```html
<div data-brand="acme">
  <Button>Acme Button</Button> <!-- Purple -->
</div>

<div data-brand="vertex">
  <Button>Vertex Button</Button> <!-- Blue -->
</div>
```

---

## Creating a New Brand

### 1. Create `brand-[name].css`:

```css
@layer brand {
  :where([data-brand="yourco"]) {
    /* Primary colors */
    --ds-color-primary-bg: oklch(55% 0.18 200);
    --ds-color-primary-text: oklch(98% 0 0);
    
    /* Accent */
    --ds-color-accent-bg: oklch(65% 0.15 30);
    
    /* Assets */
    --ds-brand-logo: url('/brands/yourco/logo.svg');
    
    /* Optional: Border radius, spacing tweaks */
    --ds-radius-md: 6px;
  }
  
  /* Dark mode overrides */
  :where([data-brand="yourco"][data-theme="dark"]) {
    --ds-color-primary-bg: oklch(60% 0.18 200);
  }
}
```

### 2. Import in your app:

```typescript
import './styles/brands/brand-yourco.css'
```

### 3. Apply via attribute:

```typescript
document.documentElement.setAttribute('data-brand', 'yourco')
```

---

## Runtime vs Static Brands

### **Static CSS** (this pattern):
```css
@layer brand {
  :where([data-brand="acme"]) {
    --ds-color-primary-bg: oklch(60% 0.2 280);
  }
}
```

✅ **Pros**:
- Deterministic cascade (no specificity wars)
- Scoped branding (multiple brands on page)
- Smaller bundle (shared tokens)
- Better dev tools inspection

❌ **Cons**:
- All brands shipped to client (unless code-split)
- Requires rebuild to add new brand

---

### **Runtime Tokens** (existing `applyBrand()` API):
```typescript
applyBrand({
  id: 'acme',
  tokens: {
    '--ds-color-primary-bg': '#7c3aed',
  },
})
```

✅ **Pros**:
- No rebuild needed (load brand from API)
- User-generated brands possible
- Smaller bundle (only active brand)

❌ **Cons**:
- Inline styles (higher specificity)
- Harder to debug (no stylesheet)
- No scoped branding support

---

## Recommendation

**Use both!**

1. **Static CSS** for known brands (Acme, Vertex, Sunset)
2. **Runtime tokens** for dynamic/user-generated brands

```typescript
// Static brand (uses CSS file)
document.documentElement.setAttribute('data-brand', 'acme')

// Dynamic brand (uses runtime API)
applyBrand({
  id: 'custom-12345',
  tokens: { '--ds-color-primary-bg': '#ff6b6b' },
})
```

---

## Migration Guide

### Before (no layers):
```css
[data-brand="acme"] {
  --ds-color-primary-bg: purple; /* (0,1,0) specificity */
}

.ds-button {
  background: var(--ds-color-primary-bg); /* (0,1,0) → tie! */
}
```

**Problem**: Specificity tie, source order matters (brittle!)

---

### After (with layers):
```css
@layer brand {
  :where([data-brand="acme"]) {
    --ds-color-primary-bg: purple; /* (0,0,0) specificity */
  }
}

@layer atoms {
  .ds-button {
    background: var(--ds-color-primary-bg); /* Always wins! */
  }
}
```

**Result**: Components always win, no `!important` needed!

---

## Debugging

### Check layer order:
```javascript
// Chrome DevTools Console
Array.from(document.styleSheets)
  .flatMap(s => Array.from(s.cssRules))
  .filter(r => r.constructor.name === 'CSSLayerBlockRule')
  .map(r => r.name)

// Expected: ['tokens', 'brand', 'base', 'atoms', 'layout', 'patterns', 'utils']
```

### Check brand tokens:
```javascript
getComputedStyle(document.documentElement)
  .getPropertyValue('--ds-color-primary-bg')
```

### Visualize specificity:
Use Chrome DevTools → Inspect element → Computed tab → Check which layer wins

---

## Examples

### Example 1: Side-by-side brands
```html
<div style="display: flex; gap: 24px;">
  <div data-brand="acme">
    <Button>Acme</Button>
  </div>
  <div data-brand="vertex">
    <Button>Vertex</Button>
  </div>
</div>
```

### Example 2: Brand switcher
```typescript
const brands = ['acme', 'vertex', 'sunset']

function switchBrand(id: BrandId) {
  document.documentElement.setAttribute('data-brand', id)
  // Instant switch, no re-render!
}
```

### Example 3: Per-route branding
```typescript
// In your router
<Route path="/acme" element={
  <div data-brand="acme">
    <AcmeApp />
  </div>
} />
```

---

## See Also

- `layers.css` - Layer definitions & order
- `applyBrand.ts` - Runtime token API
- `GOD_TIER_COMPLETE.md` - Full system docs
