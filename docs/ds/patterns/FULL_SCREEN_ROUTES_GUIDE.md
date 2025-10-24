# Full-Screen Routes & Sub-Flow Navigators

**When sheets aren't enough** → Escalate to routes  
**Pattern**: Sheet system (micro) → Sub-flow (meso) → Full-screen (macro)

---

## 🧭 When to Escalate Beyond a Sheet

Use `SheetDialog` or `SheetPanel` until one of these is true:

### **Depth / Complexity**
- You'd need a 3rd sheet (max depth is 2)
- Nested confirmations required
- Flow has >2 steps

### **Focus**
- Task takes over user's attention
- Examples: checkout, onboarding, setup wizard

### **Tooling**
- Need toolbar/app bar
- Need tabs or navigation
- Need wizard/stepper UI

### **Navigation**
- Need shareable URLs
- Need deep links
- Need "back" semantics per step
- Browser history integration

### **Platform Idioms**
- Some flows feel better as full-screen on mobile
- Desktop users expect side-by-side context

**Then escalate** to a full-screen route or sub-flow navigator.

---

## 🗂️ Pattern Catalog (Mobile + Web)

### **1. Full-Screen Modal Route** (route == screen)

**Use for**: Focused tasks (checkout, create resource, verify phone, onboarding step)

**Pros**:
- Shareable URL
- Deep linking
- Ideal for complex layout
- Clear back semantics

**Behavior**:
- **Mobile**: Slide-in from right (iOS) or up (Android), fills viewport
- **Web**: Fades or slides over content; background is inert
- **Back/Esc**: Pops to previous route; unsaved changes get interstitial

#### **Implementation (React Router v6)**

```tsx
// routes.tsx
import { Routes, Route, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';

export function AppRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/checkout" element={
          <FullScreenRoute ariaLabel="Checkout">
            <Checkout />
          </FullScreenRoute>
        } />
      </Routes>
    </AnimatePresence>
  );
}

// FullScreenRoute.tsx
export function FullScreenRoute({ 
  children, 
  ariaLabel 
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <motion.aside
      role="dialog"
      aria-label={ariaLabel}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--ds-color-surface-base)',
        zIndex: 'var(--ds-z-lane-modal)',
      }}
    >
      {children}
    </motion.aside>
  );
}
```

#### **Integration with Sheets**

Your `OverlayManager` can escalate a deep sheet stack to `/checkout`:

```tsx
if (overlayStack.depth >= 2) {
  navigate(`/checkout?from=${currentRoute}`);
}
```

---

### **2. Sub-Flow Navigator** (wizard inside a route)

**Use for**: Multi-step tasks that shouldn't leave page context entirely

**Examples**: Create project: name → details → invite

**Pros**:
- Keeps one URL base (`/create`)
- Step in query/hash
- Compact, predictable back semantics

**Behavior**:
- Step transitions (forward/back) are local
- Browser back follows steps
- Progress indicator in header
- CTA area at bottom

#### **Implementation (Local router in one route)**

```tsx
import { useSearchParams } from 'react-router';

const steps = ['name', 'details', 'invite'] as const;
type Step = typeof steps[number];

export function CreateProjectFlow() {
  const [params, setParams] = useSearchParams();
  const current = (params.get('step') as Step) || 'name';

  const go = (step: Step) => {
    params.set('step', step);
    setParams(params);
  };
  
  const idx = steps.indexOf(current);

  return (
    <FlowScaffold 
      title="Create project" 
      step={idx + 1} 
      total={steps.length}
    >
      {current === 'name' && (
        <NameStep onNext={() => go('details')} />
      )}
      {current === 'details' && (
        <DetailsStep 
          onNext={() => go('invite')} 
          onBack={() => go('name')} 
        />
      )}
      {current === 'invite' && (
        <InviteStep onBack={() => go('details')} />
      )}
    </FlowScaffold>
  );
}
```

**Escalation rule**: If a `SheetDialog` opens a "create new ___" subtask and it becomes 3+ steps, escalate to this sub-flow.

---

### **3. Route-Bound Panel** (desktop/web)

**Use for**: Desktop side panel instead of sheet (filters, details, split views)

**Pros**:
- Consistent with desktop idioms
- Keeps main area visible
- Deep-linkable (`?panel=filters`)

**Behavior**:
- Non-modal
- Natural tab order
- Keyboard accessible
- Respects reduced-motion
- Tokenized z-lane (panel)

#### **Implementation**

