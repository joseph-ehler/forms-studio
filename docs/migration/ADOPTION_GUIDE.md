# Adoption Guide - Migrating to DS Route Components

**Goal**: Replace ad-hoc modals, drawers, and wizards with standardized DS components

---

## 🎯 Migration Patterns

### **Pattern 1: Ad-hoc Drawer → RoutePanel**

**Before** (Custom drawer):
```tsx
function ProductsPage() {
  const [showFilters, setShowFilters] = useState(false);
  
  return (
    <>
      <ProductList />
      
      {showFilters && (
        <div
          style={{
            position: 'fixed',
            right: 0,
            top: 0,
            bottom: 0,
            width: '320px',
            background: 'white',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            zIndex: 100,
          }}
        >
          <button onClick={() => setShowFilters(false)}>Close</button>
          <FilterForm />
        </div>
      )}
    </>
  );
}
```

**After** (DS RoutePanel):
```tsx
import { RoutePanel } from '@intstudio/ds/routes';

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

**Benefits**:
- ✅ URL-bound (shareable, deep-linkable)
- ✅ Accessible (role, aria, focus)
- ✅ Mobile responsive (auto-collapses to sheet)
- ✅ RTL support
- ✅ Consistent styling (DS tokens)

---

### **Pattern 2: Ad-hoc Modal → FullScreenRoute**

**Before** (Custom modal):
```tsx
function CheckoutFlow() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>Checkout</button>
      
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'white',
            zIndex: 1000,
          }}
        >
          <button onClick={() => setIsOpen(false)}>Close</button>
          <CheckoutSteps />
        </div>
      )}
    </>
  );
}
```

**After** (DS FullScreenRoute):
```tsx
import { FullScreenRoute } from '@intstudio/ds/routes';
import { Routes, Route } from 'react-router';

function App() {
  return (
    <Routes>
      <Route path="/checkout" element={
        <FullScreenRoute ariaLabel="Checkout">
          <CheckoutSteps />
        </FullScreenRoute>
      } />
    </Routes>
  );
}
```

**Benefits**:
- ✅ True routing (browser back works)
- ✅ Focus trap + return focus
- ✅ Unsaved changes guard
- ✅ Deep linkable
- ✅ SSR-safe

---

### **Pattern 3: Multi-step Wizard → FlowScaffold**

**Before** (Custom stepper):
```tsx
function CreateProject() {
  const [step, setStep] = useState(1);
  
  return (
    <div>
      <div>Step {step} of 3</div>
      
      {step === 1 && <NameStep onNext={() => setStep(2)} />}
      {step === 2 && <DetailsStep onNext={() => setStep(3)} />}
      {step === 3 && <InviteStep />}
      
      <button onClick={() => setStep(step - 1)}>Back</button>
      <button onClick={() => setStep(step + 1)}>Next</button>
    </div>
  );
}
```

**After** (DS FlowScaffold):
```tsx
import { FlowScaffold, useSubFlow } from '@intstudio/ds/routes';

function CreateProject() {
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

**Benefits**:
- ✅ URL-bound steps (?step=name)
- ✅ Browser back/forward works
- ✅ Progress announcements (a11y)
- ✅ Deep linkable
- ✅ Debounced URL updates

---

### **Pattern 4: Options Menu → Option + SimpleListRecipe**

**Before** (Custom select):
```tsx
function TagSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  
  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        Select tags
      </button>
      
      {isOpen && (
        <div style={{ position: 'absolute', background: 'white' }}>
          {tags.map(tag => (
            <div
              key={tag}
              onClick={() => setSelected([...selected, tag])}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**After** (DS primitives):
```tsx
import { Option } from '@intstudio/ds/primitives';
import { SheetDialog } from '@intstudio/ds/overlay';

function TagSelect() {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState([]);
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        Select tags
      </button>
      
      {isOpen && (
        <SheetDialog
          title="Select tags"
          onClose={() => setIsOpen(false)}
        >
          {tags.map(tag => (
            <Option
              key={tag}
              label={tag}
              value={tag}
              selected={selected.includes(tag)}
              onSelect={() => setSelected([...selected, tag])}
            />
          ))}
        </SheetDialog>
      )}
    </>
  );
}
```

**Benefits**:
- ✅ Touch target enforced (44px)
- ✅ Keyboard navigation
- ✅ ARIA roles
- ✅ Consistent styling

---

## 🚀 Migration Checklist

### **Step 1: Audit Current Usage**

```bash
# Find ad-hoc modals
grep -r "position: fixed" src/

