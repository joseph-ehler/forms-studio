# WCAG Contrast Issues - Debug Session 2025-10-23

## The Problem
Storybook consistently shows WCAG contrast failures:
- Helper text: #a3a3a3 (neutral-400) on white = 2.52:1 ❌
- Expected: #525252 (neutral-600) on white = 7.81:1 ✅

## What We Know is CORRECT

### ✅ Source CSS is Correct
```css
/* packages/ds/src/styles/tokens/color.vars.css line 125 */
:root,
:root[data-theme="light"][data-brand="default"] {
  --ds-color-text-muted: var(--tw-neutral-600);  /* 7.81:1 contrast */
}
```

### ✅ Built CSS is Correct
```css
/* packages/ds/dist/index.css line 89 */
--ds-color-text-muted: var(--tw-neutral-600);
```

### ✅ Typography CSS is Correct
```css
/* packages/ds/dist/index.css line 1914 */
.ds-helper--hint {
  color: var(--ds-color-text-muted);
}
```

### ✅ Raw Tokens are Correct
```css
--tw-neutral-400: #a3a3a3;  /* Dark mode value */
--tw-neutral-600: #525252;  /* Light mode value - CORRECT */
```

## What's WRONG

### ❌ Storybook Shows Dark Mode Colors
Browser debug shows:
- `data-theme: dark` OR `data-theme: NOT SET`
- `--ds-color-text-muted: #a3a3a3` OR `NOT DEFINED`
- CSS variables completely missing

### ❌ CSS Not Loading in Forms Storybook
Multiple attempts failed:
1. ❌ `import '@intstudio/ds/dist/index.css'` - package export missing
2. ❌ `import '../../ds/dist/index.css'` - Vite can't resolve
3. ❌ `preview-head.html` with `@import` - didn't work
4. ❌ Vite alias `@ds-styles` - preview.tsx fails to load
5. ❌ Direct relative imports `../../ds/src/styles/...` - **SHOULD work but doesn't**

## Root Cause

**The CSS imports in preview.tsx are failing silently.**

Vite is not loading the CSS files, even though:
- The paths are correct
- The files exist
- DS Storybook uses the EXACT same pattern and it works

## Next Steps

1. **Check if there's a Vite error in the browser console**
2. **Verify the CSS files are actually being requested** (Network tab)
3. **Try importing just ONE CSS file** to isolate the issue
4. **Compare Forms Storybook config with DS Storybook config** line-by-line

## Temporary Workaround

**Manually set light theme in browser console:**
```javascript
document.documentElement.setAttribute('data-theme', 'light');
```

Then the colors should be correct (assuming CSS loaded).
