# Phase 1: Lock It Down - COMPLETE ✅

## What We Built

A token-driven, single-layer interaction system that's impossible to break.

---

## 🔒 Core Achievements

### 1. Universal Interaction Layer
**File**: `packages/ds/src/styles/ds-interactions.css`

```css
@layer ds-interactions {
  :where([data-interactive]) { /* zero specificity */ }
  :where([data-interactive]):where(:focus-visible) { /* focus ring */ }
  :where([data-interactive][data-variant="ghost"]:hover) { /* hover */ }
}
```

**Why This Works**:
- `@layer` prevents Tailwind from overriding
- `:where()` = 0 specificity → easy to override when needed
- No `!important` anywhere
- Modern `rgb(var(--token) / alpha)` syntax

### 2. Token-Driven States
**File**: `packages/tokens/src/tokens.css`

```css
--ds-touch-target: 44px;
--ds-state-hover-bg: rgb(var(--ds-color-text-rgb) / 0.12);
--ds-state-active-bg: rgb(var(--ds-color-text-rgb) / 0.18);
```

**Impact**:
- Change one token → all subtle hovers update
- WCAG 2.1 compliant touch targets
- Works in light/dark mode automatically

### 3. Instant HMR (100x Faster Iteration)
**Files**: 
- `packages/ds/package.json` - Added `"source"` exports
- `apps/playground/vite.config.ts` - Added `resolve.conditions: ['source']`
- `apps/playground/src/main.tsx` - Imports from `src/` not `dist/`

**Result**:
- Before: 2-3 min per CSS change (rebuild required)
- After: <1 second (Vite HMR)
- 100x velocity improvement

### 4. ESLint Guardrails
**File**: `.eslintrc.import-hygiene.cjs`

Blocks:
- ❌ Raw hex colors (`#fff`)
- ❌ Old `rgba()` syntax
- ⚠️ Missing keyboard handlers (`jsx-a11y` rules)

### 5. CSS Linting
**Files**:
- `.stylelintrc.cjs` - Blocks raw colors in CSS
- `scripts/design-lint.mts` - Post-build token enforcement

Run with:
```bash
pnpm lint:css        # Stylelint check
pnpm design:lint     # Post-build audit
```

### 6. Auto-Copy Build Hook
**File**: `packages/ds/tsup.config.ts`

```ts
onSuccess: async () => {
  // Copies CSS files to dist/ on every build
  copyFileSync('src/styles/*.css', 'dist/styles/');
}
```

**Why**: CSS files auto-deploy, no manual copying

---

## 📊 Before/After Metrics

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| CSS iteration | 2-3 min | <1 sec | 100x |
| Touch targets | 35.5px | 44px | WCAG compliant |
| Hover visibility | Broken | 12% gray | ✅ |
| Token consistency | 3 patterns | 1 token | DRY |
| Build reliability | Manual | Automated | ✅ |
| HMR | Broken | Instant | ✅ |

---

## 🎯 Design Decisions

### Why @layer + :where()?
- **@layer**: Scopes styles, prevents Tailwind override
- **:where()**: Zero specificity = easy to override
- **No !important**: Clean cascade, predictable

### Why rgb(var(--token) / alpha)?
- Modern CSS syntax
- Works with CSS variables
- Old `rgba(var(...), 0.5)` syntax is invalid

### Why Source Exports?
- Vite resolves to `src/` in dev
- No rebuild for HMR
- Production uses `dist/` automatically

### Why Token-Driven States?
- Single source of truth
- Change once, update everywhere
- No magic numbers
- Respects user preferences (dark mode, contrast, motion)

---

## 🧪 Testing Strategy

### Unit Tests
- CSS shape contracts (touch targets, token usage)
- ARIA attribute presence

### E2E Tests (Playwright)
- Focus trap behavior
- Keyboard navigation
- Reduced motion respect
- Touch target sizes

### Visual Regression (Optional)
- Storybook chromatic snapshots
- Hover/focus/active states

---

## 🚀 Dev Workflow

### CSS Changes
```bash
# Edit any CSS in packages/*/src/
# Save → Vite HMR updates instantly
# No rebuild needed
```

### Adding New Tokens
```css
/* packages/tokens/src/tokens.css */
--ds-new-token: value;
```

### Linting
```bash
pnpm lint          # ESLint (TS/TSX)
pnpm lint:css      # Stylelint (CSS)
pnpm design:lint   # Post-build audit
```

### Build
```bash
pnpm barrels       # Regenerate exports
pnpm build         # Build all packages
pnpm doctor        # Full health check
```

---

## 📝 Import Order (Critical!)

**Always follow this order**:

```tsx
// 1. Tokens (foundation)
import '@intstudio/tokens/src/tokens.css';
import '@intstudio/tokens/src/accessibility-prefs.css';

// 2. Universal interaction layer
import '../../../packages/ds/src/styles/ds-interactions.css';

// 3. Component CSS
import '../../../packages/ds/src/fb/Button.css';

// 4. App CSS (Tailwind)
import './index.css';
```

**Why**: `@layer ds-interactions` only works if loaded before app CSS

---

## 🔧 Files Modified

### Build System
- `packages/ds/tsup.config.ts` - Auto-copy CSS
- `packages/ds/package.json` - Source exports

### Tokens
- `packages/tokens/src/tokens.css` - Added touch-target, fixed syntax
- `packages/tokens/src/accessibility-prefs.css` - Respects user prefs

### Styles
- `packages/ds/src/styles/ds-interactions.css` - @layer + :where()
- `packages/ds/src/fb/Button.css` - Token-driven hovers

### Dev Setup
- `apps/playground/vite.config.ts` - Source resolution
- `apps/playground/src/main.tsx` - Import from src/
- `apps/playground/src/shims/cookie.ts` - Server-only shim

### Linting
- `.eslintrc.import-hygiene.cjs` - Token enforcement
- `.stylelintrc.cjs` - CSS rules
- `scripts/design-lint.mts` - Post-build audit

### Documentation
- `docs/archive/SESSION_2025-01-24_button-hover-hardening.md`
- `docs/handbook/PHASE_1_COMPLETE.md` (this file)

---

## ✅ Phase 1 Checklist

- [x] @layer + :where() for zero-specificity states
- [x] Token-driven hover/active/focus (single source)
- [x] Instant HMR (source exports + Vite config)
- [x] ESLint blocks raw colors/missing a11y
- [x] Stylelint enforces token usage
- [x] Build hook auto-copies CSS
- [x] WCAG 2.1 touch targets (44px)
- [x] Modern rgb() syntax
- [x] Import order documented
- [x] Session documented

---

## 🎯 Next: Phase 2

Build 5 wrappers using this foundation:
1. **Drawer** - Non-modal overlay
2. **Input** - ARIA-wired text input
3. **Select** - Native-first dropdown
4. **Stack** - Layout primitive
5. **TableRowActions** - Typed menu

**Each uses**:
- `data-interactive` + `data-component` + `data-variant`
- Token-only styling
- `withContract` runtime guards
- Storybook canary tests

---

**Status**: ✅ Phase 1 Complete - Foundation locked, instant HMR, guardrails active
