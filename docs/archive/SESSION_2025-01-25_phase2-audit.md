# Phase 2 Implementation Audit - Final Polish Checklist

**Date:** 2025-01-25  
**Status:** 🔍 AUDIT IN PROGRESS

---

## ✅ Behavior & Mechanics

### ✅ Single scrim owner is enforced
**Status:** ✅ COMPLETE

**Evidence:**
- `overlay-policy.ts` maintains single stack with `pushOverlay()`
- All shells call `pushOverlay({ id, blocking, onClose })`
  - ModalShell: `blocking: true` ✅
  - DrawerShell: `blocking: true` (only in overlay mode) ✅
  - PopoverShell: Does NOT call pushOverlay (non-blocking) ✅
  - OverlaySheet: `blocking` prop passed through ✅

**Location:** `packages/ds/src/shell/behavior/overlay-policy.ts` lines 46-74

---

### ⚠️ Underlay root set at boot
**Status:** ⚠️ NEEDS IMPLEMENTATION

**Current State:**
- `setUnderlayRoot()` function exists in `overlay-policy.ts` ✅
- Fallback chain works (app-root → storybook-root → body) ✅
- **MISSING:** AppShell doesn't call `setUnderlayRoot(appMainRef)` on mount ❌

**Action Required:**
```tsx
// In AppShell.tsx
const mainRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (mainRef.current) {
    setUnderlayRoot(mainRef.current);
  }
}, []);

return <main ref={mainRef} id="app-main">...</main>
```

---

### ✅ Body lock on documentElement
**Status:** ✅ COMPLETE

**Evidence:**
- `overlay-policy.ts` line 135: `document.documentElement.style.overflow = 'hidden'`
- Line 136: `document.documentElement.style.overscrollBehavior = 'contain'` ✅ (iOS bounce fix)
- Lines 138-140: Scrollbar width compensation ✅

---

### ⚠️ Focus trap + restore
**Status:** ⚠️ MOSTLY COMPLETE, MINOR ENHANCEMENT NEEDED

**Current State:**
- Restore fallbacks implemented ✅ (`focus-policy.ts` lines 122-149)
- **Blocking overlays only:** Modal/Drawer trap focus ✅
- **Non-blocking:** Popover only captures/restores (no trap) ✅

**Enhancement Needed:**
- ESC handling doesn't check if input is editable
- Could add IME guard (optional, low priority)

**Recommended:**
```typescript
// In trapFocus
if (e.key === 'Escape' && onEscape) {
  // Optional: Skip if in editable field with uncommitted input
  const target = e.target as HTMLElement;
  if (target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
    // Let input handle ESC first
    return;
  }
  e.preventDefault();
  onEscape();
}
```

---

### ✅ Dev duplicate ID guard
**Status:** ✅ COMPLETE

**Evidence:**
- `overlay-policy.ts` lines 54-58: Dev-only duplicate ID warning ✅
- Lines 205-212: `__overlayDebug` only in dev builds ✅
```typescript
export const __overlayDebug =
  process.env.NODE_ENV !== 'production'
    ? { getOrder, getTopmostBlocking, getLockCount, getStackSize }
    : undefined;
```

---

## ✅ OverlaySheet & Shells

### ✅ Use React portals, not manual DOM juggling
**Status:** ✅ COMPLETE

**Evidence:**
- `OverlaySheet.tsx` line 141: `return createPortal(...)` ✅
- No manual DOM manipulation ✅
- Proper reconciliation ✅

---

### ⚠️ Inline styles → CSS tokens
**Status:** ⚠️ USING INLINE WITH TOKENS (acceptable, but could improve)

**Current State:**
```tsx
style={{
  zIndex: 'var(--ds-z-scrim, 50)',  // Using tokens ✅
  background: 'rgba(0, 0, 0, 0.5)', // Hardcoded alpha ⚠️
}}
```

**Recommendation:** Create CSS classes

**Action:** Create `OverlaySheet.css` (optional polish)
```css
.overlay-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: var(--ds-overlay-scrim-bg, rgba(0, 0, 0, 0.5));
  z-index: var(--ds-z-scrim, 50);
}

.overlay-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: var(--ds-z-shell, 51);
  outline: none;
}
```

