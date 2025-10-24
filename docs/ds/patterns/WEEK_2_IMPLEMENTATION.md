

# Week 2 Implementation - Route Navigation Components

**Status**: ✅ Implementation complete  
**Date**: Oct 24, 2025  
**Components**: FullScreenRoute, FlowScaffold, RoutePanel, useOverlayPolicy

---

## 🎯 What We Built

**Week 2 expands** the sheet system (micro) with route-level navigation:
- **FullScreenRoute** (macro): Focused tasks with full viewport
- **FlowScaffold** (meso): Multi-step wizards within routes
- **RoutePanel**: Desktop persistent panels
- **useOverlayPolicy**: Automatic escalation from sheets → routes

---

## 📁 Component Structure (DS Pattern)

Each component follows the established DS pattern:

```
/packages/ds/src/routes/
  /FullScreenRoute/
    FullScreenRoute.tsx    // Component shell
    FullScreenRoute.css    // DS tokens only
    index.ts               // Barrel export
    
  /FlowScaffold/
    FlowScaffold.tsx       // Wizard scaffold
    FlowScaffold.css       // DS tokens only
    useSubFlow.ts          // URL-bound step management
    index.ts
    
  /RoutePanel/
    RoutePanel.tsx         // Desktop panel
    RoutePanel.css         // DS tokens only
    index.ts
```

**Plus hooks**:
```
/packages/ds/src/hooks/
  useOverlayPolicy.ts      // Escalation logic
```

---

## 🧩 Components

### **1. FullScreenRoute** (Macro)

**Use for**: checkout, onboarding, complex setup wizards

**Features**:
- ✅ Fills viewport (position: fixed, inset: 0)
- ✅ Modal-like (aria-modal, role="dialog")
- ✅ Guards unsaved changes (onBeforeExit hook)
- ✅ Keyboard: Esc triggers back (desktop pattern)
- ✅ Framer Motion animations
- ✅ Safe area insets (mobile)
- ✅ Reduced motion support

**Usage**:
```tsx
import { FullScreenRoute } from '@intstudio/ds/routes';

<Route path="/checkout" element={
  <FullScreenRoute 
    ariaLabel="Checkout"
    onBeforeExit={async () => {
      if (hasUnsavedChanges) {
        return window.confirm('Discard changes?');
      }
      return true;
    }}
  >
    <CheckoutFlow />
  </FullScreenRoute>
} />
```

**CSS Tokens Used**:
- `--ds-color-surface-base`
- `--ds-z-lane-modal`
- Safe area insets (env())

---

### **2. FlowScaffold** (Meso)

**Use for**: Multi-step tasks within a single route

**Features**:
- ✅ Header with back button + progress indicator
- ✅ Sticky header/footer (position: sticky)
- ✅ Scrollable content area
- ✅ Step validation (warns invalid step in dev)
- ✅ Mobile responsive
- ✅ Accessible (role="document", aria-labelledby, aria-live)

**Usage**:
```tsx
import { FlowScaffold, useSubFlow } from '@intstudio/ds/routes';

function CreateProjectFlow() {
  const steps = ['name', 'details', 'invite'] as const;
  const flow = useSubFlow(steps);

  return (
    <FlowScaffold
      title="Create project"
      step={flow.index + 1}
      total={flow.total}
      onBack={flow.prev ? () => flow.go(flow.prev) : undefined}
      footer={
        <button onClick={() => flow.next && flow.go(flow.next)}>
          {flow.isLast ? 'Finish' : 'Next'}
        </button>
      }
    >
      {flow.current === 'name' && <NameStep />}
      {flow.current === 'details' && <DetailsStep />}
      {flow.current === 'invite' && <InviteStep />}
    </FlowScaffold>
  );
}
```

**CSS Tokens Used**:
- `--ds-space-*` (padding, gaps)
- `--ds-color-*` (text, surface, border)
- `--ds-font-*` (size, weight)
- `--ds-touch-target`
- `--ds-radius-full`

---

### **3. useSubFlow Hook**

**Features**:
- ✅ URL-bound step management (?step=name)
- ✅ Browser back/forward navigation
- ✅ Deep linking support
- ✅ Shareable URLs
- ✅ TypeScript typed steps
- ✅ Invalid step warnings (dev mode)

**API**:
```tsx
const flow = useSubFlow(['name', 'details', 'invite'], {
  initial: 'name',       // Starting step
  paramKey: 'step',      // Query param key
  replace: false,        // Replace vs push history
});

// State
flow.current   // 'name' | 'details' | 'invite'
flow.index     // 0 | 1 | 2
flow.next      // next step or undefined
flow.prev      // prev step or undefined
flow.isFirst   // boolean
flow.isLast    // boolean
flow.total     // 3

// Navigation
flow.go('details')
flow.go(flow.next)
```

---

### **4. RoutePanel** (Desktop)

**Use for**: Filters, details, split views on desktop

