# Capabilities System - Validation & Observability

**Purpose**: Keep capabilities system working correctly over time  
**Status**: 🟢 Active

---

## **Philosophy: No Surprises**

The capabilities system routes behavior by context. We validate:
- ✅ Same public APIs over time (API Extractor)
- ✅ Correct routing (desktop=modal, mobile=sheet, Capacitor=haptics)
- ✅ Brand consistency (SKIN tokens applied)
- ✅ A11y preserved (focus trap, ARIA, keyboard)
- ✅ Lean bundles (desktop doesn't load mobile engines)
- ✅ Fast diagnosis (dev telemetry + canaries)

---

## **Validation Layers**

### **1. Canary Stories (Automated)**

**Location**: `packages/ds/src/primitives/*/*.canary.stories.tsx`

**Sheet Canaries:**
- `DesktopKeyboard` - Opens modal, ESC closes, focus returns
- `MobileSheet` - Opens sheet, lazy-loads correctly, no errors
- `A11yCheck` - ARIA attributes, color contrast, focus management
- `RuntimeTelemetry` - Console logs routing decision (dev only)

**Popover Canaries:**
- `PositioningCheck` - Floating UI works, no clipping
- `EdgePlacementCheck` - Flip/shift keeps in viewport
- `A11yCheck` - ARIA + contrast validation

**Run:**
```bash
# All canaries
pnpm validate:canaries

# Or via Storybook test runner
pnpm sb:test --grep='Canaries'
```

**Frequency**: Every PR (CI), every local build (optional)

---

### **2. Bundle Validation (Build-Time)**

**Location**: `scripts/check-bundle-lazy-load.sh`

**Checks:**
- `react-spring-bottom-sheet` NOT in main bundle
- `@use-gesture/react` NOT in main bundle
- Mobile engines correctly lazy-loaded

**Run:**
```bash
pnpm validate:bundle
```

**Expected Output:**
```
✅ PASS: 'react-spring-bottom-sheet' not in main bundle
✅ PASS: 'BottomSheet' not in main bundle
✅ PASS: '@use-gesture/react' not in main bundle
✅ Bundle check PASSED
```

**Frequency**: Every build in CI (production profile)

---

### **3. API Surface Protection (Existing)**

**Tool**: API Extractor

**What it does:**
- Freezes public API of `<Sheet>`, `<Popover>`, etc.
- Blocks accidental breaking changes
- Requires label for intentional breaks

**Run:**
```bash
pnpm api:check
```

**Frequency**: Every PR (already in CI)

---

### **4. Import Guardrails (Existing)**

**Tool**: ESLint `no-restricted-imports`

**What it blocks:**
```typescript
// ❌ Product code CANNOT do:
import { BottomSheet } from 'react-spring-bottom-sheet';
import { useFloating } from '@floating-ui/react';
import { Haptics } from '@capacitor/haptics';

// ✅ Must use DS wrappers:
import { Sheet, Popover, haptic } from '@intstudio/ds';
```

**Run:**
```bash
pnpm lint:prod
```

**Frequency**: Every commit (pre-commit hook)

---

### **5. Dev Telemetry (Runtime)**

**Location**: Sheet/Popover components (dev only)

**Logs:**
```
[DS.Sheet] routing=sheet (pointer=coarse, viewport=small, capacitor=no)
[DS.Sheet] routing=modal (pointer=fine, viewport=large, capacitor=no)
```

**Purpose**: Quick diagnosis of routing decisions

**How to see:**
1. Open app in dev mode
2. Open browser console
3. Trigger Sheet/Popover
4. See routing decision logged

**Production**: Automatically stripped (NODE_ENV check)

---

## **Failure Modes & Detection**

| Risk | Symptom | Canary Catches | Mitigation |
|------|---------|----------------|------------|
| **Gesture vs scroll** | Page won't scroll | `MobileSheet` story checks scroll | Scope drags to handle only |
| **Keyboard covers content** | Inputs hidden | Capacitor stub test | `useKeyboardInsets()` adjusts |
| **Popover off-screen** | Clipped menus | `EdgePlacementCheck` | `flip()` + `shift()` |
| **Bundle bloat** | Desktop loads mobile libs | `validate:bundle` script | Dynamic `import()` |
| **A11y regression** | Focus escapes | `A11yCheck` + axe | Stick to Modal/RSBS semantics |
| **Library churn** | Upgrade breaks behavior | API Extractor unchanged | Lock versions, test in canary |

---

## **Quality Gates (PR Requirements)**

Every PR to DS must pass:

```bash
# The full doctor includes all validation
pnpm doctor

# Which runs:
pnpm barrels              # ✅ Generate exports
pnpm lint:prod            # ✅ ESLint (includes import bans)
pnpm typecheck            # ✅ TypeScript
pnpm build                # ✅ All packages compile
pnpm api:check            # ✅ API surface stable
pnpm validate:generated   # ✅ Component structure
pnpm validate:bundle      # ✅ Lazy-load working (add to doctor)
```

**Add to CI:** `.github/workflows/generators.yml` or main CI workflow

---

## **Rollout Discipline**

### **Feature Flag (Optional)**

Add rollback lever to `<Sheet>`:

```typescript
export type SheetProps = {
  // ...existing props
  /**
   * Force modal or sheet (for testing/rollback)
   * @default undefined (auto-detect)
   */
  forceMode?: 'modal' | 'sheet';
};
```

**Usage:**
```typescript
// Rollback to modal if sheet has issues
<Sheet forceMode="modal" {...props} />
```

### **Canary Release**

1. Ship DS to internal demo app first
2. Run Playwright on mobile emulation
3. Check telemetry for 24-48h
4. Promote to all apps if clean

---

## **"Done Means Done" Checklist**

For every capability-aware primitive:

- [ ] **Tokenized visuals** - Only `--ds-*` vars (no hardcoded)
- [ ] **Capability routing** - `pointer`/`viewport`/`Capacitor` checks
- [ ] **Lazy-load** - Heavy engines via dynamic `import()`
- [ ] **A11y** - ARIA roles, keyboard nav (Tab/ESC)
- [ ] **API baseline** - API Extractor updated if needed
- [ ] **Matrix stories** - Desktop & mobile viewports
- [ ] **Canary stories** - Keyboard, viewport, a11y checks
- [ ] **ESLint** - External engines only inside DS
- [ ] **Bundle check** - `validate:bundle` passes
- [ ] **Doctor green** - All gates pass

---

## **Metrics & Observability**

### **Current (Dev Telemetry)**

Console logs show routing decisions:
- Which path was taken (modal vs sheet)
- Why (pointer type, viewport size, Capacitor presence)

### **Future (Optional)**

Track routing in metrics:

```typescript
// Aggregate in reports/routing-metrics.json
{
  "sheet_renders": {
    "desktop_modal": 1243,
    "mobile_sheet": 856,
    "capacitor_sheet": 234
  },
  "last_updated": "2025-01-25T14:30:00Z"
}
```

**Benefits**:
- Verify capability routing working as expected
- Identify usage patterns
- Inform future optimizations

---

## **Production Early Warning**

Add error boundary in app shell:

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, info) => {
        console.error('[DS Error]', {
          component: info.componentStack,
          error: error.message,
          stack: error.stack,
        });
        // Optional: Send to monitoring service
      }}
      fallbackRender={({ error }) => (
        <div>Error: {error.message}</div>
      )}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

