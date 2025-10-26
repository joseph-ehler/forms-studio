# Phase 3: God-Tier UX Capabilities

**Goal:** Native-feeling experiences at scale with minimal product team effort

**Status:** 📋 PLANNED  
**Estimated Effort:** 1-2 days for P0, 1 week total  
**Impact:** High leverage, future-proof foundation

---

## Philosophy

**Phase 2 Result:** Zero debt, clean layers, centralized behavior  
**Phase 3 Goal:** Premium UX baked into foundations

**The Unlock:**
- Consistent gesture/haptic language
- One place for shortcuts (with precedence)
- Observable shell events (analytics, haptics, telemetry)
- Perceived performance (progress, controlled motion)
- Native feel (density + haptics on touch, keyboard + palette on desktop)

---

## P0 - Foundation Capabilities (HIGH LEVERAGE)

**Estimated:** 6-8 hours total  
**Impact:** Every screen feels premium by default

### 1. Global Shortcut Broker
**Layer:** 4 (Behavior)  
**Effort:** 1-2 hours  
**Priority:** 🔴 HIGH

**Why:** One place to register shortcuts with priority precedence

**Location:** `packages/ds/src/shell/behavior/shortcut-broker.ts`

**API:**
```typescript
type Scope = 'palette' | 'modal' | 'drawer' | 'page';

export function registerShortcut(
  combo: string, 
  scope: Scope, 
  cb: () => void
): () => void;

export function setScopePriority(order: Scope[]): void; 
// default: ['palette', 'modal', 'drawer', 'page']
```

**Shell Integration:**
- ModalShell registers Esc on mount
- PageShell registers page actions
- AppShell wires ⌘K to CommandPaletteShell
- DrawerShell registers Esc in overlay mode

**Tests:**
- Canary: Modal Esc beats page shortcuts
- Canary: Palette ⌘K beats modal shortcuts
- Canary: Multiple modals - topmost wins

**Status:** ❌ Not Started

---

### 2. Haptics Adapter
**Layer:** 3 (Environment) → 4 (Behavior)  
**Effort:** 1 hour  
**Priority:** 🔴 HIGH

**Why:** Subtle tactile feedback (Capacitor/native only; no-op on web)

**Location:** `packages/ds/src/shell/core/environment/useHaptics.ts`

**API:**
```typescript
export function useHaptics() {
  return {
    impact: (style: 'light' | 'medium' | 'heavy') => void,
    selection: () => void,
    notify: (type: 'success' | 'warning' | 'error') => void,
  };
}
```

**Usage:**
- BottomSheet: `impact('light')` on bucket settle
- CommandPalette: `selection()` when moving selection
- Modal confirm: `notify('success')` on success action
- Drawer: `impact('light')` on open/close

**Implementation:**
- Check `Capacitor.isNativePlatform()`
- Import `@capacitor/haptics` dynamically
- No-op on web (silent fallback)

**Status:** ❌ Not Started

---

### 3. Motion & Surface Tokens
**Layer:** 1 (Tokens)  
**Effort:** 1 hour  
**Priority:** 🔴 HIGH

**Why:** Consistent motion and surfaces across all shells

**Location:** `packages/tokens/src/motion-tokens.ts`

**Tokens to Add:**
```css
:root {
  /* Duration */
  --motion-duration-1: 120ms;  /* Quick (toast, tooltip) */
  --motion-duration-2: 200ms;  /* Standard (sheet, drawer) */
  --motion-duration-3: 300ms;  /* Slow (page transitions) */
  
  /* Easing */
  --motion-ease-standard: cubic-bezier(0.4, 0.0, 0.2, 1);
  --motion-ease-decelerate: cubic-bezier(0.0, 0.0, 0.2, 1);
  --motion-ease-accelerate: cubic-bezier(0.4, 0.0, 1, 1);
  --motion-spring-sheet: cubic-bezier(0.2, 0.8, 0.2, 1);
  
  /* Surfaces */
  --overlay-scrim-bg: color-mix(in oklab, black 50%, transparent);
  --overlay-scrim-bg-light: color-mix(in oklab, black 30%, transparent);
  
  /* Elevation (already exists, ensure consistency) */
  --elevation-sheet: var(--ds-elevation-sheet);
  --elevation-modal: var(--ds-elevation-modal);
  --elevation-popover: var(--ds-elevation-popover);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-1: 0ms;
    --motion-duration-2: 0ms;
    --motion-duration-3: 0ms;
    --motion-spring-sheet: linear;
  }
}
```

