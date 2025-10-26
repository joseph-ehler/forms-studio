# Foundation Hardening Audit

**Date:** 2025-01-25  
**Goal:** Identify gaps and harden Phases 1/2 + P0 before ship

---

## ✅ SOLID (No Action Needed)

### Phase 1: Environment Layer
- ✅ `useAppEnvironment()` - Complete
- ✅ `setShellEnvironment()` - Evented store working
- ✅ `subscribeToEnvironmentChanges()` - Hook integration solid
- **Grade:** A

### Phase 2: Behavior Layer (Core Policies)
- ✅ `pushOverlay()` - Single scrim owner enforced
- ✅ `setBodyScrollLock()` - Refcounted with iOS fix
- ✅ `setUnderlayRoot()` - Safe inert targeting
- ✅ `trapFocus()` - Tab loop with ESC
- ✅ `captureFocus()`, `restoreFocus()` - Edge cases handled
- ✅ `resolveLayout()` - Responsive decisions
- ✅ `applyContract()` - RAF batching
- **Grade:** A

### Phase 2: Primitives
- ✅ `OverlaySheet` - Using `createPortal`, composing policies
- **Grade:** A

### Phase 2: Shells (Refactored)
- ✅ `ModalShell` - Uses behavior layer (zero local code)
- ✅ `DrawerShell` - Uses behavior layer (zero local code)
- ✅ `PopoverShell` - Uses focus policies
- **Grade:** A

### Phase 2: Testing
- ✅ 4 Playwright canaries created
- ✅ ESLint guard active
- **Grade:** A

---

## ⚠️ NEEDS HARDENING (Action Required)

### 1. Event Bus Integration 🔴 HIGH
**Status:** Stub created, NOT wired

**Missing:**
- `pushOverlay()` should emit `overlay:open`/`overlay:close`
- Shells don't emit events yet

**Action:**
```typescript
// In overlay-policy.ts
import { emitShellEvent } from './shell-events';

export function pushOverlay(options) {
  // ... existing code
  
  emitShellEvent({
    type: 'overlay:open',
    id: options.id,
    blocking: options.blocking,
  });
  
  return {
    close: () => {
      // ... existing code
      emitShellEvent({
        type: 'overlay:close',
        id: options.id,
      });
    },
  };
}
```

**Priority:** HIGH (observability foundation)  
**Effort:** 15 minutes

---

### 2. Shortcut Integration 🔴 HIGH
**Status:** Broker created, NOT wired into shells

**Missing:**
- ModalShell still uses manual ESC listener
- DrawerShell still uses manual ESC listener
- No shells use the broker yet

**Action:**
```typescript
// In ModalShell.tsx
import { registerShortcut } from '../../behavior/shortcut-broker';

// Replace manual keydown listener with:
useEffect(() => {
  if (!open || !dismissOnEsc) return;
  return registerShortcut('Escape', 'modal', onClose);
}, [open, dismissOnEsc, onClose]);
```

**Priority:** HIGH (consistent keyboard handling)  
**Effort:** 30 minutes

---

### 3. GlobalProgressBar Integration 🟡 MEDIUM
**Status:** Component created, NOT rendered

**Missing:**
- AppShell doesn't render `GlobalProgressBar`
- No route transition hook

**Action:**
```typescript
// In AppShell.tsx
import { GlobalProgressBar } from './GlobalProgressBar';

return (
  <NavContext.Provider value={navContext}>
    <GlobalProgressBar />
    <div className="app-shell" ...>
      {children}
    </div>
  </NavContext.Provider>
);
```

**Priority:** MEDIUM (nice UX, not critical)  
**Effort:** 10 minutes

---

### 4. DrawerShell RTL Support 🟡 MEDIUM
**Status:** Uses `left`/`right` instead of logical properties

**Missing:**
- DrawerShell.css uses physical properties
- Not i18n ready

**Action:**
```css
/* DrawerShell.css - Change from: */
.drawer-shell[data-side="left"]  { left: 0; }
.drawer-shell[data-side="right"] { right: 0; }

/* To: */
.drawer-shell[data-side="left"]  { inset-inline-start: 0; }
.drawer-shell[data-side="right"] { inset-inline-end: 0; }
```

