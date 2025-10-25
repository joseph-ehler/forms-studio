# Tailwind Safelist Configuration

## Problem

Tailwind's JIT purge will remove any classes not found during static analysis. Dynamic ramp classes like `bg-primary-${n}` or conditionally applied utilities can be purged in production, breaking the UI.

---

## Solution: Safelist Patterns

Add a safelist to your `tailwind.config.js` to preserve dynamically generated or on-demand classes.

### Recommended Configuration

```js
// tailwind.config.js (or .ts)
import { tokensTheme } from '@intstudio/tokens/tailwind-theme';

export default {
  content: [
    './apps/**/*.{ts,tsx,html}',
    './packages/**/*.{ts,tsx,html}',
    '.storybook/**/*.{ts,tsx,mdx}',
    '**/*.stories.@(tsx|mdx)',  // Include Storybook stories
  ],
  theme: {
    extend: tokensTheme,
  },
  safelist: [
    // Spacing utilities (gap, padding, margin)
    { pattern: /gap-(2|3|4|6|8)/ },
    { pattern: /p(x|y|t|b|l|r)?-(2|3|4|6|8)/ },
    { pattern: /m(x|y|t|b|l|r)?-(2|3|4|6|8)/ },
    
    // Border radius
    { pattern: /rounded-(sm|md|lg|xl|full)/ },
    
    // OKLCH ramp steps (1-12) for all semantic colors
    {
      pattern: /(bg|text|border)-(primary|neutral|success|warning|danger)-(1|2|3|4|5|6|7|8|9|10|11|12)/,
      variants: ['hover', 'focus', 'active', 'dark'],
    },
    
    // Semantic shortcuts
    { pattern: /(bg|text|border)-(surface|border)-(base|raised|sunken|subtle|medium|strong)/ },
  ],
};
```

---

## What Gets Preserved

### Ramp Steps
```tsx
// All these classes are preserved:
<div className="bg-primary-3" />
<div className="text-neutral-12" />
<div className="border-danger-10" />
```

### Variants
```tsx
// With variants:
<div className="hover:bg-primary-11 dark:bg-primary-9" />
```

### Dynamic Values
```tsx
// Even if constructed dynamically:
const step = 5;
<div className={`bg-primary-${step}`} />
```

---

## When to Update

Add to safelist when you:
1. Use ramp steps conditionally (`bg-${color}-${step}`)
2. Add new semantic color scales (e.g., `info`)
3. Use Tailwind utilities in Storybook stories
4. Generate classes via templates or loops

---

## Testing

### Check Purge Behavior
```bash
# Build for production
pnpm build

# Check if classes exist in output
grep "bg-primary-3" dist/**/*.css
```

### Visual Regression
Run Storybook tests to catch missing classes:
```bash
pnpm sb:build
pnpm sb:test:ci
```

---

## Alternative: JIT Mode Only

If you're using JIT mode and NOT purging, you can skip safelist. But production builds typically enable purge for smaller bundle sizes.

---

## Debugging Missing Classes

If a class is purged:
1. Check `content` glob includes the file
2. Add pattern to `safelist`
3. Verify class name matches Tailwind naming (no typos)
4. Rebuild: `pnpm build`

---

**Status**: This config preserves all OKLCH ramp steps (1-12) and semantic shortcuts for production builds.
