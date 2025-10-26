# Shell Architecture Audit - Current vs Ideal

**Date:** 2025-01-25  
**Goal:** Align current structure with 8-layer ideal architecture

---

## The Ideal 8-Layer Stack

```
Layer 8: App Layer (Business Logic & Pages)
         ↓ uses
Layer 7: Component Layer (Flowbite + Your UI)
         ↓ styled by
Layer 6: Recipe Layer (Prewired compositions)
         ↓ built with
Layer 5: Shell Layer (Headless Frames: "what")
         ↓ uses
Layer 4: Behavior Layer (Policies & Orchestration)
         ↓ reads
Layer 3: Environment/Capability Layer (Context source of truth)
         ↓ powers
Layer 2: Primitive Layer (Mechanics: "how")
         ↓ styled by
Layer 1: Token Layer (Look & Scale)
```

---

## Current Structure (What We Have)

```
packages/ds/src/
├── tokens/                          # Layer 1 ✅
│   ├── tokens.css
│   └── tailwind-theme.ts
│
├── capabilities/                    # Layer 3 (partial) ⚠️
│   └── platform.ts
│
├── primitives/                      # Layer 2 ❌ MIXED
│   ├── BottomSheet/                 # Actually a shell! (Layer 5)
│   │   ├── BottomSheet.tsx
│   │   ├── BottomSheet.css
│   │   ├── BottomSheetContext.tsx
│   │   ├── UnderlayEffects.tsx
│   │   ├── DSModalBackdrop.tsx
│   │   └── flowbiteTheme.ts
│   └── Popover/                     # True primitive ✅
│       └── Popover.tsx
│
├── hooks/                           # Layers 3 & 4 ❌ SCATTERED
│   ├── useDeviceType.ts             # → Should be in Layer 3
│   ├── useFocusTrap.ts              # → Should be in Layer 2 or 4
│   ├── useOverlayPolicy.ts          # → Should be in Layer 4
│   ├── useStackPolicy.ts            # → Should be in Layer 4
│   ├── useTelemetry.ts              # → Cross-cutting concern
│   ├── useTheme.ts                  # → Layer 3
│   └── ...
│
├── shell/                           # Layers 3, 4, 5, 6 ❌ MIXED
│   ├── core/                        # Layer 3 + some Layer 4
│   │   ├── useAppEnvironment.ts     # Layer 3 ✅
│   │   └── usePanels.tsx            # Layer 4 ✅
│   ├── macro/                       # Layer 5 ✅
│   │   ├── AppShell/
│   │   ├── PageShell/
│   │   └── NavShell/
│   ├── meso/                        # Layer 5 ✅ (empty, ready)
│   ├── micro/                       # Layer 5 ✅
│   │   ├── ModalShell/
│   │   ├── DrawerShell/
│   │   └── PopoverShell/
│   └── recipes/                     # Layer 6 ✅
│       ├── DashboardShell.tsx
│       └── WorkbenchShell.tsx
│
├── routes/                          # Layer 6 ⚠️ SHOULD BE IN recipes/
│   ├── flow-scaffold/
│   ├── full-screen-route/
│   └── route-panel/
│
├── fb/                              # Layer 7 ✅
│   └── ... (Flowbite wrappers)
│
├── registry/                        # Cross-cutting
└── utils/                           # Cross-cutting
```

---

## Issues Identified

### 🔴 Critical Issues

#### 1. BottomSheet is Misplaced (Layer 2 → Layer 5)

**Current Location:**
```
primitives/BottomSheet/
```

**Why It's Wrong:**
- Has **slots** (Header, Content, Footer) → Shell characteristic
- Has **responsive behavior** (desktop modal vs mobile drawer) → Shell characteristic  
- Publishes **CSS vars** (`--sheet-*`) → Shell characteristic
- Has **layout policy** (snap points, footer modes) → Shell characteristic

**True Primitives Have:**
- ❌ No slots (just render children)
- ❌ No responsive logic
- ❌ No CSS vars published
- ❌ No layout policy

**Should Be:**
```
shell/micro/BottomSheet/
```

**Impact:** HIGH - Confuses developers about what's a primitive vs shell

---

#### 2. Missing Explicit Behavior Layer (Layer 4)

**Current State:**
- Policies scattered across hooks/ and shell/core/
- No clear ownership of "when X, do Y" rules

**Missing Components:**
- `shell/behavior/overlay-policy.ts` - Scrim management, stack coordination
- `shell/behavior/layout-policy.ts` - Persistent vs off-canvas, push vs overlay
- `shell/behavior/gesture-policy.ts` - Swipe, drag, keyboard shortcuts
- `shell/behavior/variant-resolver.ts` - Props → data-* attrs + CSS vars

