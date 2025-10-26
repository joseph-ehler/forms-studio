# AppShell Architecture Review & Refinement Plan

**Date:** 2025-01-25  
**Status:** Architecture Assessment  
**Goal:** Evaluate the complete shell system and identify refinements

---

## Current State Analysis

### What We've Shipped

#### Phase 1: Route Navigation System (Previously Shipped)
```
packages/ds/src/routes/
├── flow-scaffold/
│   ├── FlowScaffold.tsx       # Multi-step wizards
│   └── useSubFlow.ts
├── full-screen-route/
│   └── FullScreenRoute.tsx    # Modal routes (focused tasks)
└── route-panel/
    └── RoutePanel.tsx         # Desktop panels (non-modal)
```

**Purpose:** URL-bound navigation patterns for flows and focused tasks  
**Layer:** Macro routing (meso/macro boundary)

#### Phase 2: Overlay Primitives (Previously Shipped)
```
packages/ds/src/primitives/
├── Sheet/
│   ├── Sheet.tsx              # Bottom drawer with snap points
│   ├── Sheet.css
│   ├── SheetContext.tsx
│   └── UnderlayEffects.tsx
└── Popover/
    └── Popover.tsx            # Anchored overlays
```

**Purpose:** Transient UI patterns (drawers, pickers)  
**Layer:** Micro overlays

#### Phase 3: AppShell System (Just Shipped)
```
packages/ds/src/shell/
├── AppShell.tsx + .css        # Global layout OS
├── PageShell.tsx + .css       # Page structure
├── NavShell.tsx + .css        # Nav coordinator
├── useAppEnvironment.ts       # Device detection
├── usePanels.tsx              # Panel state management
└── recipes/
    ├── DashboardShell.tsx     # Dashboard composition
    └── WorkbenchShell.tsx     # Workbench composition
```

**Purpose:** Structural layout system (app & page level)  
**Layer:** Macro layout

---

## Architecture Assessment

### ✅ What's Working Well

#### 1. Clear Separation of Concerns
```
Tokens (look)
   ↓
Flowbite (visual components)
   ↓
Shells (structure + behavior)
   ↓
Your App (business logic)
```

**Strength:** Clean boundaries, no coupling between layers.

#### 2. Consistent Patterns
- **Slot-based:** All shells expose slots (zero padding)
- **CSS vars:** All shells publish layout state (`--shell-*`, `--page-*`)
- **Data attrs:** All shells publish device state (`data-shell-mode`, `data-pointer`)
- **Hooks:** All shells provide context hooks (`useNav`, `usePanels`, `useAppEnvironment`)

**Strength:** Predictable API across all shells.

#### 3. "Frames Not Skins" Philosophy
- Shells own structure, not visuals
- Flowbite provides visuals (themed by tokens)
- Zero padding conflicts (your content provides spacing)

**Strength:** Composability without fights.

#### 4. Responsive by Design
- `useAppEnvironment()` powers all adaptations
- Desktop → tablet → mobile automatic
- Token-driven breakpoints

**Strength:** One codebase, three feels.

---

## 🔍 Architecture Issues & Refinements Needed

### Issue 1: Naming Confusion ⚠️

**Problem:**
```
primitives/Sheet/Sheet.tsx      → Called "Sheet" in code
docs/SHELL_SYSTEM.md            → Called "BottomSheet" in taxonomy
```

**Impact:** Developers won't know if they should import `Sheet` or `BottomSheet`.

**Proposed Fix:**
```tsx
// Option A: Rename to match taxonomy (RECOMMENDED)
primitives/BottomSheet/
├── BottomSheet.tsx
├── BottomSheet.css
└── index.ts

// Export as both for backward compat
export { BottomSheet } from './BottomSheet';
export { BottomSheet as Sheet } from './BottomSheet'; // Deprecated alias

// Option B: Keep "Sheet", update taxonomy docs
// Less preferred - taxonomy is more intuitive
```

**Decision:** Rename `Sheet` → `BottomSheet` with deprecation alias.

---

### Issue 2: Routes vs Shells Overlap 🔄

**Problem:**
```
routes/FullScreenRoute.tsx      → Full-screen modal for focused tasks
shell/ModalShell.tsx (planned)  → Centered dialog

routes/RoutePanel.tsx           → Desktop panel (non-modal)
shell/DrawerShell.tsx (planned) → Side panel
shell/PanelShell.tsx (planned)  → Small inspector panel
```

**Questions:**
1. Is `FullScreenRoute` a specialized `ModalShell`?
2. Is `RoutePanel` a specialized `DrawerShell` or `PanelShell`?
3. Should routes be **recipes** built on top of shells?

**Current Hierarchy (Confusing):**
```
routes/           ← Macro patterns (URL-bound)
shell/            ← Macro layout (structure)
primitives/       ← Micro overlays (transient)
```