```tsx
export function RoutePanel({ 
  children, 
  ariaLabel 
}: {
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <aside 
      role="complementary" 
      aria-label={ariaLabel}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(420px, 35vw)',
        background: 'var(--ds-color-surface-base)',
        boxShadow: 'var(--ds-shadow-overlay-lg)',
        zIndex: 'var(--ds-z-lane-panel)'
      }}
    >
      {children}
    </aside>
  );
}
```

---

### **4. Bottom-Nav / Persistent Root Navigator** (mobile)

**Use for**: "App shell" navigation (tabs, bottom nav)

**Features**:
- Each tab can host sheets/panels or full-screen flows
- Tab-scoped history preserves screen state when switching tabs
- Sheets remain route-relative (`/tab/profile?sheet=edit`)
- Full-screen flows push new routes under the tab

---

### **5. Command Palette / Quick Switcher**

**Use for**: Global navigation/search

**Behavior**:
- Often a `SheetDialog` or popover on desktop
- Full-screen on small devices
- Search → results → hotkeys
- Close on Esc
- Return focus

---

## 🤝 Integration with Sheet System

### **Escalation Bridge**

**From SheetDialog**:
```tsx
// If user selects "Create new ___" and it has >2 steps
if (flowSteps > 2) {
  navigate(`/create?step=1`); // Sub-flow
}
```

**From SheetPanel**:
```tsx
// Tap CTA that requires confirmation
openSheetDialog(ConfirmDialog);

// If it expands into long flow
if (needsMultiStep) {
  navigate('/checkout'); // Full-screen route
}
```

### **URL Binding**

| Component | URL Pattern | Example |
|-----------|-------------|---------|
| SheetPanel | `?panel=<id>` | `?panel=0.50` |
| Sub-flow | `?step=<name>` | `?step=details` |
| Full-screen | Pathname | `/checkout` |
| Combined | Both | `/checkout?from=cart` |

### **Back / Esc Semantics** (Consistent)

| Component | Esc Behavior | Back Behavior |
|-----------|--------------|---------------|
| SheetDialog | Close (revert if applicable), focus returns | N/A (not routed) |
| SheetPanel | Collapse → close (never modal) | Collapse → close |
| Full-screen route | `history.back()` (desktop) | OS back (mobile), guard unsaved |
| Sub-flow | N/A (stays on route) | Previous step, then exit flow |

---

## 🔧 Guardrails & Enforcement

### **Runtime Contracts**

```tsx
// Do not open SheetPanel from SheetDialog
if (parentType === 'dialog' && type === 'panel') {
  throw new Error(
    '[SheetPolicy] Cannot open SheetPanel on top of SheetDialog'
  );
}

// Max sheet depth: 2
if (depth >= 2) {
  console.warn(
    '[SheetPolicy] Maximum depth reached. Escalating to route.'
  );
  navigate(escalationTarget);
  return;
}
```

### **ESLint Rules**

```javascript
// .eslintrc.sheet-routing.json
{
  "rules": {
    "sheet/no-deep-nesting": "error",          // Depth > 2
    "sheet/no-panel-on-dialog": "error",       // Panel → Dialog
    "sheet/no-drag-dismiss-dialog": "error",   // Dialogs are modal
    "sheet/require-aria-label": "error"        // All dialogs need labels
  }
}
```

### **TypeScript Guards**

```tsx
type SheetType = 'dialog' | 'panel';
type RouteEscalation = { target: string; reason: string };

interface SheetPolicy {
  canNest(parent: SheetType, child: SheetType): boolean;
  shouldEscalate(depth: number): RouteEscalation | null;
}
```

---

## 📐 Decision Matrix

| Flow | Start On | Escalate To | Why |
|------|----------|-------------|-----|
| Select a thing (≤2 steps) | SheetDialog | — | Task-focused, modal |
| Create resource (≥3 steps) | SheetDialog | Sub-Flow Route | Stepper, back/URL |
| Map + details | SheetPanel | Sub-Flow for booking | Panel keeps context; booking is a task |
| Desktop filter panel | Route-Panel | — | Desktop idiom; non-modal |
| Global search | SheetDialog (desktop) / Full-screen (mobile) | — | Palette vs full search |

---

## 🧱 Implementation Recipes

### **A. Escalate from Sheet Helper**

```tsx
export function maybeEscalate({ 
  depth, 
  target 
}: { 
  depth: number;
  target: string;
}): boolean {
  if (depth >= 2) {
    navigate(target);
    return true;
  }
  return false;
}

// Usage
if (maybeEscalate({ depth, target: '/create?step=1' })) {
  return; // Don't open another sheet
}
```

### **B. Unsaved Changes Guard (Route)**