**Impact:** MEDIUM - Hard to find/modify behavior rules

---

#### 3. Routes Separate from Recipes (Layer 6)

**Current:**
```
routes/
├── flow-scaffold/
├── full-screen-route/
└── route-panel/
```

**Should Be:**
```
shell/recipes/route-shells/
├── FullScreenRouteShell/
├── FlowScaffoldShell/
└── RoutePanelShell/
```

**Why:** Routes are recipes (shell + routing logic). Keeping separate creates false distinction.

**Impact:** MEDIUM - Unclear taxonomy

---

### ⚠️ Medium Issues

#### 4. Hooks Scattered (Layers 3 & 4)

**Current:** All in `hooks/`

**Should Be:**
- **Layer 3 (Environment):**
  - `useDeviceType` → `shell/core/environment/`
  - `useTheme` → `shell/core/environment/`

- **Layer 4 (Behavior):**
  - `useFocusTrap` → `shell/behavior/focus-policy.ts`
  - `useOverlayPolicy` → `shell/behavior/overlay-policy.ts`
  - `useStackPolicy` → `shell/behavior/overlay-policy.ts`

- **Cross-cutting:**
  - `useTelemetry` → `utils/telemetry/`

**Impact:** MEDIUM - Hard to find related hooks

---

#### 5. Missing True Overlay Primitives (Layer 2)

**Current:** Only `Popover` (which is good)

**Missing:**
- `primitives/overlay/OverlayCore.tsx` - Portal, backdrop, focus trap mechanics
- `primitives/overlay/OverlaySheet.tsx` - Bottom-anchored mechanics (no slots)
- `primitives/overlay/OverlayModal.tsx` - Centered mechanics (no slots)
- `primitives/overlay/OverlayDrawer.tsx` - Side mechanics (no slots)
- `primitives/positioning/FloatingUI.tsx` - Anchored positioning engine

**Why Needed:**
- Shells should compose primitives, not reinvent mechanics
- DRY: Focus trap, scroll lock, portal logic shared across shells
- Testing: Test mechanics once in primitives, not per shell

**Impact:** MEDIUM - Code duplication in shells

---

### ✅ What's Working Well

1. **Token Layer (Layer 1)** - Clean, well-defined
2. **Macro Shells (Layer 5)** - Clear structure (AppShell, PageShell, NavShell)
3. **Micro Shells (Layer 5)** - New additions well-organized
4. **Recipes (Layer 6)** - Dashboard/Workbench clear
5. **Flowbite Integration (Layer 7)** - Clean separation

---

## Ideal Structure (Target State)

```
packages/ds/src/
│
├── tokens/                           # Layer 1: Look & Scale
│   ├── tokens.css                    # OKLCH colors, spacing, elevation, z-index
│   └── tailwind-theme.ts
│
├── primitives/                       # Layer 2: Mechanics (ONLY)
│   ├── overlay/                      # NEW
│   │   ├── OverlayCore.tsx           # Portal, backdrop, scroll-lock
│   │   ├── OverlaySheet.tsx          # Bottom-anchored (no slots)
│   │   ├── OverlayModal.tsx          # Centered (no slots)
│   │   └── OverlayDrawer.tsx         # Side (no slots)
│   ├── positioning/                  # NEW
│   │   └── FloatingUI.tsx            # Anchored positioning engine
│   └── gestures/                     # Future
│       ├── useDrag.ts
│       └── useSwipe.ts
│
├── shell/                            # Layers 3-6: Environment + Behavior + Shells + Recipes
│   │
│   ├── core/                         # Layer 3: Environment (source of truth)
│   │   ├── environment/              # NEW
│   │   │   ├── useAppEnvironment.ts  # MOVE from shell/core/
│   │   │   ├── useDeviceType.ts      # MOVE from hooks/
│   │   │   ├── useTheme.ts           # MOVE from hooks/
│   │   │   └── setShellEnvironment.ts # NEW (test override)
│   │   ├── state/                    # Shell state management
│   │   │   ├── usePanels.tsx         # EXISTS
│   │   │   └── useNav.tsx            # Part of AppShell (could extract)
│   │   └── index.ts
│   │
│   ├── behavior/                     # Layer 4: Policies & Orchestration (NEW)
│   │   ├── overlay-policy.ts         # Scrim management, z-index stack
│   │   ├── layout-policy.ts          # Persistent vs off-canvas, push vs overlay
│   │   ├── focus-policy.ts           # Focus trap, return focus
│   │   ├── gesture-policy.ts         # Swipe, drag, keyboard shortcuts
│   │   ├── variant-resolver.ts       # Props → data-* + CSS vars
│   │   └── index.ts
│   │
│   ├── macro/                        # Layer 5: App-level shells
│   │   ├── AppShell/
│   │   ├── PageShell/
│   │   └── NavShell/
│   │
│   ├── meso/                         # Layer 5: Workspace patterns
│   │   ├── WorkbenchShell/           # Future
│   │   ├── CanvasShell/              # Future
│   │   └── DataShell/                # Future
│   │
│   ├── micro/                        # Layer 5: Overlays & HUD
│   │   ├── BottomSheet/              # MOVE from primitives/
│   │   ├── ModalShell/               # EXISTS
│   │   ├── DrawerShell/              # EXISTS
│   │   ├── PopoverShell/             # EXISTS
│   │   ├── TooltipShell/             # Future
│   │   ├── ContextMenuShell/         # Future
│   │   ├── ToastShell/               # Future
│   │   └── CommandPaletteShell/      # Future
│   │
│   └── recipes/                      # Layer 6: Prewired compositions
│       ├── DashboardShell.tsx        # EXISTS
│       ├── WorkbenchShell.tsx        # EXISTS
│       └── route-shells/             # NEW (move from routes/)
│           ├── FullScreenRouteShell/
│           ├── FlowScaffoldShell/
│           └── RoutePanelShell/
│
├── fb/                               # Layer 7: Flowbite wrappers
│   └── ...
│
├── utils/                            # Cross-cutting
│   ├── telemetry/
│   │   └── useTelemetry.ts           # MOVE from hooks/
│   └── ...
│
└── index.ts                          # Main barrel
```