**Benefit**: Context to reproduce crashes (rare but valuable)

---

## **Commands Reference**

```bash
# Validate everything
pnpm doctor                 # All quality gates

# Individual checks
pnpm validate:bundle        # Lazy-load check
pnpm validate:canaries      # Run canary stories
pnpm lint:prod              # ESLint (import bans)
pnpm api:check              # API surface check
pnpm typecheck              # TypeScript
pnpm build                  # Build all packages

# Storybook
pnpm sb                     # View stories
pnpm sb:test                # Run all story tests
pnpm sb:test --grep='Canaries'  # Run only canaries
```

---

## **Success Metrics**

**Validation Coverage:**
- ✅ API surface: API Extractor (100%)
- ✅ Import hygiene: ESLint (100%)
- ✅ Bundle safety: Shell script (critical paths)
- ✅ Runtime behavior: Canary stories (key flows)
- ✅ A11y: Axe + keyboard tests (core interactions)

**Quality Bar:**
- Zero regressions escaping to production
- Fast diagnosis (<5 min to root cause)
- Confident refactoring (API stable, tests pass)

---

## **Bottom Line**

**You've built the right system.**

Now you have the **validation layer** that keeps it working:
- Canaries catch regressions early
- Bundle checks prevent bloat
- API Extractor blocks breaking changes
- ESLint prevents bypasses
- Dev telemetry aids diagnosis

**This is boring, reliable, and scales.**

Apply the same pattern to: Select, Drawer, Tooltip, VirtList, Carousel, etc.

---

**Status**: 🟢 **Validation System Operational**

Capabilities + Guardrails + Validation = No Surprises
