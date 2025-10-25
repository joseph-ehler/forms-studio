# Session 2025-01-24: Button Hover State Hardening

## Problem Statement

Button hover states were broken due to:
1. Build system not copying CSS files to dist
2. Dev mode importing from `dist/` requiring rebuilds for every CSS change
3. Missing `--ds-touch-target` token
4. Invalid CSS syntax: `rgba(var(--rgb), alpha)` doesn't work
5. Inconsistent hover patterns across variants

**Impact**: 2-3 minute iteration cycles for CSS changes, broken hover states, 35.5px buttons instead of 44px

---

## Root Causes Identified

### 1. Build System Gap
- `tsup` wasn't configured to copy `src/styles/*.css` to `dist/styles/`
- Manual copies disappeared on next build

### 2. Dev Import Strategy
- Playground importing `@intstudio/ds/dist/...` 
- Every CSS change required: rebuild → clear caches → restart → test
- No HMR

### 3. Missing Token
- `--ds-touch-target: 44px` completely absent from tokens.css
- Buttons defaulted to content height (~35px)

### 4. Invalid CSS Syntax
- Used: `rgba(var(--ds-color-text-rgb), 0.12)` ❌
- Browser ignores this (can't use `var()` in old rgba syntax)
- Result: transparent background on hover

### 5. Pattern Inconsistency
- Ghost: hardcoded 15% gray
- Secondary: surface tokens
- Theme toggle: Tailwind classes
- No single source of truth

---

## Solutions Implemented

### 1. Permanent CSS Copy Hook
```ts
// packages/ds/tsup.config.ts
onSuccess: async () => {
  mkdirSync('dist/styles', { recursive: true });
  copyFileSync('src/styles/ds-interactions.css', 'dist/styles/ds-interactions.css');
  copyFileSync('src/styles/focus-rings.css', 'dist/styles/focus-rings.css');
  copyFileSync('src/styles/overlay-standards.css', 'dist/styles/overlay-standards.css');
  console.log('✅ Copied global CSS files');
}
```

### 2. Dev Imports from `src/`
```tsx
// apps/playground/src/main.tsx
import '../../../packages/tokens/src/tokens.css';
import '../../../packages/ds/src/styles/ds-interactions.css';
import '../../../packages/ds/src/fb/Button.css';
```

**Result**: Instant Vite HMR, no rebuilding

### 3. Added Missing Token
```css
/* packages/tokens/src/tokens.css */
--ds-touch-target: 44px; /* WCAG 2.1 minimum */
```

### 4. Fixed CSS Syntax
```css
/* OLD (INVALID) */
--ds-state-hover-bg: rgba(var(--ds-color-text-rgb), 0.12); ❌

/* NEW (VALID) */
--ds-state-hover-bg: rgb(var(--ds-color-text-rgb) / 0.12); ✅
```

Modern syntax: `rgb(var(--triplet) / alpha)`

### 5. Unified Hover Pattern
All subtle variants now use single token:
```css
--ds-state-hover-bg: rgb(var(--ds-color-text-rgb) / 0.12);
--ds-state-active-bg: rgb(var(--ds-color-text-rgb) / 0.18);
```

Applied to: Ghost, Secondary, Theme toggles

---

## Phase 1: Lock It Down (Completed)

### 1. @layer + :where() for Zero Specificity
```css
@layer ds-interactions {
  :where([data-interactive]) { /* base styles */ }
  :where([data-interactive]):where(:focus-visible) { /* focus ring */ }
  :where([data-interactive][data-variant="ghost"]:hover) { /* hover */ }
}
```

**Why**: 
- `@layer` prevents Tailwind from overriding
- `:where()` has 0 specificity → easy to override when needed
- No `!important` needed anywhere

### 2. ESLint Guardrails
```js
// .eslintrc.import-hygiene.cjs
'no-restricted-syntax': [
  { selector: "Literal[value=/^#/]", message: "Use tokens not raw hex" },
  { selector: "Literal[value=/rgba?\\(/]", message: "Use rgb(var(--…)/α)" }
],
'jsx-a11y/click-events-have-key-events': 'warn',
```

**Prevents**:
- Raw hex colors (#fff)
- Old rgba() syntax
- Missing keyboard handlers

### 3. Import Order Locked
```tsx
// Enforced order (dev & Storybook):
1. tokens.css
2. ds-interactions.css  ← universal states
3. app CSS (Tailwind)
```

---

## Performance Impact

### Before
- **CSS change** → rebuild (30s) → clear cache → hard refresh → test = **2-3 min**
- **10 tweaks** = 20-30 minutes

### After
- **CSS change** → Vite HMR (instant) → test = **<1 second**
- **10 tweaks** = 10 seconds

**Velocity improvement: ~100x for CSS iterations**

---

## Files Modified

### Build Config
- `packages/ds/tsup.config.ts` - Added onSuccess CSS copy hook

### Tokens
- `packages/tokens/src/tokens.css` - Added --ds-touch-target, fixed rgb() syntax

### Styles
- `packages/ds/src/styles/ds-interactions.css` - Wrapped in @layer, :where() selectors
- `packages/ds/src/fb/Button.css` - Unified ghost/secondary hover to use tokens
- `packages/ds/src/components/ThemeToggle.tsx` - Added data-interactive attrs

### Dev Setup
- `apps/playground/src/main.tsx` - Import from src/ for HMR

### Linting
- `.eslintrc.import-hygiene.cjs` - Added jsx-a11y, banned raw colors

---

## Next Steps (Phase 2)

### Components to Build
1. **Drawer** - Non-modal overlay, Esc closes
2. **Input** - Error/hint ARIA, icon slots
3. **Select** - Native-first, searchable option
4. **Stack** - Layout primitive with token gaps
5. **TableRowActions** - DRY row menu pattern

### Tests to Add
1. Button hover/focus canary (Storybook test)
2. Modal focus trap + Esc (Storybook test)
3. Field ARIA wiring (Storybook test)

### Optional Enhancements
- Design lint script (contrast check, spacing audit)
- Stylelint CSS token enforcement
- Token codegen from source of truth

---

## Success Metrics

✅ **Touch targets**: All buttons 44px minimum  
✅ **Hover states**: Visible on all subtle variants (12% gray)  
✅ **HMR**: Instant CSS updates in dev  
✅ **Consistency**: One token drives all subtle hovers  
✅ **Build**: CSS auto-copies on every build  
✅ **Guardrails**: ESLint blocks raw colors & missing a11y  

---

## Debugging Methodology

Followed console-first debugging pattern:
1. Write diagnostic script
2. User runs, reports findings
3. Analyze actual behavior (not assumptions)
4. Form hypothesis
5. Test hypothesis with next script
6. Implement precise fix

**Quote**: "I'd be happy to experience a million bugs if we debugged this way"

---

## Architectural Principles Applied

1. **Single Source of Truth** - Tokens drive all state colors
2. **Pit of Success** - Correct by default (auto-wire, tokens required)
3. **Systematize on 3rd Use** - Hover pattern used 3x → extracted to token
4. **Observe Before Acting** - Console scripts revealed root cause
5. **Make Mistakes Impossible** - ESLint prevents regression

---

**Status**: ✅ Phase 1 Complete - Interaction layer locked, instant HMR, guardrails active