---

## Migration Plan (Surgical Steps)

### Phase 1: Create Missing Directories ✅ DONE
```bash
shell/core/environment/
shell/core/state/
shell/behavior/
shell/recipes/route-shells/
primitives/overlay/
primitives/positioning/
```

### Phase 2: Move BottomSheet (Critical)

**Step 1:** Create true primitives first
```
primitives/overlay/OverlayCore.tsx
primitives/overlay/OverlaySheet.tsx (bottom-anchored mechanics ONLY)
```

**Step 2:** Refactor BottomSheet to use primitives
```
shell/micro/BottomSheet/ (keep current, but refactor to use OverlaySheet)
```

**Step 3:** Add deprecation in old location
```
primitives/BottomSheet/index.ts:
export { BottomSheet } from '../../shell/micro/BottomSheet';
// @deprecated Moved to shell/micro/BottomSheet. Import from there instead.
```

### Phase 3: Extract Behavior Layer

**Move/Create:**
```
shell/behavior/overlay-policy.ts
  - extractOverlayManager from hooks/useOverlayPolicy
  - extractStackPolicy from hooks/useStackPolicy
  
shell/behavior/focus-policy.ts
  - extractFocusTrap from hooks/useFocusTrap
  
shell/behavior/variant-resolver.ts
  - NEW: centralize props → data-* + CSS vars logic
```

### Phase 4: Reorganize Environment

**Move:**
```
shell/core/useAppEnvironment.ts → shell/core/environment/useAppEnvironment.ts
hooks/useDeviceType.ts → shell/core/environment/useDeviceType.ts
hooks/useTheme.ts → shell/core/environment/useTheme.ts
```

**Create:**
```
shell/core/environment/setShellEnvironment.ts (test override)
```

### Phase 5: Consolidate Recipes

**Move:**
```
routes/full-screen-route/ → shell/recipes/route-shells/FullScreenRouteShell/
routes/flow-scaffold/ → shell/recipes/route-shells/FlowScaffoldShell/
routes/route-panel/ → shell/recipes/route-shells/RoutePanelShell/
```

**Add deprecation:**
```
routes/index.ts:
export * from '../shell/recipes/route-shells/FullScreenRouteShell';
// @deprecated Moved to shell/recipes/route-shells. Import from @intstudio/ds/shell instead.
```

### Phase 6: Extract True Primitives

**Create:**
```
primitives/overlay/OverlayCore.tsx
primitives/overlay/OverlayModal.tsx
primitives/overlay/OverlayDrawer.tsx
primitives/positioning/FloatingUI.tsx (wrap existing Popover logic)
```

**Refactor shells to use them:**
```
ModalShell → uses OverlayModal
DrawerShell → uses OverlayDrawer
PopoverShell → uses FloatingUI
```

---

## Verification Checklist

After migration, verify:

### Layer 1: Tokens
- [ ] All CSS vars in `tokens/tokens.css`
- [ ] No hardcoded colors/spacing in shells
- [ ] Tailwind theme exports all token ramps