**Priority:** LOW (current implementation works, just less themeable)

---

### ⚠️ BottomSheet slots are padding-free
**Status:** ⚠️ NEEDS VERIFICATION

**Need to Check:**
- `shell/micro/BottomSheet/BottomSheet.css`
- Ensure `.bottom-sheet-shell__header/content/footer` have `padding: 0`

**Location to verify:** `packages/ds/src/shell/micro/BottomSheet/BottomSheet.css`

---

### ✅ Blocking vs non-blocking
**Status:** ✅ COMPLETE

**Evidence:**
- BottomSheet: `blocking: true` ✅
- ModalShell: `blocking: true` ✅
- DrawerShell: `blocking: true` (overlay mode only) ✅
- PopoverShell: Does NOT call pushOverlay (non-blocking by design) ✅

---

## ✅ Variants & Contracts

### ✅ Variants → attrs/vars only (no inline style)
**Status:** ✅ COMPLETE

**Evidence:**
- `variant-resolver.ts` applies only `data-*` attrs and `--shell-*` vars ✅
- RAF batching implemented (lines 56-82) ✅

### ⚠️ RAF flood guard
**Status:** ⚠️ NOT IMPLEMENTED

**Current:** Every call schedules new RAF
**Needed:** Coalesce multiple calls into single RAF

**Action Required:**
```typescript
let pendingRAF: number | null = null;
let pendingUpdates: Map<HTMLElement, { attrs, vars }> = new Map();

export function applyContract(element, contract) {
  pendingUpdates.set(element, contract);
  
  if (pendingRAF === null) {
    pendingRAF = requestAnimationFrame(() => {
      pendingUpdates.forEach((contract, el) => {
        // Apply attrs/vars
      });
      pendingUpdates.clear();
      pendingRAF = null;
    });
  }
}
```

**Priority:** MEDIUM (nice-to-have optimization)

---

### ❌ Variant Matrix docs
**Status:** ❌ NOT CREATED

**Action Required:** Add tables to shell docs

**Example for ModalShell:**
| Prop | Data Attr | CSS Var | CSS Selector |
|------|-----------|---------|--------------|
| `size="md"` | `data-size="md"` | - | `.modal-shell[data-size="md"]` |
| `open={true}` | - | - | (portal rendered) |

**Priority:** MEDIUM (helps maintainability)

---

## ❌ Testing & Tooling

### ❌ Canaries (add now)
**Status:** ❌ NOT IMPLEMENTED

**Need to Create:** 4 Playwright tests

**File:** `packages/ds/tests/shell-canaries.spec.ts`

**Tests Needed:**
1. Mode flip via `setShellEnvironment`
2. Single scrim with stacked overlays
3. Z-order matches tokens
4. Container query switch in AppShell.Main

**Priority:** HIGH (validation)

---

### ❌ ESLint guard
**Status:** ❌ NOT IMPLEMENTED

**Need to Create:** ESLint rule

**File:** `.eslintrc.js` or `tools/eslint-plugin-cascade/rules/no-primitive-imports.js`

**Rule:**
```javascript
'no-restricted-imports': ['error', {
  patterns: [{
    group: ['@intstudio/ds/primitives/*', '@ds/primitives/*'],
    message: 'Import shells from @intstudio/ds/shell. Primitives are for shells only.'
  }]
}]
```

**Priority:** HIGH (enforce boundaries)

---

### ❌ Storybook determinism
**Status:** ❌ NOT IMPLEMENTED

**Need:** Global decorator for `setShellEnvironment` controls

**Priority:** MEDIUM (nice DX improvement)

---

## ⚠️ Accessibility & Internationalization

### ⚠️ ARIA correctness
**Status:** ⚠️ MOSTLY COMPLETE

**Current:**
- `role="dialog"` ✅
- `aria-modal={blocking}` ✅
- `aria-label` accepted as prop ✅

**Missing:**
- `aria-labelledby` support (shells should wire Header id)

**Enhancement:**
```tsx
const headerId = useId();

<ModalShell.Header id={headerId}>
  <h2>Title</h2>
</ModalShell.Header>

// Modal should set aria-labelledby={headerId}
```

**Priority:** MEDIUM (current works, this is enhancement)

---