**Proposed Hierarchy (Clearer):**
```
shell/
├── macro/        ← App-level structure
│   ├── AppShell
│   ├── PageShell
│   └── NavShell
├── meso/         ← Workspace patterns
│   ├── WorkbenchShell
│   ├── CanvasShell
│   └── DataShell
├── micro/        ← Overlays & HUD
│   ├── BottomSheet
│   ├── ModalShell
│   ├── DrawerShell
│   ├── PopoverShell
│   └── TooltipShell
└── recipes/      ← High-level compositions
    ├── DashboardShell
    ├── WorkbenchShell
    └── route-shells/
        ├── FullScreenRouteShell  ← Wrap ModalShell + routing
        ├── FlowScaffoldShell     ← Wrap multi-step logic
        └── RoutePanelShell       ← Wrap DrawerShell + routing
```

**Proposed Fix:**

**Option A: Merge Routes into Shell (RECOMMENDED)**
```typescript
// routes/ becomes shell/recipes/route-shells/

// Before
import { FullScreenRoute } from '@intstudio/ds/routes';

// After (with barrel re-export for compat)
import { FullScreenRoute } from '@intstudio/ds';
// Still works, but internally uses ModalShell + routing logic
```

**Option B: Keep Separate, Clear Documentation**
- Keep `/routes/` for URL-bound patterns
- Keep `/shell/` for structure-only patterns
- Document relationship clearly

**Recommendation:** Option A (merge) - reduces confusion, single taxonomy.

---

### Issue 3: Missing Bridge Shells 🌉

**Problem:** Taxonomy defines 17 shells, but we've only built 6.

**Shipped:**
1. ✅ AppShell
2. ✅ PageShell
3. ✅ NavShell
4. ✅ BottomSheet (as "Sheet")
5. ✅ DashboardShell (recipe)
6. ✅ WorkbenchShell (recipe)

**Missing Critical Shells:**
7. ❌ ModalShell - Needed to replace/wrap FullScreenRoute
8. ❌ DrawerShell - Needed for side panels
9. ❌ PopoverShell - We have primitive, need shell wrapper
10. ❌ TooltipShell
11. ❌ ContextMenuShell
12. ❌ CommandPaletteShell
13. ❌ ToastShell
14. ❌ PanelShell
15. ❌ DockShell
16. ❌ HeaderShell
17. ❌ CanvasShell / DataShell (meso)

**Impact:** Can't compose full app with shells only - forced to mix routes + shells.

**Proposed Fix:**

**Priority 1 (Complete Foundation):**
- ModalShell (desktop-first dialog)
- DrawerShell (left/right panels)
- PopoverShell (wrap existing Popover primitive)

**Priority 2 (Common Patterns):**
- TooltipShell
- ToastShell
- ContextMenuShell

**Priority 3 (Advanced):**
- CommandPaletteShell
- CanvasShell
- DataShell
- PanelShell
- DockShell
- HeaderShell

---

### Issue 4: Primitive vs Shell Distinction Unclear 🤔

**Problem:**
```
primitives/Sheet.tsx        → Is this a shell?
primitives/Popover.tsx      → Is this a shell?
shell/BottomSheet.tsx       → Or is this the shell?
```

**Current Understanding (Needs Clarification):**
- **Primitives** = Low-level building blocks (overlay mechanics, focus trap, positioning)
- **Shells** = High-level compositions (slots, contracts, responsive behavior)

**Proposed Clarification:**

```typescript
// primitives/ = Low-level mechanics (no opinions)
primitives/
├── overlay/
│   ├── OverlayCore.tsx         # Portal, backdrop, focus trap
│   ├── OverlaySheet.tsx        # Bottom-anchored overlay
│   ├── OverlayModal.tsx        # Centered overlay
│   └── OverlayDrawer.tsx       # Side overlay
└── positioning/
    └── FloatingUI.tsx          # Anchored positioning

// shell/ = High-level shells (opinionated slots + contracts)
shell/
├── BottomSheet.tsx             # Uses primitives/OverlaySheet
├── ModalShell.tsx              # Uses primitives/OverlayModal
├── DrawerShell.tsx             # Uses primitives/OverlayDrawer
└── PopoverShell.tsx            # Uses primitives/FloatingUI
```

**Key Distinction:**
- **Primitives:** "How" (overlay mechanics, positioning engine)
- **Shells:** "What" (BottomSheet with header/content/footer slots)

**Proposed Fix:** Refactor primitives to be pure mechanics, shells compose them.

---

### Issue 5: Export Hierarchy Confusion 📦

**Problem:**
```typescript
// Main barrel
export * from './routes';      // Exports FullScreenRoute, FlowScaffold
export * from './primitives';  // Exports Sheet, Popover
export * from './shell';       // Exports AppShell, PageShell

// What's the difference? Not clear from imports.
```