### Layer 2: Primitives
- [ ] No slots in primitives (only children prop)
- [ ] No responsive logic in primitives
- [ ] No CSS vars published by primitives
- [ ] Focus trap, scroll lock, portal logic in OverlayCore

### Layer 3: Environment
- [ ] `useAppEnvironment()` is single source of truth
- [ ] All device detection in `shell/core/environment/`
- [ ] Test override available (`setShellEnvironment`)

### Layer 4: Behavior
- [ ] Overlay policy centralized (scrim, stack, inert)
- [ ] Layout policy centralized (persistent vs off-canvas)
- [ ] Focus policy centralized (trap, return)
- [ ] Variant resolver converts props → data-* + CSS vars

### Layer 5: Shells
- [ ] All shells in `shell/macro|meso|micro/`
- [ ] Shells compose primitives (not reinvent)
- [ ] Shells publish slots + CSS vars + hooks
- [ ] No shells in `primitives/`

### Layer 6: Recipes
- [ ] All recipes in `shell/recipes/`
- [ ] Route recipes in `shell/recipes/route-shells/`
- [ ] No recipes scattered elsewhere

### Layer 7: Flowbite
- [ ] All Flowbite wrappers in `fb/`
- [ ] Components live inside shell slots
- [ ] No Flowbite overrides in shells

---

## Impact Assessment

### Breaking Changes: NONE (with deprecation aliases)

All moves use deprecation aliases:
```typescript
// Old location (deprecated)
export { Thing } from '../new/location/Thing';

// Deprecation warning
if (process.env.NODE_ENV !== 'production') {
  console.warn('[DS] Import from old path is deprecated...');
}
```

### Build Impact: LOW

- Barrels regenerate automatically
- TypeScript resolves new paths
- Tests pass (imports still work via aliases)

### Documentation Impact: MEDIUM

Need to update:
- `PRIMITIVES_VS_SHELLS.md` - Add behavior layer
- `COMPLETE_SHELL_ARCHITECTURE.md` - Update directory map
- `SHELL_SYSTEM.md` - Add 8-layer diagram
- New: `BEHAVIOR_LAYER.md` - Explain policies

---

## Timeline Estimate

### Phase 1: Directories (5 min)
Create empty directories with placeholder index.ts files

### Phase 2: BottomSheet Move (2 hours)
- Extract OverlaySheet primitive (45 min)
- Refactor BottomSheet to use it (45 min)
- Add deprecation alias (15 min)
- Test (15 min)

### Phase 3: Behavior Layer (3 hours)
- Extract overlay-policy.ts (1 hour)
- Extract focus-policy.ts (45 min)
- Create variant-resolver.ts (45 min)
- Refactor shells to use policies (30 min)

### Phase 4: Environment Reorg (1 hour)
- Move files (15 min)
- Create setShellEnvironment (30 min)
- Update imports (15 min)

### Phase 5: Recipe Consolidation (1 hour)
- Move route-shells (30 min)
- Add deprecation aliases (15 min)
- Update docs (15 min)

### Phase 6: Extract Primitives (4 hours)
- Create OverlayCore (1 hour)
- Create OverlayModal/Drawer (1.5 hours)
- Create FloatingUI (1 hour)
- Refactor shells (30 min)

**Total: ~11 hours**

---

## Success Criteria

### Developer Experience
- [ ] Clear "where does X live?" answers
- [ ] Can't misplace code (layer boundaries enforced)
- [ ] Import paths reveal layer (`primitives/` vs `shell/behavior/` vs `shell/macro/`)

### Code Quality
- [ ] No code duplication (primitives shared)
- [ ] Single source of truth per concern
- [ ] Easy to test (layer isolation)

### Maintainability
- [ ] New shells follow template (use primitives + behavior)
- [ ] New policies go in `shell/behavior/`
- [ ] New recipes go in `shell/recipes/`

---

## Recommendation

**Execute migration in phases:**

1. **Now (This Session):** Create directory structure + move Environment
2. **Next Week:** Extract Behavior layer + move BottomSheet
3. **Month 2:** Extract true Primitives + consolidate Routes

**Rationale:**
- Gradual migration reduces risk
- Deprecation aliases prevent breaks
- Can ship intermediate states
- Learn from each phase before next

**Start with Phase 1 (directories) + Phase 4 (environment reorg) - lowest risk, high clarity gain.**

---

## Architecture Grade

**Current:** B+ (functional but mixed concerns)  
**Target:** A (clear layers, easy to extend)  
**With Migration:** A (world-class organization)

The foundation is solid. This migration clarifies ownership and makes the system unbreakable.