### ❌ RTL & logical properties
**Status:** ❌ NOT IMPLEMENTED

**DrawerShell** uses `left`/`right` instead of `inset-inline-start`/`end`

**Action Required:**
```css
/* Instead of */
.drawer-shell[data-side="left"] { left: 0; }
.drawer-shell[data-side="right"] { right: 0; }

/* Use */
.drawer-shell[data-side="left"] { inset-inline-start: 0; }
.drawer-shell[data-side="right"] { inset-inline-end: 0; }
```

**Priority:** MEDIUM (i18n requirement)

---

### ✅ Reduced motion
**Status:** ✅ IN CSS

**Evidence:** CSS files respect `@media (prefers-reduced-motion: reduce)`

---

## ⚠️ Deprecations & Release Management

### ✅ Duplicate export resolved
**Status:** ✅ COMPLETE

**Evidence:**
- `shell/micro/index.ts` line 11: BottomSheet export commented out ✅
- Primitives version still exported ✅
- No conflict ✅

---

### ⚠️ Deprecation annotations
**Status:** ⚠️ NEEDS JSDoc @deprecated

**Action Required:**
```typescript
// In primitives/BottomSheet/index.ts
/** 
 * @deprecated Use @intstudio/ds/shell/micro/BottomSheet instead.
 * This full-featured version will be removed in v3.0.
 */
export { BottomSheet } from './BottomSheet';
```

**Priority:** HIGH (DX)

---

### ❌ CHANGELOG & Semver
**Status:** ❌ NOT CREATED

**Need:** CHANGELOG.md entry for Phase 2

**Priority:** HIGH (before release)

---

### ❌ Bundle hygiene
**Status:** ❌ NOT VERIFIED

**Need:** Check tree-shaking works

**Action:** Run `pnpm build` and analyze bundle

**Priority:** MEDIUM

---

## 📊 Summary Score

| Category | Status | Score |
|----------|--------|-------|
| **Behavior & Mechanics** | ⚠️ Mostly Complete | 4/5 |
| **OverlaySheet & Shells** | ⚠️ Mostly Complete | 4/5 |
| **Variants & Contracts** | ⚠️ Good Shape | 3/5 |
| **Testing & Tooling** | ❌ Critical Gap | 0/5 |
| **A11y & i18n** | ⚠️ Good, Needs Polish | 3/5 |
| **Deprecations & Release** | ⚠️ Needs Docs | 2/5 |
| **TOTAL** | **⚠️ GOOD FOUNDATION** | **16/30** |

---

## 🎯 Critical Path to Ship

### HIGH Priority (Must Fix)
1. ❌ **Add 4 Playwright canaries** - Validation
2. ❌ **Add ESLint no-primitive-imports rule** - Boundary enforcement
3. ⚠️ **Call `setUnderlayRoot()` from AppShell** - Safety
4. ⚠️ **Add `@deprecated` JSDoc annotations** - DX
5. ❌ **Write CHANGELOG entry** - Release management

### MEDIUM Priority (Should Fix)
6. ⚠️ **Verify BottomSheet slots padding-free** - Contract
7. ⚠️ **Add RAF flood guard to variant-resolver** - Performance
8. ⚠️ **Add Variant Matrix docs** - Maintainability
9. ❌ **Fix DrawerShell RTL (logical properties)** - i18n
10. ⚠️ **Move inline styles to CSS classes** - Themeability

### LOW Priority (Nice-to-Have)
11. ⚠️ **Add IME/input ESC guard to focus trap** - Edge case
12. ⚠️ **Add aria-labelledby support** - A11y enhancement
13. ❌ **Storybook setShellEnvironment controls** - DX
14. ❌ **Verify bundle tree-shaking** - Performance

---

## 🚦 Ship Decision

**Current Grade:** B+ (Good foundation, critical gaps in testing/docs)

**Can Ship After:**
1. Adding canaries (#1)
2. Adding ESLint guard (#2)
3. AppShell calls setUnderlayRoot (#3)
4. Deprecation annotations (#4)
5. CHANGELOG (#5)

**Estimated Time:** 1-2 hours for critical path

**Then Grade:** A- (Production-ready with minor polish remaining)

---

**Next Actions:** Address HIGH priority items in order 1-5.