**User Experience:**
```typescript
import { Sheet } from '@intstudio/ds';              // Primitive or shell?
import { FullScreenRoute } from '@intstudio/ds';    // Route or shell?
import { AppShell } from '@intstudio/ds';           // Shell!
```

**Proposed Fix:**

**Option A: Namespace Exports (RECOMMENDED)**
```typescript
// Main barrel with namespaces
export * as shell from './shell';
export * as routes from './routes';
export * as primitives from './primitives';

// Usage (explicit)
import { shell, routes } from '@intstudio/ds';
<shell.AppShell>
  <routes.FullScreenRoute />
</shell.AppShell>

// Or direct (still works)
import { AppShell, FullScreenRoute } from '@intstudio/ds';
```

**Option B: Barrel Re-exports (Current, Keep)**
```typescript
// Keep flat exports for convenience
export * from './shell';
export * from './routes';
export * from './primitives';

// Add comments to guide users
/**
 * Shells (macro layout)
 */
export * from './shell';

/**
 * Routes (URL-bound patterns)
 */
export * from './routes';

/**
 * Primitives (low-level mechanics)
 */
export * from './primitives';
```

**Recommendation:** Option B (current) + better docs is fine. Namespaces add verbosity.

---

## 📋 Recommended Refinement Plan

### Phase 1: Critical Fixes (This Week)

#### 1.1 Rename Sheet → BottomSheet
```bash
# Rename files
mv packages/ds/src/primitives/Sheet packages/ds/src/primitives/BottomSheet

# Update exports
# primitives/BottomSheet/index.ts
export { BottomSheet } from './BottomSheet';
export { BottomSheet as Sheet } from './BottomSheet'; // @deprecated Use BottomSheet

# Update all imports
find packages/ds/src -type f -name "*.tsx" -exec sed -i '' 's/from "\.\.\/Sheet"/from "..\/BottomSheet"/g' {} +
```

**Impact:** Aligns code with taxonomy. Deprecation alias ensures no breaks.

#### 1.2 Document Primitive vs Shell Distinction
```markdown
# docs/handbook/PRIMITIVES_VS_SHELLS.md

## Primitives
Low-level mechanics (overlay, positioning, focus trap).
No opinions on slots, no responsive behavior.

## Shells
High-level compositions built on primitives.
Provide slots, CSS vars, data attrs, responsive behavior.
```

#### 1.3 Clarify Routes Relationship
```markdown
# docs/handbook/ROUTES_AND_SHELLS.md

## Routes are Recipes
Routes are high-level compositions built on shells + routing logic.

- FullScreenRoute = ModalShell + routing guards + focus trap
- FlowScaffold = PageShell + multi-step state + URL sync
- RoutePanel = DrawerShell + routing + desktop layout
```

**Impact:** Developers understand how pieces fit together.

---

### Phase 2: Foundation Shells (Next 2 Weeks)

#### 2.1 Implement ModalShell
```
shell/micro/ModalShell.tsx
shell/micro/ModalShell.css
```

**Purpose:** Centered dialog (desktop-first)  
**Slots:** Header, Body, Actions  
**Behavior:** Focus trap, ESC, overlay click policy, sizes (sm/md/lg/xl)

#### 2.2 Implement DrawerShell
```
shell/micro/DrawerShell.tsx
shell/micro/DrawerShell.css
```

**Purpose:** Left/right off-canvas panel  
**Slots:** Header, Body, Footer  
**Behavior:** Side (left/right), pushes on desktop, overlay on mobile

#### 2.3 Wrap Popover Primitive
```
shell/micro/PopoverShell.tsx
```

**Purpose:** Anchored pickers/forms  
**Uses:** Existing `primitives/Popover` for positioning  
**Adds:** Slots (Header, Body), consistent styling

---

### Phase 3: Restructure (Month 2)

#### 3.1 Optional: Consolidate Directory Structure
```
packages/ds/src/shell/
├── core/              ← Shared utilities
│   ├── useAppEnvironment.ts
│   └── useShellContext.ts
├── macro/             ← App-level
│   ├── AppShell/
│   ├── PageShell/
│   └── NavShell/
├── meso/              ← Workspace patterns
│   ├── WorkbenchShell/
│   ├── CanvasShell/
│   └── DataShell/
├── micro/             ← Overlays
│   ├── BottomSheet/
│   ├── ModalShell/
│   ├── DrawerShell/
│   ├── PopoverShell/
│   ├── TooltipShell/
│   └── ContextMenuShell/
└── recipes/           ← Compositions
    ├── DashboardShell/
    ├── WorkbenchShell/
    └── route-shells/
        ├── FullScreenRouteShell/
        └── FlowScaffoldShell/
```

**Impact:** Clear hierarchy, easier to navigate.

