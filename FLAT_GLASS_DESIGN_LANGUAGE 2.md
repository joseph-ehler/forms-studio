# 🎨 Flat + Glassmorphic Design Language

**Created**: October 22, 2025  
**Philosophy**: Flat by default, elevation through interaction, glass for depth

---

## 🎯 Core Principles

### 1. FLAT by Default
- **NO shadows** on resting state
- Clean, minimal aesthetic
- Reduces visual noise
- Modern, sophisticated

### 2. Elevation on Interaction
- Shadows **ONLY** appear on:
  - Hover (floating)
  - Active (pressed)
  - Focus (accessibility)
- Creates **responsive** feel
- Guides user interaction

### 3. Two-Layer Shadow System
Every interactive shadow uses **2 layers**:

**Layer 1: Hard Edge** (tight, defined)
- Creates crisp boundary
- Defines object edge
- Small blur, tight offset

**Layer 2: Soft Depth** (spread, blurred)
- Creates floating effect
- Adds dimensionality
- Large blur, y-offset, inset

---

## 📐 Shadow Anatomy

### Hover Shadow (Medium)
```css
box-shadow: 
  0 2px 4px 0 rgba(0, 0, 0, 0.16),        /* Hard edge */
  0 8px 16px -4px rgba(0, 0, 0, 0.12);    /* Soft depth */
```

**Breakdown**:
- **Hard**: `2px` y-offset, `4px` blur, `16%` opacity
- **Soft**: `8px` y-offset, `16px` blur, `-4px` spread (inset), `12%` opacity

**Effect**: Object appears to **float** 8px above surface

---

## 🎨 Shadow Tokens

### Hover States (Floating)
```typescript
SHADOW_TOKENS.hover = {
  subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
  medium: '0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12)',
  strong: '0 4px 6px 0 rgba(0, 0, 0, 0.20), 0 12px 24px -6px rgba(0, 0, 0, 0.16)',
}
```

**When to use**:
- **Subtle**: Secondary buttons, tertiary actions
- **Medium**: Primary buttons, cards
- **Strong**: Modals, drawers, key focus areas

### Active States (Pressed)
```typescript
SHADOW_TOKENS.active = {
  subtle: '0 1px 1px 0 rgba(0, 0, 0, 0.10), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  medium: '0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08)',
}
```

**When to use**:
- **Subtle**: Buttons that should feel "pressed flat"
- **Medium**: Buttons that maintain elevation when pressed

---

## 💎 Glassmorphism Tokens

### Glass Presets
```typescript
GLASS_TOKENS.presets = {
  subtle: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(8px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  standard: {
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
  },
  heavy: {
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(16px) saturate(180%)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  },
}
```

**Usage**:
```tsx
import { GLASS_TOKENS } from '@/tokens'

<div style={{
  ...GLASS_TOKENS.presets.standard,
  padding: '24px',
  borderRadius: '12px',
}}>
  Glass card content
</div>
```

---

## 🎨 Component Applications

### Buttons

**Resting State**: FLAT (no shadow)
```css
.ds-button {
  box-shadow: none;
}
```

**Hover**: Floating elevation
```css
.ds-button:hover {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px); /* Lifts up */
}
```

**Active**: Pressed but still elevated
```css
.ds-button:active {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.12), 0 4px 8px -2px rgba(0, 0, 0, 0.08);
  transform: translateY(0px); /* Returns to surface */
}
```

### Inputs

**Always FLAT**:
```css
.ds-input {
  box-shadow: none !important;
  border: 1px solid rgb(209, 213, 219);
}
```

**Focus**: Border + ring only
```css
.ds-input:focus {
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}
```

### Cards (Glassmorphic)

```tsx
<div style={{
  ...GLASS_TOKENS.presets.standard,
  borderRadius: '12px',
  padding: '24px',
}}>
  Frosted glass card
</div>
```

---

## 📊 Visual Hierarchy

### Elevation Levels

```
Resting:   FLAT (0px) ────────────
Hover:     Floating (8px) ↑ ── ──
Active:    Slight (4px) ↑ ────
Focus:     Ring only ────────────
```