**Impact:**
- Shells read these tokens for transitions
- Parallax remains consistent
- Themeable motion
- Automatic reduced motion support

**Status:** ❌ Not Started

---

### 4. Shell Events Bus
**Layer:** 4 (Behavior)  
**Effort:** 1 hour  
**Priority:** 🔴 HIGH

**Why:** Observability + analytics + haptics without coupling

**Location:** `packages/ds/src/shell/behavior/shell-events.ts`

**API:**
```typescript
type ShellEvent =
  | { type: 'overlay:open'; id: string; blocking: boolean; timestamp: number }
  | { type: 'overlay:close'; id: string; timestamp: number }
  | { type: 'sheet:bucket'; id: string; bucket: 'peek' | 'work' | 'owned'; timestamp: number }
  | { type: 'nav:toggle'; open: boolean; timestamp: number }
  | { type: 'panel:toggle'; id: string; open: boolean; timestamp: number }
  | { type: 'shortcut:trigger'; combo: string; scope: string; timestamp: number };

export function onShellEvent(cb: (e: ShellEvent) => void): () => void;
export function emitShellEvent(e: Omit<ShellEvent, 'timestamp'>): void;

// Debug helpers
export const __shellEventsDebug: {
  getEventLog: () => ShellEvent[];
  clearLog: () => void;
} | undefined; // Only in dev
```

**Use Cases:**
- `sheet:bucket` → trigger haptics + light telemetry
- `overlay:open` → analytics / feature flags
- `shortcut:trigger` → keyboard usage tracking
- `nav:toggle` → user behavior insights

**Integration Points:**
- `pushOverlay()` emits `overlay:open`/`overlay:close`
- BottomSheet emits `sheet:bucket`
- NavShell emits `nav:toggle`
- PanelShell emits `panel:toggle`
- Shortcut broker emits `shortcut:trigger`

**Status:** ❌ Not Started

---

### 5. Shell-level Suspense/Errors
**Layer:** 5 (AppShell, PageShell)  
**Effort:** 1-2 hours  
**Priority:** 🔴 HIGH

**Why:** God-tier loading states and error handling

**Locations:**
- `packages/ds/src/shell/macro/AppShell/ProgressBar.tsx` (new)
- `packages/ds/src/shell/macro/PageShell/PageShell.tsx` (update)
- `packages/ds/src/shell/core/state/useLoadingState.ts` (new)

**API:**

**Loading State Hook:**
```typescript
// shell/core/state/useLoadingState.ts
export function useLoadingState() {
  return {
    active: boolean;
    start: () => void;
    stop: () => void;
    progress: number; // 0-100
    setProgress: (n: number) => void;
  };
}

export function useGlobalLoadingState(): {
  active: boolean;
  progress: number;
};
```

**AppShell Integration:**
```typescript
// AppShell.Header renders progress bar
<AppShell.Header>
  <GlobalProgressBar />
  {/* Your header content */}
</AppShell.Header>
```

**PageShell Integration:**
```typescript
<PageShell
  fallback={<PageSkeleton />}
  error={<PageError />}
>
  <Suspense fallback={<PageSkeleton />}>
    {children}
  </Suspense>
</PageShell>
```

**Components to Create:**
- `GlobalProgressBar` - Top 2px bar in AppShell.Header
- `PageSkeleton` - Skeleton for page content
- `PageError` - Error boundary fallback

**Router Integration:**
- Instrument route transitions to flip loading state
- Auto-start on navigation, auto-stop on render

**Status:** ❌ Not Started

