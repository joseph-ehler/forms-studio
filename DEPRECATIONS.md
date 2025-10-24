# Deprecations & Migration Guide

**Active deprecations and migration paths to DS primitives**

---

## 🚨 Deprecated Patterns

### **Ad-hoc Modal/Drawer Components**

**Status**: ⛔ Deprecated (v2.0.0)  
**Remove by**: v3.0.0

#### **What's Deprecated**

Custom modal/drawer implementations using:
- `position: fixed` + manual z-index
- Custom scroll-lock logic
- Manual focus trapping
- Inline styles for positioning

#### **Migration Path**

Replace with DS route components:

```tsx
// ❌ DEPRECATED - Custom drawer
<div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '320px', zIndex: 100 }}>
  <button onClick={onClose}>Close</button>
  <FilterForm />
</div>

// ✅ MIGRATE TO - RoutePanel
import { RoutePanel } from '@intstudio/ds/routes';

<RoutePanel ariaLabel="Filters" position="right" onClose={onClose}>
  <FilterForm />
</RoutePanel>
```

**Codemod**: `pnpm codemod migrate-to-route-panel`

---

### **Custom Focus Management**

**Status**: ⛔ Deprecated (v2.0.0)  
**Remove by**: v3.0.0

#### **What's Deprecated**

Manual focus trapping:
- `addEventListener('keydown', handleTab)`
- Custom focus loop logic
- Manual `querySelector` for focusable elements

#### **Migration Path**

Use `useFocusTrap` hook:

```tsx
// ❌ DEPRECATED - Custom focus trap
useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      // ... custom trap logic
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, []);

// ✅ MIGRATE TO - useFocusTrap
import { useFocusTrap } from '@intstudio/ds/hooks';

const ref = useRef();
useFocusTrap(ref, { active: isOpen });

return <div ref={ref}>...</div>;
```

---

### **Inline Appearance Styles**

**Status**: ⛔ Deprecated (v2.0.0)  
**Blocked by**: ESLint `no-inline-appearance` rule

#### **What's Deprecated**

Appearance properties in inline styles:
- `padding`, `margin`, `gap`
- `background`, `color`, `border`
- `fontSize`, `fontWeight`
- `width`, `height` (use CSS classes)

#### **Migration Path**

Use DS classes and tokens:

```tsx
// ❌ DEPRECATED - Inline appearance
<button style={{ 
  padding: '12px 16px',
  background: '#0066cc',
  borderRadius: '8px',
  fontSize: '14px'
}}>
  Click me
</button>

// ✅ MIGRATE TO - DS classes
<button className="ds-button ds-button--primary">
  Click me
</button>
```

**ESLint**: Will error on commit (auto-fixable in some cases)

---

### **Magic Numbers in CSS**

**Status**: ⛔ Deprecated (v2.0.0)  
**Blocked by**: Stylelint token enforcement

#### **What's Deprecated**

Hard-coded CSS values:
- Pixel values: `16px`, `24px`
- Hex colors: `#ffffff`, `#000`
- Z-index numbers: `100`, `1000`

#### **Migration Path**

Use DS tokens:

```css
/* ❌ DEPRECATED - Magic numbers */
.my-component {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  z-index: 100;
}

/* ✅ MIGRATE TO - DS tokens */
.ds-my-component {
  padding: var(--ds-space-4);
  background: var(--ds-color-surface-base);
  border-radius: var(--ds-radius-6);
  z-index: var(--ds-z-lane-modal);
}
```

**Stylelint**: Will error on commit

---

### **Forms Layer CSS Files**

**Status**: ⛔ Deprecated (v2.0.0)  
**Remove by**: v3.0.0

#### **What's Deprecated**

Any `.css` files in `packages/forms`:
- Field-specific stylesheets
- Recipe stylesheets
- Layout stylesheets

#### **Migration Path**

Move to DS or remove:

```bash
# ❌ DEPRECATED
packages/forms/src/fields/MyField.css

# ✅ MIGRATE TO
packages/ds/src/primitives/my-primitive/MyPrimitive.css  # If reusable
# OR
# Delete and use DS classes only
```

**Audit**: `pnpm audit:architecture` will flag violations

---

### **Custom Multi-Step Logic**

**Status**: ⛔ Deprecated (v2.0.0)  
**Remove by**: v3.0.0

#### **What's Deprecated**

Manual step/wizard management:
- `useState` for current step
- Custom back/next handlers
- Manual URL synchronization

#### **Migration Path**

Use `FlowScaffold` + `useSubFlow`:

