# Capabilities System - Locked In & Stable

**Date**: 2025-01-25  
**Status**: 🔒 **LOCKED & VALIDATED**

---

## **What We Locked In (60 Minutes)**

### **1. API Refinements**

**Sheet Props:**
- ✅ `forceMode?: 'modal' | 'sheet'` - Rollback lever (emergency bypass)
- ✅ `onBeforeDismiss?: () => boolean | Promise<boolean>` - Confirmation flows
- ✅ `initialSnap?: number` - Mobile snap point (0-1)
- ✅ `disableDrag?: boolean` - Disable gestures

**Popover Props:**
- ✅ `collisionPadding?: number` - Edge collision control (default 8)
- ✅ `placement?: Placement` - 12 Floating UI placements
- ✅ `open/onOpenChange` - Controlled mode

**Examples:**
```typescript
// Rollback lever
<Sheet forceMode="modal" open={open} onOpenChange={setOpen} ariaLabel="Settings">
  {/* Forces modal even on mobile */}
</Sheet>

// Confirmation flow
<Sheet 
  open={open} 
  onOpenChange={setOpen}
  ariaLabel="Edit Form"
  onBeforeDismiss={() => {
    if (hasUnsavedChanges) {
      return window.confirm('Unsaved changes. Close anyway?');
    }
    return true;
  }}
>
  {/* Content */}
</Sheet>

// Edge collision
<Popover 
  trigger={<button>Menu</button>}
  content={<MenuItems />}
  collisionPadding={16}  // Extra space from edges
/>
```

---

### **2. Enhanced Canaries**

**Added 3 new canaries:**
- ✅ `CapacitorStub` - Tests Capacitor detection + haptics
- ✅ `ForceModeOverride` - Tests `forceMode` prop works
- ✅ Enhanced existing canaries for robustness

**Total Canaries:**
- Sheet: 6 stories (DesktopKeyboard, MobileSheet, A11yCheck, RuntimeTelemetry, CapacitorStub, ForceModeOverride)
- Popover: 3 stories (PositioningCheck, EdgePlacementCheck, A11yCheck)

**Run:** `pnpm validate:canaries`

---

### **3. CI Workflows**

**Created:**
- `.github/workflows/capabilities-canaries.yml` - Runs canary tests on every PR
- `.github/workflows/bundle-budget.yml` - Enforces 550KB budget + reports PR comment

**Triggers:**
- On PR to `packages/ds/src/primitives/**` or `capabilities/**`
- On push to `main`

**Gates:**
- ❌ PR blocked if canaries fail
- ❌ PR blocked if bundle exceeds budget
- ✅ PR comment shows bundle size + headroom

---

### **4. Version Pinning**

**Created:** `renovate.json`

**Strategy:**
- Pin behavior engines (RSBS, Floating UI, etc.)
- Weekly Renovate PRs
- Auto-merge dev deps (patch/minor only)
- Security alerts enabled

**Pinned Libraries:**
- `react-spring-bottom-sheet`
- `@floating-ui/react`
- `@use-gesture/react`
- `react-spring`
- `react-virtuoso`
- `@capacitor/haptics`
- `@capacitor/keyboard`
- `flowbite` + `flowbite-react`

---

### **5. PR Template Updated**

**Added checks:**
```bash
✅ pnpm validate:canaries   # Canary stories
✅ pnpm validate:bundle     # Bundle budget
```

**Section added:**
- Capabilities System validation (if touched primitives/capabilities)
- Clear checklist for canaries + bundle checks

---

## **Success SLOs**

| Metric | Target | Enforcement |
|--------|--------|-------------|
| **Doctor p95** | ≤ 120s | CI timeout |
| **Bundle budget** | ≤ 550KB | CI gate |
| **Canary pass rate** | 100% on main | CI gate |
| **Adoption ratio** | DS/Flowbite > 1.0 in 30d | Metrics report |
| **Incident rate** | 0 regressions/month | Post-mortem if fails |

---

## **Failure Modes Covered**

| Symptom | Root Cause | Canary Catches | Fix |
|---------|-----------|----------------|-----|
| **Can't scroll on mobile** | Drag too broad | `MobileSheet` story | Scope to handle |
| **Keyboard hides inputs** | No insets | `CapacitorStub` | `useKeyboardInsets()` |
| **Popover clipped** | No flip/shift | `EdgePlacementCheck` | Keep Floating UI middleware |
| **Bundle bloats** | Inlined engine | Bundle budget gate | Keep dynamic `import()` |
| **A11y regression** | Missing ARIA | `A11yCheck` + axe | Stick to semantics |
| **API drift** | Accidental change | API Extractor | Freeze baseline |