---

## P1 - "Feels Native" Polish (NON-BLOCKING)

**Estimated:** 3 hours total  
**Impact:** Incremental quality improvements

### 6. RTL Ready
**Layer:** 5 (Shell CSS)  
**Effort:** 30 minutes  
**Priority:** 🟡 MEDIUM

**Changes:**
```css
/* DrawerShell - Before */
.drawer-shell[data-side="left"]  { left: 0; }
.drawer-shell[data-side="right"] { right: 0; }

/* DrawerShell - After */
.drawer-shell[data-side="left"]  { inset-inline-start: 0; }
.drawer-shell[data-side="right"] { inset-inline-end: 0; }
```

**Files:**
- `shell/micro/DrawerShell/DrawerShell.css`
- `shell/macro/AppShell/AppShell.css` (panels)

**Test:** Canary with `[dir="rtl"]`

**Status:** ⚠️ Queued (identified in Phase 2 audit)

---

### 7. aria-labelledby Fallback
**Layer:** 5 (Shells)  
**Effort:** 30 minutes  
**Priority:** 🟡 MEDIUM

**Pattern:**
```typescript
const headerId = useId();
const labelProps = ariaLabel 
  ? { 'aria-label': ariaLabel }
  : { 'aria-labelledby': headerId };

<div role="dialog" {...labelProps}>
  <Header id={headerId}>{/* title */}</Header>
</div>
```

**Files:**
- `shell/micro/ModalShell/ModalShell.tsx`
- `shell/micro/BottomSheet/BottomSheet.tsx`
- `shell/micro/DrawerShell/DrawerShell.tsx`

**Status:** ⚠️ Queued (identified in Phase 2 audit)

---

### 8. Variant RAF Flood Guard
**Layer:** 4 (Behavior)  
**Effort:** 20 minutes  
**Priority:** 🟡 MEDIUM

