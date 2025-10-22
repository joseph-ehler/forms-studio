# 🎨 Token Usage Patterns - Complete Guide

**Created**: October 22, 2025  
**Purpose**: Best practices for using design tokens in every scenario

---

## 📚 Table of Contents

1. [Basic Patterns](#basic-patterns)
2. [Field Components](#field-components)
3. [Custom Components](#custom-components)
4. [Conditional Styling](#conditional-styling)
5. [Responsive Design](#responsive-design)
6. [Dark Mode](#dark-mode)
7. [Animation](#animation)
8. [Common Mistakes](#common-mistakes)

---

## Basic Patterns

### Pattern 1: Use Design System Classes (Preferred)

```tsx
// ✅ BEST - Design system handles everything
<input className="ds-input w-full" />
<textarea className="ds-input ds-textarea w-full" />
<button className="ds-button">Submit</button>
```

**Why**: Automatic updates, consistent styling, playground-controllable.

### Pattern 2: Import Tokens for Custom Styling

```tsx
import { COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from '@joseph.ehler/wizard-react/tokens'

<div style={{
  backgroundColor: COLOR_TOKENS.neutral.bg,
  borderRadius: RADIUS_TOKENS.md,
  boxShadow: SHADOW_TOKENS.sm,
}}>
  Custom component
</div>
```

**When**: Building custom components not covered by design system.

### Pattern 3: Helper Functions

```tsx
import { getNeutralColor, getRadius, getShadow } from '@joseph.ehler/wizard-react/tokens'

<div style={{
  color: getNeutralColor('text'),
  borderRadius: getRadius('md'),
  boxShadow: getShadow('sm'),
}}>
  With helpers
</div>
```

**When**: Need type-safe token access.

---

## Field Components

### Input Fields

```tsx
// ✅ Standard input
<input 
  type="text"
  className="ds-input w-full"
  placeholder="Enter text..."
/>

// ✅ Input with icon (left)
<input 
  type="email"
  className="ds-input w-full pl-10"  // Extra padding for icon
  placeholder="email@example.com"
/>

// ✅ Input with icon (right)
<input 
  type="password"
  className="ds-input w-full pr-10"  // Extra padding for toggle
/>

// ✅ Input with both icons
<input 
  type="search"
  className="ds-input w-full pl-10 pr-10"  // Both sides
/>
```

### Textareas

```tsx
// ✅ Standard textarea
<textarea 
  className="ds-input ds-textarea w-full resize-y"
  rows={4}
/>

// ❌ WRONG - Don't use custom heights
<textarea 
  className="min-h-[120px] rounded-md border-gray-300"
/>
```

### Buttons

```tsx
// ✅ Primary button
<button className="ds-button">
  Submit
</button>

// ✅ Secondary button (if you create the variant)
<button className="ds-button ds-button--secondary">
  Cancel
</button>

// ❌ WRONG - Don't hardcode button styles
<button className="rounded-lg bg-blue-600 px-4 py-2">
  Submit
</button>
```

---

## Custom Components

### Cards

```tsx
import { COLOR_TOKENS, RADIUS_TOKENS, SHADOW_TOKENS } from '@/tokens'

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      backgroundColor: COLOR_TOKENS.neutral.bg,
      border: `1px solid ${COLOR_TOKENS.neutral.border}`,
      borderRadius: RADIUS_TOKENS.lg,
      boxShadow: SHADOW_TOKENS.md,
      padding: '24px',
    }}>
      {children}
    </div>
  )
}
```

### Badges

```tsx
import { COLOR_TOKENS, RADIUS_TOKENS } from '@/tokens'

function Badge({ variant, children }: { variant: 'success' | 'error' | 'warning', children: React.ReactNode }) {
  const colors = {
    success: { bg: COLOR_TOKENS.semantic.successBg, text: COLOR_TOKENS.semantic.success },
    error: { bg: COLOR_TOKENS.semantic.errorBg, text: COLOR_TOKENS.semantic.error },
    warning: { bg: COLOR_TOKENS.semantic.warningBg, text: COLOR_TOKENS.semantic.warning },
  }
  
  return (
    <span style={{
      backgroundColor: colors[variant].bg,
      color: colors[variant].text,
      borderRadius: RADIUS_TOKENS.full,
      padding: '4px 12px',
      fontSize: '12px',
      fontWeight: 600,
    }}>
      {children}
    </span>
  )
}
```

---

## Conditional Styling

### State-Based Colors

```tsx
import { COLOR_TOKENS } from '@/tokens'

function StatusIndicator({ status }: { status: 'idle' | 'loading' | 'success' | 'error' }) {
  const getColor = () => {
    switch (status) {
      case 'success': return COLOR_TOKENS.semantic.success
      case 'error': return COLOR_TOKENS.semantic.error
      case 'loading': return COLOR_TOKENS.interactive.primary
      default: return COLOR_TOKENS.neutral.textMuted
    }
  }
  
  return <div style={{ color: getColor() }}>{status}</div>
}
```

### Interactive States

```tsx
import { COLOR_TOKENS, TRANSITION_TOKENS } from '@/tokens'

function HoverCard() {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? COLOR_TOKENS.neutral.bgHover : COLOR_TOKENS.neutral.bg,
        borderColor: isHovered ? COLOR_TOKENS.neutral.borderHover : COLOR_TOKENS.neutral.border,
        transition: TRANSITION_TOKENS.common.colors,
      }}
    >
      Hover me
    </div>
  )
}
```

---

## Responsive Design

### Mobile-First Heights

```tsx
import { INTERACTIVE_TOKENS } from '@/tokens'

// ✅ Design system handles this automatically
<input className="ds-input w-full" />

// Mobile: 48px (INTERACTIVE_TOKENS.minHeight.mobile)
// Desktop: 40px (INTERACTIVE_TOKENS.minHeight.desktop)

// ❌ WRONG - Don't override heights
<input 
  className="ds-input min-h-[36px]"  // Breaks mobile touch targets!
/>
```

### Responsive Padding

```tsx
<div className="ds-input w-full">
  {/* Padding is handled by .ds-input */}
  {/* Mobile: 12px 16px */}
  {/* Desktop: 10px 14px */}
</div>
```

---

## Dark Mode

### Using COLOR_TOKENS for Dark Mode

```tsx
import { COLOR_TOKENS } from '@/tokens'

// Create dark mode palette
const DARK_COLORS = {
  text: 'rgb(243, 244, 246)',        // gray-100
  textMuted: 'rgb(156, 163, 175)',   // gray-400
  border: 'rgb(75, 85, 99)',         // gray-600
  bg: 'rgb(31, 41, 55)',             // gray-800
  bgHover: 'rgb(55, 65, 81)',        // gray-700
}

function ThemedComponent() {
  const [isDark, setIsDark] = useState(false)
  const colors = isDark ? DARK_COLORS : COLOR_TOKENS.neutral
  
  return (
    <div style={{
      backgroundColor: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`,
    }}>
      Themed content
    </div>
  )
}
```

### data-theme Attribute

```tsx
// Apply theme at root
<html data-theme={isDark ? 'dark' : 'light'}>
  ...
</html>

// CSS handles the rest
[data-theme="dark"] .ds-input {
  background-color: rgb(31, 41, 55);
  color: rgb(243, 244, 246);
  border-color: rgb(75, 85, 99);
}
```

---

## Animation

### Transitions

```tsx
import { TRANSITION_TOKENS } from '@/tokens'

// ✅ Use common transitions
<div style={{
  transition: TRANSITION_TOKENS.common.all,
}}>
  Animates everything
</div>

// ✅ Use specific transitions
<div style={{
  transition: TRANSITION_TOKENS.common.colors,
}}>
  Only animates colors
</div>

// ✅ Custom transition with tokens
<div style={{
  transition: `transform ${TRANSITION_TOKENS.duration.normal} ${TRANSITION_TOKENS.easing.easeOut}`,
}}>
  Custom animation
</div>
```

### Hover Animations

```tsx
import { SHADOW_TOKENS, TRANSITION_TOKENS } from '@/tokens'

<button style={{
  boxShadow: SHADOW_TOKENS.sm,
  transition: TRANSITION_TOKENS.common.shadow,
}}
  onMouseEnter={(e) => {
    e.currentTarget.style.boxShadow = SHADOW_TOKENS.md
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.boxShadow = SHADOW_TOKENS.sm
  }}
>
  Hover for shadow
</button>
```

---

## Common Mistakes

### ❌ Mistake 1: Hardcoding Values

```tsx
// ❌ WRONG
<div className="rounded-md border-gray-300 shadow-sm">
  Hardcoded values
</div>

// ✅ CORRECT
<div className="ds-input">
  Uses tokens
</div>
```

### ❌ Mistake 2: Mixing Tailwind and Tokens

```tsx
// ❌ WRONG - Mixing approaches
<input className="ds-input rounded-lg border-blue-500" />

// ✅ CORRECT - Use design system OR tokens, not both
<input className="ds-input w-full" />
```

### ❌ Mistake 3: Overriding Design System

```tsx
// ❌ WRONG - Fighting the design system
<input 
  className="ds-input" 
  style={{ minHeight: '36px', borderRadius: '4px' }}
/>

// ✅ CORRECT - Let design system control sizing
<input className="ds-input w-full" />
```

### ❌ Mistake 4: Inline Magic Numbers

```tsx
// ❌ WRONG
<div style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
  Magic shadow
</div>

// ✅ CORRECT
import { SHADOW_TOKENS } from '@/tokens'

<div style={{ boxShadow: SHADOW_TOKENS.md }}>
  Token shadow
</div>
```

### ❌ Mistake 5: Not Using Type Helpers

```tsx
// ❌ WRONG - No type safety
<div style={{ color: COLOR_TOKENS.neutral['textt'] }}>  // Typo!
  Oops
</div>

// ✅ CORRECT - Type-safe helper
import { getNeutralColor } from '@/tokens'

<div style={{ color: getNeutralColor('text') }}>  // TypeScript catches typos
  Safe
</div>
```

---

## Token Reference Quick Guide

### Typography
```typescript
TYPO_TOKENS.size.xs | sm | md | lg | xl
TYPO_TOKENS.weight.normal | medium | semibold | bold
```

### Spacing
```typescript
SPACING_TOKENS.form.labelGap | helperGap | fieldGap | sectionGap | sectionBreak | groupGap
```

### Radius
```typescript
RADIUS_TOKENS.none | xs | sm | md | lg | xl | 2xl | full
```

### Interactive
```typescript
INTERACTIVE_TOKENS.minHeight.mobile | desktop | compact
INTERACTIVE_TOKENS.minWidth.touch | button
INTERACTIVE_TOKENS.iconSize.xs | sm | md | lg | xl
INTERACTIVE_TOKENS.focusRing.width | offset | color
```

### Colors
```typescript
COLOR_TOKENS.semantic.success | warning | error | info | [variant]Bg | [variant]Border
COLOR_TOKENS.neutral.text | textMuted | textDisabled | border | borderHover | bg | bgHover
COLOR_TOKENS.interactive.primary | primaryHover | primaryActive | focus | focusRing
```

### Shadows
```typescript
SHADOW_TOKENS.none | xs | sm | md | lg | xl | 2xl | focus | inner
```

### Transitions
```typescript
TRANSITION_TOKENS.duration.instant | fast | normal | slow | slower
TRANSITION_TOKENS.easing.linear | easeIn | easeOut | easeInOut | spring
TRANSITION_TOKENS.common.all | colors | opacity | transform | shadow
```

---

## Decision Tree

**Need to style an input/button?**
→ Use `.ds-input` or `.ds-button` class

**Building a custom component?**
→ Import tokens directly

**Need dark mode?**
→ Use `data-theme` attribute + CSS

**Need animation?**
→ Use `TRANSITION_TOKENS.common.*`

**Need semantic colors?**
→ Use `COLOR_TOKENS.semantic.*`

**Need to override?**
→ Don't! File an issue instead.

---

**Remember**: Design system owns reality. Fields just consume. Tokens are your source of truth. 🎯