**Features**:
- ✅ Non-modal (background stays interactive)
- ✅ Fixed side panel (left or right)
- ✅ Keyboard: Esc closes
- ✅ Auto-focus on mount
- ✅ Mobile: collapses to full-width sheet
- ✅ RTL support
- ✅ Optional header with close button

**Usage**:
```tsx
import { RoutePanel } from '@intstudio/ds/routes';

<Route path="/products" element={
  <>
    <ProductList />
    {showFilters && (
      <RoutePanel 
        ariaLabel="Filter products"
        title="Filters"
        position="right"
      >
        <FilterForm />
      </RoutePanel>
    )}
  </>
} />
```

**CSS Tokens Used**:
- `--ds-color-surface-*`
- `--ds-shadow-layer-2`
- `--ds-z-lane-panel` (lower than modal)
- `--ds-space-*`, `--ds-touch-target`
- `--ds-radius-lg`

---

### **5. useOverlayPolicy Hook**

**Features**:
- ✅ Automatic escalation when depth ≥ 2
- ✅ Closes all sheets before navigation
- ✅ Preserves "from" URL for back navigation
- ✅ Dev mode logging
- ✅ Depth status tracking

**Usage**:
```tsx
import { useOverlayPolicy } from '@intstudio/ds/hooks';

function MyComponent() {
  const policy = useOverlayPolicy({
    depth: currentDepth,
    maxDepth: 2,
    onCloseAll: closeAllSheets,
  });

  function handleOpenSheet() {
    // Try to escalate first
    if (policy.maybeEscalate('/create?step=1', { 
      reason: 'Multi-step flow' 
    })) {
      return; // Escalated to route
    }

    // Otherwise open sheet normally
    openSheet({ ... });
  }

  // Check depth status
  const status = policy.getDepthStatus();
  // { current: 1, max: 2, remaining: 1, atLimit: false }
}
```

---

## 🔗 Integration with Sheet System

### **Escalation Flow**

```
Sheet Depth 0 (base)
  ↓ open sheet
Sheet Depth 1 (nested)
  ↓ open sheet
Sheet Depth 2 (max)
  ↓ try to open another
useOverlayPolicy.maybeEscalate()
  ↓ depth >= 2
Close all sheets
  ↓ navigate
FullScreenRoute or FlowScaffold
```

### **Example: Task List → Subtasks → Create New**

```tsx
// In SheetDialog (depth 1)
<button onClick={() => {
  // Would be depth 2, OK
  openSheet({ type: 'subtasks' });
}}>
  View subtasks
</button>

// In nested SheetDialog (depth 2)
<button onClick={() => {
  // Would be depth 3, escalate!
  if (policy.maybeEscalate('/create?step=1')) {
    return; // Navigated to full-screen route
  }
  // Never reached
}}>
  Create new task
</button>
```

---

## 🎨 Design Tokens

All components use DS tokens exclusively:

### **Colors**
- `--ds-color-surface-base`
- `--ds-color-text`
- `--ds-color-text-subtle`
- `--ds-color-border-subtle`
- `--ds-color-surface-hover`
- `--ds-color-surface-active`

### **Spacing**
- `--ds-space-3`, `--ds-space-4`, `--ds-space-5`
- `--ds-touch-target` (44px minimum)

### **Typography**
- `--ds-font-size-sm`, `--ds-font-size-lg`, `--ds-font-size-xl`
- `--ds-font-weight-semibold`

### **Borders**
- `--ds-radius-full`, `--ds-radius-lg`

### **Shadows**
- `--ds-shadow-layer-2`

### **Z-index**
- `--ds-z-lane-modal` (full-screen routes)
- `--ds-z-lane-panel` (desktop panels)

---

## ♿ Accessibility

### **FullScreenRoute**
- ✅ `role="dialog"`
- ✅ `aria-modal="true"`
- ✅ `aria-label` required
- ✅ Keyboard: Esc closes

### **FlowScaffold**
- ✅ `role="document"`
- ✅ `aria-labelledby` (flow title)
- ✅ Progress announced (`aria-live="polite"`)
- ✅ Back button with `aria-label`

### **RoutePanel**
- ✅ `role="complementary"`
- ✅ `aria-label` required
- ✅ Auto-focus on mount
- ✅ `tabIndex={-1}` for programmatic focus
- ✅ Keyboard: Esc closes

---

## 📱 Responsive Behavior

### **FullScreenRoute**
- **Mobile**: Full viewport
- **Desktop**: Full viewport
- **Tablet**: Full viewport
- Safe area insets on mobile

### **FlowScaffold**
- **Mobile**: Reduced padding, smaller title
- **Desktop**: Standard padding
- Header/footer sticky on all sizes

### **RoutePanel**
- **Mobile**: Collapses to full-width bottom sheet (85vh max)
- **Desktop**: Side panel (420px / 36vw)
- **Tablet**: Side panel

---

## 🧪 Testing Checklist