**Transformation**:
- Hover: `translateY(-1px)` - Lifts up
- Active: `translateY(0px)` - Returns to surface
- Disabled: No transform

---

## 🎛️ Playground Integration

### Shadow Intensity Slider
Controls shadow opacity multiplier:

**0% Intensity**: Nearly invisible shadows
```css
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.00), 0 8px 16px -4px rgba(0, 0, 0, 0.00);
```

**10% Intensity** (Default):
```css
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12);
```

**50% Intensity**: Very dramatic
```css
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.80), 0 8px 16px -4px rgba(0, 0, 0, 0.60);
```

---

## 🛠️ Implementation Examples

### Custom Glassmorphic Modal
```tsx
import { GLASS_TOKENS, SHADOW_TOKENS } from '@/tokens'

function GlassModal({ children }) {
  return (
    <div style={{
      ...GLASS_TOKENS.presets.heavy,
      borderRadius: '16px',
      padding: '32px',
      boxShadow: SHADOW_TOKENS.hover.strong,
      transform: 'translateY(-2px)',
    }}>
      {children}
    </div>
  )
}
```

### Flat Interactive Card
```tsx
function InteractiveCard({ children }) {
  return (
    <div 
      className="flat-card"
      style={{
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgb(229, 231, 235)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'translateY(0px)'
      }}
    >
      {children}
    </div>
  )
}
```

---

## 📋 Design Decision Matrix

| Element | Resting | Hover | Active | Rationale |
|---------|---------|-------|--------|-----------|
| **Primary Button** | Flat | Float (medium) | Pressed (medium) | Main CTA needs clear feedback |
| **Secondary Button** | Flat | Float (subtle) | Flat | Less emphasis than primary |
| **Tertiary Button** | Flat | Flat | Flat | Minimal visual weight |
| **Input** | Flat | Flat | Flat + ring | Focus via border/ring only |
| **Card** | Flat | Float (subtle) | - | Optional interactivity |
| **Modal** | Float (strong) | - | - | Always elevated |
| **Dropdown** | Float (medium) | - | - | Elevated when open |

---

## 🎨 Color + Shadow Pairing

### Light Backgrounds
```css
/* White/light surfaces */
background: rgb(255, 255, 255);
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16), 0 8px 16px -4px rgba(0, 0, 0, 0.12);
```

### Dark Mode
```css
/* Dark surfaces - softer shadows */
background: rgb(31, 41, 55);
box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.40), 0 8px 16px -4px rgba(0, 0, 0, 0.30);
```

**Note**: Dark mode needs **stronger** shadows for visibility

---

## ✅ Accessibility

### Focus States
**Always visible**, regardless of flat design:
```css
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
  outline: none;
}
```

### Error States
```css
input[aria-invalid="true"]:focus {
  border-color: rgb(220, 38, 38);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}
```

---

## 🚀 Migration Guide

### Before (Old shadows everywhere)
```css
.button {
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
.card {
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.input {
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}
```

### After (Flat + interactive)
```css
.button {
  box-shadow: none; /* FLAT at rest */
}
.button:hover {
  box-shadow: 0 2px 4px 0 rgba(0,0,0,0.16), 0 8px 16px -4px rgba(0,0,0,0.12);
  transform: translateY(-1px);
}
.card {
  box-shadow: none; /* FLAT unless interactive */
}
.input {
  box-shadow: none !important; /* ALWAYS flat */
}
```

---

## 🎯 Key Takeaways

1. **FLAT by default** - No resting shadows
2. **Two-layer shadows** - Hard edge + soft depth
3. **Inset shadows** - Start 10% smaller with y-offset
4. **Hover = Float** - Object lifts up
5. **Active = Pressed** - Returns to surface (or slight elevation)
6. **Glassmorphism** - For layered, depth-rich surfaces
7. **Accessible** - Focus rings always visible

---

**Result**: A modern, sophisticated design language that feels responsive and intentional. ✨