```tsx
import { useBlocker } from 'react-router';

export function useUnsavedGuard(isDirty: boolean) {
  useBlocker(({ nextLocation }) => {
    if (!isDirty) return false;
    return window.confirm('Discard your changes?');
  }, isDirty);
}

// Usage in component
const [formData, setFormData] = useState({});
const isDirty = /* check if modified */;
useUnsavedGuard(isDirty);
```

### **C. Sub-Flow Scaffold (Single Route)**

```tsx
export function FlowScaffold({ 
  title, 
  step, 
  total, 
  children, 
  footer 
}: {
  title: string;
  step: number;
  total: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div role="document" aria-labelledby="flow-title">
      <header id="flow-title">
        <h1>{title}</h1>
        <div aria-live="polite">
          Step {step} of {total}
        </div>
      </header>
      <main>{children}</main>
      {footer && <footer>{footer}</footer>}
    </div>
  );
}
```

---

## 🧪 Test Plan (Must-Haves)

### **Full-Screen Route**
- [ ] Focus moves to dialog container
- [ ] Background is inert
- [ ] Esc/back pops history
- [ ] Deep link loads correct step
- [ ] Unsaved changes trigger interstitial

### **Sub-Flow**
- [ ] Forward/back updates `?step=`
- [ ] Soft back moves step
- [ ] Hard back exits flow
- [ ] Screen readers announce step title
- [ ] Progress indicator is accessible

### **Route Panel**
- [ ] Background stays interactive
- [ ] Panel content scrollable
- [ ] Pointer capture works
- [ ] Max-width respected
- [ ] RTL layout works

### **Escalation**
- [ ] When sheet depth reaches 2 and another push happens → navigate to route
- [ ] Confirm inert/scroll-lock refcount drops
- [ ] Sheet cleanup on route transition

---

## 📱 Mobile vs 🖥️ Web: Nuanced Differences

### **Mobile**
- **Prefer full-screen** for long tasks (no chrome)
- **Back button** must follow: collapse → close → navigate
- **Keyboard avoidance** & safe-area handling mandatory
- **Tabs** should preserve sub-navigator history per tab

### **Web**
- **Prefer route-panel** for context + work side-by-side
- **Use popover** instead of sheet for simple field pickers on desktop
- **Preserve scroll** position/scroll-restoration on route changes
- **Keyboard hints** (Esc to close, Enter to commit)

---

## ✅ Implementation Checklist

### **Phase 1: Contracts**
- [ ] Wire runtime contracts (throw on misuse) for SheetDialog/SheetPanel
- [ ] Add ESLint rules (panel-no-modal, no drag-dismiss on dialogs)
- [ ] TypeScript guards for sheet types and escalation

### **Phase 2: Routes**
- [ ] Implement `FullScreenRoute` component
- [ ] Implement `FlowScaffold` for sub-flows
- [ ] Implement `RoutePanel` for desktop
- [ ] Add unsaved changes guard hook

### **Phase 3: Integration**
- [ ] Wire escalation from OverlayManager
- [ ] Add URL binding for sheets
- [ ] Implement back/Esc semantics
- [ ] Add scroll lock cleanup on route change

### **Phase 4: Testing**
- [ ] Playwright tests for back/Esc behavior
- [ ] Deep link tests
- [ ] Escalation logic tests
- [ ] Mobile vs desktop responsive tests

### **Phase 5: Documentation**
- [ ] Storybook demos showing sheet → sub-flow escalation
- [ ] Desktop panel fallback examples
- [ ] Decision tree flowchart
- [ ] Migration guide for existing routes

---

## 🎯 One Cohesive Navigation Substrate

### **Micro**: SheetDialog for tasks
- Quick, focused interactions
- Max depth: 2
- Modal, ephemeral

### **Meso**: SheetPanel for context
- Persistent sidebars
- Non-modal
- Desktop-first

### **Macro**: Full-screen route/sub-flow
- Complex, multi-step flows
- Deep linkable
- Platform-appropriate

**Result**: Users never feel lost or stuck in nested dialogs. The system guides them to the right pattern for their task.

---

## 📚 Related Documents

- `/docs/ds/patterns/NESTED_SHEETS_POLICY.md` - Sheet depth limits
- `/docs/ds/patterns/SHEET_LAYOUT_RULES.md` - Base sheet patterns
- `/packages/ds/src/overlay/OverlayManager.tsx` - Stack management
- `/packages/ds/tests/nested-sheets.spec.ts` - Sheet tests

---

## 🚀 Next Steps

**Want paste-ready code?**
- React Router integration
- Storybook scenario: sheet → sub-flow escalation
- Desktop panel fallback
- Complete test suite

**This guide gives you**:
- Clear escalation rules
- Implementation recipes
- Decision matrix
- Testing strategy
- Platform-specific guidance

**Status**: Ready for implementation 🎉