```tsx
// ❌ DEPRECATED - Custom stepper
const [step, setStep] = useState(1);

return (
  <div>
    <div>Step {step} of 3</div>
    {step === 1 && <Step1 onNext={() => setStep(2)} />}
    {step === 2 && <Step2 onNext={() => setStep(3)} />}
  </div>
);

// ✅ MIGRATE TO - FlowScaffold + useSubFlow
import { FlowScaffold, useSubFlow } from '@intstudio/ds/routes';

const steps = ['details', 'review', 'confirm'] as const;
const flow = useSubFlow(steps);

return (
  <FlowScaffold
    title="Setup"
    step={flow.index + 1}
    total={flow.total}
    onBack={flow.prev ? () => flow.go(flow.prev) : undefined}
  >
    {flow.current === 'details' && <DetailsStep />}
    {flow.current === 'review' && <ReviewStep />}
    {flow.current === 'confirm' && <ConfirmStep />}
  </FlowScaffold>
);
```

**Benefits**: URL-bound, browser back/forward, deep-linkable

---

### **Deep Sheet Stacking (>2)**

**Status**: ⛔ Deprecated (v2.0.0)  
**Blocked by**: `useOverlayPolicy` enforcement

#### **What's Deprecated**

Opening sheets beyond depth 2:
- Sheet → Sheet → Sheet (3 levels)
- Manual depth tracking

#### **Migration Path**

Use escalation policy:

```tsx
// ❌ DEPRECATED - Deep stacking
<SheetDialog>
  <SheetDialog>
    <SheetDialog> {/* TOO DEEP */}
      ...
    </SheetDialog>
  </SheetDialog>
</SheetDialog>

// ✅ MIGRATE TO - Auto-escalation
import { useOverlayPolicy } from '@intstudio/ds/hooks';

const policy = useOverlayPolicy({
  depth: currentDepth,
  maxDepth: 2,
  onCloseAll: closeAllSheets,
});

function handleDeepAction() {
  if (policy.maybeEscalate('/task/create?step=1')) {
    return; // Escalated to FullScreenRoute
  }
  // Open sheet (depth OK)
  openSheet();
}
```

**Runtime**: Dev warnings when depth > 2

---

## 📦 Migration Tools

### **Audit Current State**

```bash
# Run architecture audit
pnpm audit:architecture

# Get JSON report
pnpm audit:architecture --json > audit.json
```

### **Automated Codemods**

```bash
# Add missing ariaLabel (dry-run first)
pnpm codemod add-aria-label --dry-run
pnpm codemod add-aria-label

# Migrate drawers to RoutePanel
pnpm codemod migrate-to-route-panel --dry-run
pnpm codemod migrate-to-route-panel
```

### **ESLint Auto-Fix**

```bash
# Fix auto-fixable issues
pnpm lint --fix

# Check what would be fixed
pnpm lint --fix-dry-run
```

---

## 🗓️ Deprecation Timeline

| Pattern | Deprecated | Warnings Added | Hard Error | Removed |
|---------|-----------|----------------|------------|---------|
| Ad-hoc modals | v2.0.0 | v2.0.0 | v2.5.0 | v3.0.0 |
| Custom focus | v2.0.0 | v2.0.0 | v2.5.0 | v3.0.0 |
| Inline appearance | v2.0.0 | v2.0.0 (ESLint) | v2.0.0 | N/A |
| Magic numbers | v2.0.0 | v2.0.0 (Stylelint) | v2.0.0 | N/A |
| Forms CSS | v2.0.0 | v2.0.0 | v2.5.0 | v3.0.0 |
| Custom steppers | v2.0.0 | v2.1.0 | v2.5.0 | v3.0.0 |
| Deep sheets | v2.0.0 | v2.0.0 (runtime) | v2.5.0 | v3.0.0 |

---

## ✅ Migration Checklist

**Per deprecated pattern**:

- [ ] Run audit to find occurrences
- [ ] Run codemod (if available)
- [ ] Manual fixes for edge cases
- [ ] Update tests
- [ ] Verify with lint/build
- [ ] Deploy to staging
- [ ] Monitor for issues
- [ ] Deploy to production

---

## 🆘 Need Help?

**Migration blocked?** Check:
1. `.cascade/COMPONENT_WORK_PROTOCOL.md` - Architecture pattern
2. `docs/ADOPTION_GUIDE.md` - Migration recipes
3. `docs/COMPLETE_SYSTEM_REFERENCE.md` - API reference
4. Open issue with `migration` label

---

**Last updated**: Oct 24, 2025  
**Next review**: v2.5.0 release