---

## **Release Hygiene**

### **Version Control**
- ✅ Renovate weekly PRs
- ✅ Pinned versions (behavior engines)
- ✅ Changesets for semver + changelogs

### **Quality Gates**
- ✅ API Extractor in `doctor`
- ✅ Canaries in CI
- ✅ Bundle budget in CI
- ✅ ESLint import bans (pre-commit)

### **Rollout Process**
1. Publish DS to demo app
2. Run canaries + Playwright
3. Monitor telemetry 24-48h
4. Promote to main consumers
5. Record in `/reports`

---

## **Commands Reference**

```bash
# Full validation
pnpm doctor                 # All gates

# Capabilities-specific
pnpm validate:canaries      # Canary stories
pnpm validate:bundle        # Bundle budget
pnpm lint:prod              # ESLint (import bans)

# API surface
pnpm api:check              # Baseline stable
pnpm api:update             # Update baseline

# Development
pnpm sb                     # View stories
pnpm sb:test                # Run test runner
```

---

## **What's Different Now**

### **Before (Capabilities Only)**
- Routing by context (pointer/viewport/Capacitor)
- Lazy loading (desktop doesn't download mobile code)
- ESLint bans (can't import engines directly)
- API Extractor (surface frozen)
- Dev telemetry (console logging)

### **After (Capabilities + Locked Validation)**
- + **forceMode prop** (emergency rollback lever)
- + **onBeforeDismiss** (confirmation flows for forms)
- + **Canary CI** (auto-runs on every PR)
- + **Bundle budget CI** (enforces 550KB limit)
- + **Version pinning** (Renovate weekly)
- + **Enhanced canaries** (Capacitor stub, force mode)
- + **PR template** (capabilities checklist)

---

## **Next Steps (Beyond Capabilities)**

### **Immediate (This Sprint)**
- ✅ Capabilities locked & validated
- ⏳ Generate Core Six DS primitives (Select, Textarea, Checkbox, Radio, Toggle, Badge)
- ⏳ Generate Core Form Fields (TextField, EmailField, SelectField, etc.)

### **Short-Term (Next Sprint)**
- Add `<VirtList>` wrapper (react-virtuoso)
- Add `<Carousel>` wrapper (keen-slider)
- Add one Playwright smoke test (desktop + mobile)
- Create Obeya dashboard (adoption, SLOs, routing metrics)

### **Long-Term (Next Month)**
- Extract recipes (AsyncSearchSelect, DatePicker, DragDropUpload)
- Build bespoke fields (SignaturePad, WheelTimePicker)
- Add comprehensive E2E coverage
- Document all patterns in living docs

---

## **Pattern to Repeat**

For every new capability-aware primitive:

1. **API Design** - Props for content only, behavior auto-wired
2. **Capability Routing** - Check pointer/viewport/Capacitor
3. **Lazy Loading** - Dynamic `import()` behind capability check
4. **SKIN Tokens** - Only `--ds-*` vars, no magic numbers
5. **Canary Stories** - Desktop + mobile + a11y + Capacitor stub
6. **API Baseline** - Update API Extractor if needed
7. **Rollback Lever** - Add `forceMode` or similar prop
8. **Bundle Check** - Verify lazy-load working
9. **Documentation** - Usage in docs, examples in stories

**This pattern is now proven and repeatable.**

---

## **Bottom Line**

**Capabilities System: 100% Locked In**

You have:
- ✅ Strong architecture (routing by context)
- ✅ Strong guardrails (API Extractor, ESLint, TypeScript)
- ✅ Strong validation (canaries, bundle budget, CI)
- ✅ Emergency levers (forceMode, version pins)
- ✅ Clear SLOs (bundle, canaries, adoption)

**This stays boring and reliable as you scale.**

Apply the same pattern to:
- Select, Drawer, Tooltip, VirtList, Carousel, Combobox
- Any multi-platform primitive

**The validation layer ensures no surprises.**

---

**Status**: 🔒 **LOCKED IN & READY TO SCALE**

Time to stamp out Core Six primitives. The foundation is solid. 🏭✨