### **FullScreenRoute**
- [ ] Renders full viewport
- [ ] Esc triggers navigation back
- [ ] onBeforeExit blocks navigation when returns false
- [ ] Safe area insets applied on mobile
- [ ] Reduced motion disables animations
- [ ] Deep link loads correctly

### **FlowScaffold**
- [ ] Back button only shows when onBack provided
- [ ] Progress updates on step change
- [ ] Invalid step shows warning (dev)
- [ ] Footer renders when provided
- [ ] Mobile responsive
- [ ] Screen reader announces step changes

### **useSubFlow**
- [ ] URL updates on go()
- [ ] Browser back/forward works
- [ ] Deep link loads correct step
- [ ] Invalid step falls back to first
- [ ] isFirst/isLast correct
- [ ] next/prev undefined at boundaries

### **RoutePanel**
- [ ] Non-modal (background clickable)
- [ ] Esc closes panel
- [ ] Auto-focuses on mount
- [ ] Mobile collapses to sheet
- [ ] RTL layout works
- [ ] Close button works

### **useOverlayPolicy**
- [ ] Escalates when depth >= maxDepth
- [ ] Calls onCloseAll before navigate
- [ ] Preserves "from" URL param
- [ ] getDepthStatus returns correct values
- [ ] Dev mode logs escalations

---

## 📚 Usage Examples

### **Example 1: Checkout Flow**

```tsx
// App.tsx
<Routes>
  <Route path="/checkout" element={
    <FullScreenRoute ariaLabel="Checkout">
      <CheckoutFlow />
    </FullScreenRoute>
  } />
</Routes>

// CheckoutFlow.tsx
function CheckoutFlow() {
  const steps = ['cart', 'shipping', 'payment', 'review'] as const;
  const flow = useSubFlow(steps);
  const [cart, setCart] = useState(/* ... */);

  return (
    <FlowScaffold
      title="Checkout"
      step={flow.index + 1}
      total={flow.total}
      onBack={flow.prev ? () => flow.go(flow.prev) : undefined}
      footer={
        <>
          <button onClick={() => window.history.back()}>Cancel</button>
          <button onClick={() => flow.next && flow.go(flow.next)}>
            {flow.isLast ? 'Place order' : 'Continue'}
          </button>
        </>
      }
    >
      {flow.current === 'cart' && <CartStep cart={cart} />}
      {flow.current === 'shipping' && <ShippingStep />}
      {flow.current === 'payment' && <PaymentStep />}
      {flow.current === 'review' && <ReviewStep cart={cart} />}
    </FlowScaffold>
  );
}
```

### **Example 2: Desktop Filters**

```tsx
function ProductsPage() {
  const [params] = useSearchParams();
  const showFilters = params.get('panel') === 'filters';

  return (
    <>
      <ProductList />
      
      {showFilters && (
        <RoutePanel ariaLabel="Filter products" title="Filters">
          <FilterForm />
        </RoutePanel>
      )}
    </>
  );
}
```

### **Example 3: Sheet Escalation**

```tsx
function TaskSheet() {
  const depth = useSheetDepth(); // 2
  const policy = useOverlayPolicy({
    depth,
    onCloseAll: closeAllSheets,
  });

  function handleCreateTask() {
    // At depth 2, would need depth 3
    if (policy.maybeEscalate('/tasks/new?step=1')) {
      return; // Escalated to full-screen
    }
    
    // Never reached at depth 2
  }

  return <button onClick={handleCreateTask}>Create task</button>;
}
```

---

## 🚀 Next Steps

**Week 3 Goals**:
1. ✅ Add Playwright tests for all route components
2. ✅ Storybook demos showing escalation flow
3. ✅ ESLint rules for route patterns
4. ✅ Telemetry hooks (useTelemetry)
5. ✅ Performance budgets for route transitions

**Future Enhancements**:
- Command palette integration
- Bottom nav for mobile tabs
- Split view manager for desktop
- Transition between sheet ↔ route

---

## 📊 Component Comparison

| Component | Modal | URL-bound | Depth Limit | Use Case |
|-----------|-------|-----------|-------------|----------|
| SheetDialog | ✅ | ❌ | 2 | Quick tasks |
| SheetPanel | ❌ | ✅ | 1 | Context |
| FlowScaffold | ❌ | ✅ | N/A | Multi-step |
| FullScreenRoute | ✅ | ✅ | N/A | Focused tasks |
| RoutePanel | ❌ | ✅ | N/A | Desktop filters |

---

## ✅ Definition of Done

**Each component has**:
- [x] Component shell (.tsx)
- [x] DS-tokenized CSS (.css)
- [x] TypeScript types
- [x] JSDoc documentation
- [x] Barrel export (index.ts)
- [x] Accessibility attributes
- [x] Keyboard handling
- [x] Mobile responsive
- [x] Reduced motion support
- [x] Dev mode validations
- [ ] Playwright tests (Week 3)
- [ ] Storybook stories (Week 3)
- [ ] Usage examples (✅ this doc)

---

**Status: Implementation complete, ready for testing & integration!** 🎉
