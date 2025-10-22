# 🛡️ Design System Rules - Enforced by ESLint

**Created**: October 22, 2025  
**Purpose**: Prevent drift and ensure 100% token compliance

---

## 📜 The Rules

### ❌ BANNED: Hardcoded Tailwind Utilities

The following patterns are **forbidden** in field components:

```tsx
// ❌ WRONG - Hardcoded radius
className="rounded-md"
className="rounded-lg"

// ✅ CORRECT - Use tokens
import { RADIUS_TOKENS } from '@/tokens'
className="ds-input"  // Uses RADIUS_TOKENS.md automatically
```

```tsx
// ❌ WRONG - Hardcoded height
className="min-h-[48px]"
className="min-h-[44px]"

// ✅ CORRECT - Use tokens
className="ds-input"  // Uses INTERACTIVE_TOKENS.minHeight.mobile
```

```tsx
// ❌ WRONG - Hardcoded colors
className="border-gray-300"
className="text-gray-900"
className="bg-blue-500"

// ✅ CORRECT - Use tokens
className="ds-input"  // Uses COLOR_TOKENS.neutral.* automatically
```

```tsx
// ❌ WRONG - Hardcoded shadows
className="shadow-sm"
className="shadow-md"

// ✅ CORRECT - Use tokens
className="ds-input"  // Uses SHADOW_TOKENS.xs automatically
```

```tsx
// ❌ WRONG - Hardcoded transitions
className="transition-all duration-200"
className="transition-colors"

// ✅ CORRECT - Use tokens
className="ds-input"  // Uses TRANSITION_TOKENS.common.colors
```

---

## ✅ The Approved Patterns

### Pattern 1: Use Design System Classes

```tsx
// Inputs
<input className="ds-input w-full" />

// Textareas
<textarea className="ds-input ds-textarea w-full" />

// Buttons
<button className="ds-button">Submit</button>

// Buttons with icon spacing
<input className="ds-input w-full pl-10" /> // Icon on left
<input className="ds-input w-full pr-10" /> // Icon on right
```

### Pattern 2: Use Tokens Directly (Advanced)

```tsx
import { COLOR_TOKENS, SHADOW_TOKENS, TRANSITION_TOKENS } from '@/tokens'

// Custom component with tokens
<div style={{
  backgroundColor: COLOR_TOKENS.neutral.bg,
  boxShadow: SHADOW_TOKENS.md,
  transition: TRANSITION_TOKENS.common.all,
}}>
  Custom component
</div>
```

### Pattern 3: Utility Classes for Layout Only

```tsx
// ✅ ALLOWED - Layout utilities
className="flex items-center gap-2"
className="w-full"
className="relative"
className="absolute inset-y-0"

// ❌ NOT ALLOWED - Visual styling
className="rounded-md border-gray-300"  // Use ds-input instead!
```

---

## 🎯 Why These Rules?

### Single Source of Truth
- **Before**: 14 fields × 5 properties = 70 places to update
- **After**: 1 token × 1 CSS file = 1 place to update

### Impossible to Drift
- ESLint blocks hardcoded values at commit time
- Can't accidentally use wrong color/size
- Design system compliance enforced

### Playground Works
- Tokens are live-controllable
- Sliders update everything automatically
- No scattered values to hunt down

---

## 🚨 ESLint Errors

When you use a hardcoded value, you'll see:

```bash
error: ❌ Use RADIUS_TOKENS instead of hardcoded rounded-* classes. 
       Import from '@/tokens' and use getRadius().
```

**Fix**: Replace the hardcoded class with `ds-input` or use the token directly.

---

## 📊 Compliance Checklist

Before committing:
- [ ] No `rounded-*` in field className
- [ ] No `min-h-[*]` in field className  
- [ ] No `border-gray-*` in field className
- [ ] No `text-gray-*` in field className
- [ ] No `shadow-*` in field className
- [ ] No `transition-*` in field className
- [ ] All inputs use `ds-input`
- [ ] All buttons use `ds-button`
- [ ] All textareas use `ds-input ds-textarea`

---

## 🎨 Token Reference

### Available Tokens

```typescript
// Radius
RADIUS_TOKENS.none | xs | sm | md | lg | xl | 2xl | full

// Interactive Sizing
INTERACTIVE_TOKENS.minHeight.mobile | desktop | compact
INTERACTIVE_TOKENS.minWidth.touch | button
INTERACTIVE_TOKENS.iconSize.xs | sm | md | lg | xl

// Colors
COLOR_TOKENS.semantic.success | warning | error | info
COLOR_TOKENS.neutral.text | textMuted | border | bg
COLOR_TOKENS.interactive.primary | primaryHover | focus

// Shadows
SHADOW_TOKENS.none | xs | sm | md | lg | xl | 2xl | focus

// Transitions
TRANSITION_TOKENS.duration.fast | normal | slow
TRANSITION_TOKENS.easing.easeIn | easeOut | easeInOut
TRANSITION_TOKENS.common.all | colors | opacity | transform
```

---

## 🔧 How to Fix Violations

### Example 1: Input Field

```tsx
// ❌ BEFORE
<input className="w-full min-h-[48px] rounded-md border border-gray-300" />

// ✅ AFTER
<input className="ds-input w-full" />
```

### Example 2: Button

```tsx
// ❌ BEFORE
<button className="rounded-lg bg-blue-600 hover:bg-blue-700 shadow-sm px-4 py-2">
  Submit
</button>

// ✅ AFTER
<button className="ds-button">
  Submit
</button>
```

### Example 3: Custom Component

```tsx
// ❌ BEFORE
<div className="rounded-md shadow-md border-gray-200 bg-gray-50">
  Content
</div>

// ✅ AFTER
import { RADIUS_TOKENS, SHADOW_TOKENS, COLOR_TOKENS } from '@/tokens'

<div style={{
  borderRadius: RADIUS_TOKENS.md,
  boxShadow: SHADOW_TOKENS.md,
  border: `1px solid ${COLOR_TOKENS.neutral.border}`,
  backgroundColor: COLOR_TOKENS.neutral.bgSubtle,
}}>
  Content
</div>
```

---

## 🎓 Philosophy

**Design System Owns Reality, Fields Just Consume**

```
Tokens (single source of truth)
  ↓
CSS (centralized skin)
  ↓
Design System Classes (.ds-input, .ds-button)
  ↓
Fields (MUST use classes, CANNOT hardcode)
  ↓
ESLint (enforces compliance)
```

**Result**: Change token → Everything updates. Drift impossible. ✅

---

## 📚 Related Docs

- `tokens/` - All design tokens
- `components/ds-inputs.css` - Input/button skin
- `.eslintrc.design-system.json` - ESLint rules
- `DAY_1_2_COMPLETE.md` - Radius & interactive sizing
- `SPACING_SYSTEM.md` - Spacing tokens

---

**Compliance is enforced. Drift is prevented. The design system owns reality.** 🛡️