**Implementation:**
```typescript
// shell/behavior/variant-resolver.ts
let pendingRAF: number | null = null;
let pendingUpdates = new Map<HTMLElement, { attrs: Record<string, string>, vars: Record<string, string> }>();

export function applyContract(element: HTMLElement, contract: { attrs, vars }) {
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

**File:** `shell/behavior/variant-resolver.ts`

**Status:** ⚠️ Queued (identified in Phase 2 audit)

---

### 9. OverlaySheet CSS Classes
**Layer:** 2 (Primitives)  
**Effort:** 30 minutes  
**Priority:** 🟢 LOW

**Create:** `primitives/overlay/OverlaySheet.css`

```css
.overlay-sheet-backdrop {
  position: fixed;
  inset: 0;
  background: var(--overlay-scrim-bg, rgba(0, 0, 0, 0.5));
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

**Update:** `primitives/overlay/OverlaySheet.tsx` to use classes

**Status:** ⚠️ Queued (identified in Phase 2 audit)

---

### 10. Variant Matrix Documentation
**Layer:** Documentation  
**Effort:** 1 hour  
**Priority:** 🟡 MEDIUM

**Create:** Tables per shell showing prop → data-* → --var → CSS selectors

**Example for ModalShell:**
| Prop | Data Attr | CSS Var | CSS Selector | Effect |
|------|-----------|---------|--------------|--------|
| `size="sm"` | `data-size="sm"` | - | `.modal-shell[data-size="sm"]` | Max-width: 400px |
| `size="md"` | `data-size="md"` | - | `.modal-shell[data-size="md"]` | Max-width: 600px |
| `size="lg"` | `data-size="lg"` | - | `.modal-shell[data-size="lg"]` | Max-width: 800px |

**Files:**
- Add to each shell's docs
- Create `docs/handbook/VARIANT_MATRIX.md`

**Status:** ⚠️ Queued (identified in Phase 2 audit)

---

## P2 - Next Shells & Primitives (FUTURE)

**Estimated:** 1-2 weeks  
**Impact:** Accelerates future work

### Meso Shells (Layer 5)

**CanvasShell:**
- Canvas + Inspector + Toolbars
- Inspector overlay on tablet/mobile; inline on desktop
- **Files:** `shell/meso/CanvasShell/`
- **Effort:** 2-3 days

**DataShell:**
- Filters Rail + Data Region + Selection Bar
- Selection bar sticky; rail overlay on mobile
- **Files:** `shell/meso/DataShell/`
- **Effort:** 2-3 days

### Overlay Primitives (Layer 2)

**OverlayModal:**
- Centered mechanics (NO slots)
- **File:** `primitives/overlay/OverlayModal.tsx`
- **Effort:** 2 hours

**OverlayDrawer:**
- Side mechanics (NO slots)
- **File:** `primitives/overlay/OverlayDrawer.tsx`
- **Effort:** 2 hours

**OverlayCore:**
- Portal/backdrop base
- **File:** `primitives/overlay/OverlayCore.tsx`
- **Effort:** 1 hour

### Additional Micro Shells

**CommandPaletteShell:**
- ⌘K interface
- Uses Shortcut Broker
- **Files:** `shell/micro/CommandPaletteShell/`
- **Effort:** 1 day
- **Priority:** HIGH (instant "pro" feel)

**ToastShell:**
- HUD notifications
- **Files:** `shell/micro/ToastShell/`
- **Effort:** 4 hours

**TooltipShell:**
- Non-interactive hints
- **Files:** `shell/micro/TooltipShell/`
- **Effort:** 3 hours

**ContextMenuShell:**
- Right-click menus
- **Files:** `shell/micro/ContextMenuShell/`
- **Effort:** 4 hours

---

## Quality Gates to Add

### Latency Budget Canary
**Test:** Modal open → focus in ≤ 80ms

```typescript
test('modal focus latency under 80ms', async ({ page }) => {
  const start = Date.now();
  await page.click('[data-test="open-modal"]');
  await page.waitForSelector('[role="dialog"]:focus');
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(80);
});
```

### Animation Canary
**Test:** Drawer open → 0 dropped frames in first 300ms

```typescript
test('drawer animation no dropped frames', async ({ page }) => {
  // Use Playwright's performance API
  const session = await page.context().newCDPSession(page);
  await session.send('Performance.enable');
  
  await page.click('[data-test="open-drawer"]');
  await page.waitForTimeout(300);
  
  const metrics = await session.send('Performance.getMetrics');
  // Assert frame budget maintained
});
```

### RTL Canary
**Test:** Drawer appears at correct inline position

```typescript
test('drawer RTL positioning', async ({ page }) => {
  await page.addStyleTag({ content: 'html { direction: rtl; }' });
  await page.click('[data-test="open-drawer-left"]');
  
  const drawer = page.locator('[data-side="left"]');
  const box = await drawer.boundingBox();
  
  // Should be at inline-start (right side in RTL)
  expect(box.x).toBeGreaterThan(page.viewportSize().width / 2);
});
```

---

## Sprint Plan: P0 Implementation (1-2 Days)

### Day 1 Morning (4 hours)
1. **Motion Tokens** (1h)
   - Create `motion-tokens.ts`
   - Add to token barrel
   - Update shell CSS to consume

2. **Shortcut Broker** (2h)
   - Create `shortcut-broker.ts`
   - Implement scope priority
   - Add to behavior barrel
   - Wire Esc in ModalShell

3. **Haptics Hook** (1h)
   - Create `useHaptics.ts`
   - Capacitor integration
   - Add to environment barrel

### Day 1 Afternoon (4 hours)
4. **Shell Events Bus** (1h)
   - Create `shell-events.ts`
   - Emit from `pushOverlay()`
   - Add debug helpers

5. **Suspense/Loading** (2h)
   - Create `useLoadingState.ts`
   - Create `GlobalProgressBar.tsx`
   - Wire into AppShell.Header

6. **Integration & Testing** (1h)
   - Wire haptics into BottomSheet bucket settle
   - Wire shortcuts into remaining shells
   - Emit events from all shell state changes

### Day 2 (Polish & Docs)
7. **Tests** (2h)
   - Shortcut precedence canary
   - Event bus canary
   - Loading state test

8. **Documentation** (2h)
   - Update BEHAVIOR_LAYER.md
   - Create SHORTCUTS.md
   - Create HAPTICS.md
   - Update CHANGELOG.md

9. **PR & Review** (2h)
   - Create changeset
   - Self-review
   - Verify all quality gates

---

## 8-Layer Map: Where Everything Lives

```
Layer 8: App
  - Adopts recipes with new shells
  - No behavior changes needed

Layer 7: Flowbite
  - Unchanged
  - Everything slots in

Layer 6: Recipes
  - "Design Tool" with CanvasShell
  - "Data Browser v2" with DataShell
  - Prewired compositions

Layer 5: Shells
  ✅ Macro: AppShell (+ progress bar), PageShell (+ suspense)
  ❌ Meso: CanvasShell, DataShell
  ✅ Micro: Modal, Drawer, Popover (+ shortcuts)
  ❌ Micro: Command, Toast, Tooltip, Context
  ⚠️ Micro: BottomSheet (exists, not exported)
  ✅ Nav: NavShell
  ⚠️ Polish: RTL, aria-labelledby

Layer 4: Behavior
  ✅ overlay-policy (Phase 2)
  ✅ focus-policy (Phase 2)
  ✅ layout-policy (Phase 2)
  ✅ variant-resolver (Phase 2)
  ❌ shortcut-broker (P0)
  ❌ shell-events (P0)
  ⚠️ RAF flood guard (P1)

Layer 3: Environment
  ✅ useAppEnvironment (Phase 1)
  ✅ setShellEnvironment (Phase 1)
  ❌ useHaptics (P0)

Layer 2: Primitives
  ✅ OverlaySheet (Phase 2)
  ❌ OverlayModal (P2)
  ❌ OverlayDrawer (P2)
  ❌ OverlayCore (P2)
  ⚠️ CSS classes (P1)

Layer 1: Tokens
  ✅ Design tokens (existing)
  ✅ Z-index strata (existing)
  ❌ Motion tokens (P0)
  ❌ Surface tokens (P0)
```

---

## Success Metrics

### Before Phase 3
- ⚠️ Shortcuts: Ad-hoc per component
- ⚠️ Haptics: None
- ⚠️ Motion: Inconsistent durations/easing
- ⚠️ Events: No observability
- ⚠️ Loading: Per-page implementations

### After Phase 3 (P0 Complete)
- ✅ Shortcuts: One broker, priority-based
- ✅ Haptics: Consistent across all interactions
- ✅ Motion: Tokenized, themeable, reduced-motion safe
- ✅ Events: Observable, analytics-ready
- ✅ Loading: Global progress + page suspense

### After Phase 3 (P2 Complete)
- ✅ All overlay primitives extracted
- ✅ Meso shells for complex patterns
- ✅ Command palette for power users
- ✅ Toast/Tooltip/Context for HUD

---

## Why This Gets to God-Tier

**One place for behavior:**
- overlay, focus, layout, variants, shortcuts, events ✅

**One gesture/haptic language:**
- Sheet settle, drawer open, command select all feel the same ✅

**Perceived performance:**
- Crisp progress, controlled motion, zero double backdrops ✅

**Native feel:**
- Density + haptics on touch; keyboard + palette on desktop ✅

**Future-proof:**
- Shells = frames, Primitives = mechanics, Behavior = policy ✅
- Clean layering enables rapid composition ✅

---

## Next Steps

1. **Accept stubs for P0** - Shortcut broker, useHaptics, progress bar
2. **Execute Day 1 sprint** - 6-8 hours
3. **Test & document** - Day 2
4. **Ship v2.2.0** - God-tier foundations
5. **Queue P1 polish** - 3 hours incremental
6. **Plan P2 shells** - As product needs arise

---

**Phase 3 unlocks premium UX at scale with minimal product team effort.**

**Grade Target: A+ (God-tier native feel)**
