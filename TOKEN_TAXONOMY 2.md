# Token Taxonomy - Strict Pyramid

**Purpose**: Prevent token bloat and complexity creep  
**Rule**: Consumers depend on **semantic only**. Themes map semantic → alias → raw.

---

## The Pyramid (3 Layers)

```
┌─────────────────────────────────┐
│  SEMANTIC (consumers use)       │  ← button.bg, input.border, ring.color
├─────────────────────────────────┤
│  ALIAS (themes map)             │  ← brand.primary, neutral.border
├─────────────────────────────────┤
│  RAW (tokens only)              │  ← rgb(37, 99, 235), 6px, 200ms
└─────────────────────────────────┘
```

**Rule**: Raw values ONLY in `/tokens/**`. Everywhere else = semantic.

---

## Semantic Tokens (Consumer Layer)

**What consumers actually use in code:**

### Interactive Elements
```typescript
button.bg           → Primary button background
button.text         → Primary button text
button.bgHover      → Hover state background
button.bgActive     → Active state background
button.bgDisabled   → Disabled state background

input.border        → Input border color
input.borderFocus   → Focused input border
input.borderError   → Error state border
input.bg            → Input background
input.text          → Input text color

ring.color          → Focus ring color
ring.width          → Focus ring width
ring.offset         → Focus ring offset
```

### Typography
```typescript
text.primary        → Main content text
text.secondary      → Supporting text
text.muted          → Disabled/placeholder
text.inverse        → Text on dark backgrounds

label.size          → Form label size
label.weight        → Form label weight
helper.size         → Helper text size
helper.color        → Helper text color
```

### Spacing
```typescript
gap.label           → Label to input gap
gap.helper          → Input to helper gap
gap.field           → Field to field gap
gap.section         → Section breaks

padding.input       → Input internal padding
padding.button      → Button internal padding
```

### Elevation
```typescript
shadow.hover        → Hover elevation
shadow.active       → Active/pressed elevation
shadow.focus        → Focus indicator shadow
```

---

## Alias Layer (Theme Mapping)

**Themes map semantics to brand/neutral aliases:**

```typescript
// Light theme
button.bg → brand.primary
input.border → neutral.border

// Dark theme
button.bg → brand.primaryLight  // Adjusted for dark bg
input.border → neutral.borderDark

// ACME brand
brand.primary → acme.orange
brand.primaryHover → acme.orangeDark
```

---

## Raw Layer (Token Files Only)

**Actual values, ONLY in `/tokens/**`:**

```typescript
// colors.ts
export const COLOR_TOKENS = {
  brand: {
    blue500: 'rgb(37, 99, 235)',      // ← RAW
    blue600: 'rgb(29, 78, 216)',      // ← RAW
  },
  neutral: {
    gray200: 'rgb(229, 231, 235)',    // ← RAW
    gray600: 'rgb(75, 85, 99)',       // ← RAW
  },
};

// spacing.ts
export const SPACING_TOKENS = {
  px6: '6px',    // ← RAW
  px8: '8px',    // ← RAW
};
```

---

## ❌ BANNED Patterns

### 1. Raw values in components
```tsx
// ❌ BAD
<button style={{ color: 'rgb(37, 99, 235)' }} />

// ✅ GOOD
<button style={{ color: 'var(--button-bg)' }} />
```

### 2. Alias in components
```tsx
// ❌ BAD
import { COLOR_TOKENS } from '@/tokens'
<button style={{ color: COLOR_TOKENS.brand.blue500 }} />

// ✅ GOOD
<button className="ds-button" />  // Uses semantic tokens
```

### 3. Creating tokens ad-hoc
```tsx
// ❌ BAD
const myCustomBlue = 'rgb(50, 120, 200)';

// ✅ GOOD
// If needed, add to tokens/colors.ts as semantic
// Then use via className or CSS var
```

---

## ✅ APPROVED Composition

### Combining semantic tokens
```tsx
// ✅ GOOD - Semantic composition
<div style={{
  color: 'var(--text-primary)',
  backgroundColor: 'var(--button-bg)',
  padding: 'var(--padding-button)',
  borderRadius: 'var(--radius-button)',
}} />
```

### Using design system classes
```tsx
// ✅ BEST - Semantic built-in
<button className="ds-button" />
<input className="ds-input" />
```

---

## Token Change Risk Assessment

**When changing tokens, assess impact:**

| Token Type | Risk | Impact | Review Required |
|------------|------|--------|-----------------|
| **Raw** (rgb values) | 🔴 HIGH | All mapped semantics | Design + Eng |
| **Alias** (brand.primary) | 🟡 MEDIUM | All referencing semantics | Design |
| **Semantic** (button.bg) | 🟢 LOW | Single component | Eng |
| **Add new semantic** | 🟢 LOW | Opt-in by consumers | None |
| **Remove semantic** | 🔴 HIGH | Breaking change | Major version |

---

## Decision Tree

**"Should I create a new token?"**

```
Is this used in 3+ places?
├─ NO → Use existing semantic token
└─ YES ↓

Is it a raw value (rgb, px, ms)?
├─ YES → Add to /tokens/[category].ts (raw layer)
└─ NO ↓

Is it brand/theme specific?
├─ YES → Add to alias layer (themes/[brand].ts)
└─ NO ↓

Is it a semantic intention (button.bg)?
├─ YES → Add to semantic layer
└─ NO → You don't need a new token
```

---

## Governance

### Token Review Checklist

Before adding a token:
- [ ] Used in 3+ places?
- [ ] Is it semantic (not raw)?
- [ ] Does similar token exist?
- [ ] Documented in this taxonomy?
- [ ] Mapped in all themes?
- [ ] Contract tests cover it?

### Token Change PR Template

```markdown
## Token Change

**Token**: `button.bgHover`
**Type**: Semantic
**Risk**: 🟡 MEDIUM

**Old Value**: rgb(29, 78, 216)
**New Value**: rgb(37, 99, 235)

**Impacted Components**: 
- All ds-button variants (7 total)
- Custom buttons using --button-bg-hover

**Contracts Affected**:
- ✅ Visual screenshots (updated)
- ✅ Contrast tests (passes 4.5:1)
- ✅ Dark theme (adjusted)

**Reason**: Improve hover contrast on light backgrounds
```

---

## Escape Hatch (Controlled)

**If you MUST override (rare):**

```html
<div data-ds-allow="spacing">
  <style>
    [data-ds-allow="spacing"] {
      --gap-field: 24px; /* Override spacing only */
    }
  </style>
</div>
```

**Allowed axes** (via `data-ds-allow`):
- `spacing` - Override gaps/padding
- `radius` - Override border radius
- `motion` - Override transitions

**Not allowed**:
- Colors (breaks theming)
- Typography (breaks consistency)
- Shadows (breaks elevation system)

**ESLint enforces**: Can only override allowed axes.

---

## Success Metrics

Track quarterly:
- Total tokens (target: <200)
- Semantic:Alias:Raw ratio (target: 3:2:5)
- Ad-hoc overrides (target: <5)
- Token churn (new+removed per month, target: <10)

---

**Keep tokens disciplined = System stays unbreakable** 🎯