**Risk:** Breaking change for imports (needs migration guide).

**Recommendation:** Do this as v3.0.0 major version bump, not now.

---

### Phase 4: Complete Micro Shells (Month 3)

- TooltipShell
- ContextMenuShell
- ToastShell
- CommandPaletteShell
- PanelShell
- DockShell
- HeaderShell

---

## 🎯 Immediate Action Items

### This Week

1. ✅ **Rename Sheet → BottomSheet** (with deprecation alias)
2. ✅ **Document Primitives vs Shells** (new handbook page)
3. ✅ **Clarify Routes relationship** (update SHELL_SYSTEM.md)
4. ✅ **Add architecture decision record** (this document)

### Next Week

5. ⏳ **Implement ModalShell** (desktop-first dialog)
6. ⏳ **Implement DrawerShell** (left/right panels)
7. ⏳ **Wrap PopoverShell** (anchored overlays)

### Month 2

8. ⏳ **Implement remaining micro shells** (Toast, Tooltip, ContextMenu)
9. ⏳ **Consider directory restructure** (if pain points emerge)

---

## ✅ Architecture Health Check

### Strengths

1. **Clear philosophy:** "Frames not skins" is consistent and well-documented
2. **Composability:** Shells stack naturally (AppShell → PageShell → WorkbenchShell)
3. **Token-driven:** No hardcoded values, all from design tokens
4. **Responsive by default:** useAppEnvironment() powers all adaptations
5. **Flowbite synergy:** Components live in slots, themed by tokens

### Weaknesses (To Address)

1. **Naming inconsistency:** Sheet vs BottomSheet (fix: rename)
2. **Routes overlap:** Unclear relationship to shells (fix: document)
3. **Missing shells:** Can't build full app with shells only (fix: implement)
4. **Primitive distinction:** Not clear what's a primitive vs shell (fix: document)

### Opportunities

1. **Unified taxonomy:** All shells follow same patterns (leverage this)
2. **Recipe system:** Build more opinionated compositions (expand this)
3. **Auto-wiring:** More context-based auto-configuration (explore this)

### Threats

1. **Overengineering:** Don't build shells no one uses (validate usage first)
2. **Breaking changes:** Refactors could disrupt users (deprecate carefully)
3. **Learning curve:** Too many shells = confusion (prioritize docs)

---

## 📊 Decision Matrix

### Should We Restructure Directories?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Keep Current** | No breaking changes, simpler | Flat structure may get cluttered | ✅ **Do this now** |
| **Restructure (macro/meso/micro)** | Clear hierarchy, easier navigation | Breaking imports, migration needed | ⏳ **v3.0.0 later** |

**Decision:** Keep current structure until we have 10+ shells, then restructure as major version.

### Should We Rename Sheet → BottomSheet?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Rename** | Aligns with taxonomy, intuitive | Migration work, deprecation period | ✅ **Yes, do this** |
| **Keep Sheet** | No breaking changes | Confusing vs docs | ❌ **Don't do this** |

**Decision:** Rename with deprecation alias. Worth the small pain for clarity.

### Should We Merge Routes into Shell?

| Option | Pros | Cons | Recommendation |
|--------|------|------|----------------|
| **Merge** | Single taxonomy, clearer | Large refactor, breaking | ⏳ **v3.0.0 later** |
| **Keep Separate** | No changes, backward compat | Some conceptual overlap | ✅ **Do this now** |

**Decision:** Keep separate for now, document relationship clearly. Consider merge in v3.0.0.

---

## 🏁 Conclusion

### Current Architecture: **B+ (Very Good)**

**Strengths:**
- ✅ Strong philosophical foundation ("frames not skins")
- ✅ Consistent patterns across all shells
- ✅ Clean separation of concerns (tokens → Flowbite → shells → app)
- ✅ Responsive by design

**Needs Improvement:**
- ⚠️ Naming consistency (Sheet → BottomSheet)
- ⚠️ Documentation clarity (primitives vs shells, routes relationship)
- ⚠️ Missing foundation shells (Modal, Drawer, Popover wrappers)

### Recommended Path Forward

**Short-term (This Month):**
1. Rename Sheet → BottomSheet
2. Document primitives vs shells
3. Clarify routes relationship
4. Implement ModalShell, DrawerShell, PopoverShell

**Long-term (v3.0.0):**
1. Consider directory restructure (macro/meso/micro/)
2. Consider merging routes into shell/recipes/
3. Complete all 17 shells in taxonomy

### Final Verdict

**The architecture is fundamentally sound.** The refinements are mostly:
- Naming alignment (easy fix)
- Documentation (easy fix)
- Missing implementations (planned work)

**No major architectural flaws detected.** The "frames not skins" philosophy is working perfectly. The shell system composes well with existing primitives and routes.

**Ship it!** 🚀
