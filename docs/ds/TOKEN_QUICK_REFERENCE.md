# Design Token Quick Reference

**Last Updated:** October 24, 2025  
**Enforcement:** Automatic via Stylelint + ESLint + Refiner

---

## 🎨 Colors

### Text
```css
var(--ds-color-text)           /* Primary text */
var(--ds-color-text-muted)     /* Secondary text */
var(--ds-color-text-inverted)  /* White text on dark bg */
```

### Surface
```css
var(--ds-color-surface-base)    /* Main background */
var(--ds-color-surface-subtle)  /* Subtle background */
var(--ds-color-surface-raised)  /* Elevated surface */
```

### Border
```css
var(--ds-color-border-subtle)  /* Subtle borders */
var(--ds-color-border-strong)  /* Strong borders */
```

### States
```css
var(--ds-color-state-success)  /* Green */
var(--ds-color-state-warning)  /* Yellow */
var(--ds-color-state-danger)   /* Red */
var(--ds-color-state-info)     /* Blue */
```

### Primary
```css
var(--ds-color-primary-bg)     /* Brand color bg */
var(--ds-color-primary-text)   /* Brand color text */
```

### Special
```css
var(--ds-color-backdrop)       /* Modal/overlay backdrop */
```

---

## 🌑 Shadows

```css
var(--ds-shadow-none)          /* No shadow */
var(--ds-shadow-overlay-sm)    /* Light overlay shadow */
var(--ds-shadow-overlay-md)    /* Medium overlay shadow */
var(--ds-shadow-overlay-lg)    /* Heavy overlay shadow */
```

---

## 🔘 Border Radius

```css
var(--ds-radius-none)   /* 0 */
var(--ds-radius-sm)     /* 4px */
var(--ds-radius-md)     /* 8px */
var(--ds-radius-lg)     /* 12px */
var(--ds-radius-xl)     /* 16px */
var(--ds-radius-2xl)    /* 24px */
var(--ds-radius-full)   /* 9999px (circle) */
```

---

## 📏 Spacing

```css
var(--ds-space-0)   /* 0 */
var(--ds-space-1)   /* 4px */
var(--ds-space-2)   /* 8px */
var(--ds-space-3)   /* 12px */
var(--ds-space-4)   /* 16px */
var(--ds-space-5)   /* 20px */
var(--ds-space-6)   /* 24px */
var(--ds-space-8)   /* 32px */
var(--ds-space-10)  /* 40px */
var(--ds-space-12)  /* 48px */
```

---

## ✅ Quick Examples

### Button
```tsx
<button style={{
  background: 'var(--ds-color-primary-bg)',
  color: 'var(--ds-color-primary-text)',
  borderRadius: 'var(--ds-radius-md)',
  padding: 'var(--ds-space-2) var(--ds-space-4)'
}}>
  Click me
</button>
```

### Card
```tsx
<div style={{
  background: 'var(--ds-color-surface-base)',
  border: '1px solid var(--ds-color-border-subtle)',
  borderRadius: 'var(--ds-radius-lg)',
  padding: 'var(--ds-space-4)',
  boxShadow: 'var(--ds-shadow-overlay-sm)'
}}>
  Card content
</div>
```

### Modal Backdrop
```tsx
<div style={{
  background: 'var(--ds-color-backdrop)',
  position: 'fixed',
  inset: 0
}} />
```

### Overlay
```tsx
<div style={{
  background: 'var(--ds-color-surface-base)',
  borderRadius: 'var(--ds-radius-md)',
  boxShadow: 'var(--ds-shadow-overlay-md)',
  padding: 'var(--ds-space-3)'
}}>
  Popover content
</div>
```

---

## ❌ Common Mistakes

### DON'T use hex colors
```tsx
// ❌ Will fail CI!
<div style={{ color: '#000000' }} />

// ✅ Use token instead
<div style={{ color: 'var(--ds-color-text)' }} />
```

### DON'T use raw rgba
```tsx
// ❌ Will fail CI!
<div style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }} />

// ✅ Use token instead
<div style={{ boxShadow: 'var(--ds-shadow-overlay-md)' }} />
```

### DON'T use pixel values for radius
```tsx
// ❌ Will fail CI!
<div style={{ borderRadius: '8px' }} />

// ✅ Use token instead
<div style={{ borderRadius: 'var(--ds-radius-md)' }} />
```

---

## 🚀 Auto-Fix

Most violations can be auto-fixed:

```bash
# Auto-fix with Refiner
node scripts/refiner/index.mjs --apply=true
```

---

## 📖 Full Documentation

See [TOKEN_ENFORCEMENT_SYSTEM.md](./TOKEN_ENFORCEMENT_SYSTEM.md) for complete details.