# Find custom drawers
grep -r "z-index.*[0-9]" src/

# Find multi-step wizards
grep -r "step.*useState" src/
```

### **Step 2: Prioritize by Impact**

**High Priority**:
- Checkout flows → FullScreenRoute + FlowScaffold
- Filters/settings → RoutePanel
- Onboarding → FullScreenRoute + FlowScaffold

**Medium Priority**:
- Multi-step forms → FlowScaffold
- Option pickers → SheetDialog + Option

**Low Priority**:
- Simple confirmations (keep as is, or use SheetDialog)

### **Step 3: Migrate One at a Time**

1. **Create feature branch**: `git checkout -b migrate-checkout-to-ds-routes`
2. **Replace component** (see patterns above)
3. **Add tests**: E2E for new flow
4. **Update docs**: Document new pattern
5. **Review & merge**

### **Step 4: Validate**

```bash
# Run E2E tests
pnpm test:e2e

# Check accessibility
pnpm axe

# Visual regression
pnpm chromatic
```

---

## 📊 Migration Progress Template

Create a tracking doc:

```markdown
# DS Route Migration Progress

## ✅ Completed
- [x] Checkout flow → FullScreenRoute + FlowScaffold
- [x] Product filters → RoutePanel

## 🚧 In Progress
- [ ] Onboarding wizard → FlowScaffold

## 📋 Backlog
- [ ] Tag selection → SheetDialog + Option
- [ ] Advanced search → AsyncSearchSelect
- [ ] Settings panel → RoutePanel
```

---

## 🔧 Troubleshooting

### **Issue: "My modal has custom behavior"**

**Solution**: Extract to custom hook
```tsx
function useCheckoutGuard() {
  const hasUnsavedChanges = useFormDirty();
  
  return async () => {
    if (hasUnsavedChanges) {
      return window.confirm('Discard changes?');
    }
    return true;
  };
}

function Checkout() {
  const onBeforeExit = useCheckoutGuard();
  
  return (
    <FullScreenRoute ariaLabel="Checkout" onBeforeExit={onBeforeExit}>
      ...
    </FullScreenRoute>
  );
}
```

### **Issue: "Need custom styling"**

**Solution**: Use CSS override vars
```tsx
<RoutePanel
  ariaLabel="Filters"
  style={{
    '--ds-route-panel-width': '36rem',
    '--ds-route-panel-padding': 'var(--ds-space-6)',
  } as React.CSSProperties}
>
  ...
</RoutePanel>
```

### **Issue: "Depth limit hit (> 2 sheets)"**

**Solution**: Use escalation policy
```tsx
const policy = useOverlayPolicy({
  depth: currentDepth,
  onCloseAll: closeAllSheets,
});

function handleOpenSheet() {
  // Auto-escalate to route if depth ≥ 2
  if (policy.maybeEscalate('/create?step=1')) {
    return;
  }
  
  openSheet({ ... });
}
```

---

## 📚 Additional Resources

- **CONTRIBUTING.md** - Component-local styling patterns
- **CSS_OVERRIDE_VARS.md** - Safe customization points
- **WEEK_2_IMPLEMENTATION.md** - Component specs
- **Storybook** - Live examples for all components

---

## ✅ Definition of Done

**Migration is complete when**:
- [x] Component uses DS primitive/route
- [x] E2E tests pass
- [x] Axe scan passes
- [x] Visual regression approved
- [x] Documentation updated
- [x] Old code removed

---

**Ready to migrate? Start with one high-impact flow and validate the pattern!**