**Priority:** MEDIUM (i18n requirement)  
**Effort:** 10 minutes

---

### 5. Motion Token CSS Integration 🟢 LOW
**Status:** Tokens created, NOT consumed by shells

**Missing:**
- Shells use hardcoded durations/easing
- Not themeable

**Action:**
```css
/* ModalShell.css - Change from: */
transition: opacity 200ms cubic-bezier(...);

/* To: */
transition: opacity var(--motion-duration-2) var(--motion-ease-standard);
```

**Priority:** LOW (polish, works without it)  
**Effort:** 30 minutes

---

### 6. OverlaySheet CSS Classes 🟢 LOW
**Status:** Using inline styles with tokens

**Current:**
```tsx
style={{
  background: 'rgba(0, 0, 0, 0.5)',
  zIndex: 'var(--ds-z-scrim, 50)',
}}
```

**Better:**
```css
.overlay-sheet-backdrop {
  background: var(--overlay-scrim-bg);
  z-index: var(--ds-z-scrim, 50);
}
```

**Priority:** LOW (current works, this is themeability)  
**Effort:** 20 minutes

---

### 7. RAF Flood Guard 🟢 LOW
**Status:** applyContract batches per call, not across calls

**Current:** Each `applyContract()` schedules its own RAF  
**Better:** Coalesce multiple calls into single RAF

**Action:**
```typescript
let pendingRAF: number | null = null;
let pendingUpdates = new Map();

export function applyContract(element, contract) {
  pendingUpdates.set(element, contract);
  
  if (pendingRAF === null) {
    pendingRAF = requestAnimationFrame(() => {
      pendingUpdates.forEach((c, el) => { /* apply */ });
      pendingUpdates.clear();
      pendingRAF = null;
    });
  }
}
```

**Priority:** LOW (optimization, not correctness)  
**Effort:** 15 minutes

---

## 🎯 Critical Path to Harden

**Must Do (45 minutes):**
1. Wire event bus into overlay-policy ✅
2. Wire shortcuts into ModalShell/DrawerShell ✅
3. Add GlobalProgressBar to AppShell ✅

**Should Do (20 minutes):**
4. DrawerShell RTL support ✅

**Nice to Have (65 minutes):**
5. Motion token CSS integration
6. OverlaySheet CSS classes
7. RAF flood guard

---

## 🚀 Recommended Integration Order

### Sprint A: Critical Hardening (1 hour)
1. Event bus integration (15 min)
2. Shortcut integration (30 min)
3. GlobalProgressBar integration (10 min)
4. DrawerShell RTL (10 min)

**Result:** Foundations are hardened and complete

### Sprint B: Polish (Optional, 1 hour)
5. Motion token CSS updates (30 min)
6. OverlaySheet CSS classes (20 min)
7. RAF flood guard (15 min)

**Result:** Maximum themeability and performance

---

## 📊 Current State vs Target

| Item | Current | Target | Gap |
|------|---------|--------|-----|
| **Event Bus** | Created | Wired | 15 min |
| **Shortcuts** | Created | Wired | 30 min |
| **Progress Bar** | Created | Rendered | 10 min |
| **RTL Support** | Physical | Logical | 10 min |
| **Motion Tokens** | Created | Consumed | 30 min |
| **CSS Classes** | Inline | Classes | 20 min |
| **RAF Guard** | Per-call | Coalesced | 15 min |

**Total Critical Gap:** 65 minutes  
**Total All Gaps:** 130 minutes

---

## ✅ Recommendation

**Do Sprint A (1 hour) NOW:**
- Completes the "God-tier foundations" promise
- All P0 capabilities are functional, not just stubs
- RTL support is important for i18n
- Event bus enables observability from day 1

**Queue Sprint B (1 hour) for v2.2.1:**
- Themeability polish
- Performance optimization
- Not blocking, can be incremental

---

## 🎖️ Grade Impact

**Current (with P0 stubs only):** A- (stubs created, not integrated)  
**After Sprint A:** A (foundations complete and hardened)  
**After Sprint B:** A+ (God-tier polish)

---

**Execute Sprint A now to lock in the A-grade.** 🚀
