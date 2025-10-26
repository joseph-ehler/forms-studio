# Phase 2 Execution Plan - Behavior Layer + BottomSheet

**Goal:** Extract behavior policies and relocate BottomSheet to proper layer

---

## Tasks

### Task 1: Extract Overlay Policy (1 hour)
**From:** `hooks/useOverlayPolicy.ts`, `hooks/useStackPolicy.ts`  
**To:** `shell/behavior/overlay-policy.ts`

**What to Extract:**
- Overlay stack management (single active scrim)
- Z-index coordination
- Body scroll-lock (single lock count)
- Underlay inert management
- ESC/overlay-click dismissal coordination

**Result:** All shells use centralized overlay manager

---

### Task 2: Extract Focus Policy (45 min)
**From:** `hooks/useFocusTrap.ts`  
**To:** `shell/behavior/focus-policy.ts`

**What to Extract:**
- Focus trap implementation (Tab loop)
- Focus capture/return
- ESC handling
- Focusable element querying

**Result:** Consistent focus behavior across all shells

---

### Task 3: Centralize Variant Resolution (30 min)
**Create:** `shell/behavior/variant-resolver.ts` (full implementation)

**What to Build:**
- Props → data-* attributes converter
- Props → --shell-* CSS vars publisher
- CamelCase → kebab-case helper
- Type-aware value handling (boolean/number/string)

**Result:** One place to manage shell contract publishing

---

### Task 4: Create OverlaySheet Primitive (1 hour)
**Create:** `primitives/overlay/OverlaySheet.tsx`

**What It Is:**
- Bottom-anchored overlay mechanics ONLY
- Portal to body
- Basic backdrop
- NO slots (just children)
- NO footer logic
- NO responsive behavior
- NO CSS vars published

**What It's NOT:**
- NOT a shell (that's BottomSheet in shell/micro/)
- NOT opinionated about structure

---

### Task 5: Move BottomSheet (1 hour)
**From:** `primitives/BottomSheet/`  
**To:** `shell/micro/BottomSheet/`

**Changes Needed:**
1. Refactor to use `OverlaySheet` primitive internally
2. Keep all slots (Header, Content, Footer)
3. Keep all shell logic (snap points, footer modes, semantic buckets)
4. Update imports in consuming code
5. Add deprecation alias at old location

**Backward Compat:**
```typescript
// primitives/BottomSheet/index.ts
export { BottomSheet } from '../../shell/micro/BottomSheet';
// @deprecated Moved to shell/micro/BottomSheet
console.warn('[DS] Import BottomSheet from @intstudio/ds/shell instead');
```

---

### Task 6: Refactor Shells to Use Behavior (1 hour)
**Update:** `ModalShell`, `DrawerShell`, `PopoverShell`

**Changes:**
- Remove local scroll-lock → use `lockScroll()` from overlay-policy
- Remove local focus trap → use `trapFocus()` from focus-policy
- Remove local inert → use `setUnderlayInert()` from overlay-policy
- Use `pushOverlay()` for stack coordination

**Result:** DRY - no duplicated behavior code

---

## Acceptance Criteria

### Behavior Layer
- [ ] `overlay-policy.ts` manages single scrim/stack
- [ ] `focus-policy.ts` provides reusable focus trap
- [ ] `variant-resolver.ts` converts props → data-* + vars
- [ ] All shells import from `shell/behavior`

### BottomSheet
- [ ] `primitives/overlay/OverlaySheet.tsx` exists (mechanics only)
- [ ] `shell/micro/BottomSheet/` uses `OverlaySheet` internally
- [ ] Deprecation alias at `primitives/BottomSheet/`
- [ ] All imports resolve correctly

### Refactored Shells
- [ ] No local scroll-lock implementations
- [ ] No local focus trap implementations
- [ ] All use centralized behavior policies
- [ ] Zero code duplication

### Quality Gates
- [ ] `pnpm typecheck` passes
- [ ] `pnpm build` succeeds
- [ ] Zero breaking changes (aliases work)
- [ ] All existing tests pass

---

## Order of Execution

1. ✅ Extract overlay-policy.ts (foundation)
2. ✅ Extract focus-policy.ts (foundation)
3. ✅ Implement variant-resolver.ts (complete)
4. ⏳ Create OverlaySheet primitive
5. ⏳ Move + refactor BottomSheet
6. ⏳ Refactor other shells to use behavior
7. ⏳ Test + verify

---

## Risk Assessment

**Low Risk:**
- Behavior extraction (new files, no changes to existing)
- OverlaySheet creation (new primitive)
- Variant resolver (new utility)

**Medium Risk:**
- BottomSheet move (large refactor, but has deprecation alias)
- Shell refactors (touching working code)

**Mitigation:**
- Test after each step
- Keep deprecation aliases
- Atomic commits

---

## Time Estimate

- Overlay policy: 1 hour
- Focus policy: 45 min
- Variant resolver: 30 min
- OverlaySheet: 1 hour
- BottomSheet move: 1 hour
- Shell refactors: 1 hour

**Total:** ~5.5 hours (spread across sessions)

---

## Success Indicators

After Phase 2:
- ✅ Single source of truth for overlay behavior
- ✅ Single source of truth for focus management
- ✅ BottomSheet correctly placed in shell/micro/
- ✅ True primitive exists (OverlaySheet)
- ✅ No behavior duplication across shells
- ✅ Clear layer boundaries maintained

---

**Ready to execute Phase 2 tasks.**
