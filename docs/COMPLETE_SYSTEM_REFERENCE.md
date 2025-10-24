# Complete System Reference - DS Route Navigation

**Version**: 2.0.0  
**Status**: ✅ Production Ready  
**Architecture**: Component-local CSS + Behavior Hooks

---

## 🎯 Quick Reference

### **When to Use What**

| Use Case | Component | Depth/Modal | URL-Bound |
|----------|-----------|-------------|-----------|
| Quick task | `SheetDialog` | Modal, ≤2 | No |
| Context peek | `SheetPanel` | Non-modal | Yes |
| Multi-step (in-page) | `FlowScaffold` | N/A | Yes |
| Focused task | `FullScreenRoute` | Modal | Yes |
| Desktop filters | `RoutePanel` | Non-modal | Yes |

### **Component Matrix**

```
Mobile                Desktop
──────                ───────
SheetDialog    ←→    Popover (via ResponsiveOverlay)
SheetPanel     ←→    RoutePanel (docked)
FlowScaffold   ←→    FlowScaffold (same)
FullScreenRoute ←→    FullScreenRoute (same)
```

---

## 📦 Component Contracts

### **FullScreenRoute**

**Shape** (via CSS):
```css
.ds-fullscreen-route {
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-lane-modal);
  background: var(--ds-color-surface-base);
  display: grid;
  grid-template-rows: auto 1fr auto;
}
```

**Behavior** (via hooks):
- Focus trap (`useFocusTrap`)
- Return focus on unmount
- Esc → navigate back
- Guard unsaved changes

**Required Props**:
- `ariaLabel` (or `ariaLabelledBy`)

**Optional Props**:
- `onBeforeExit` - guard function
- `returnFocusTo` - specific element
- `className` - additional classes

**Safe Overrides**:
- `--ds-fullscreen-bg`
- `--ds-fullscreen-padding`

**Protected Values**:
- z-index, position, display, grid layout

---

### **FlowScaffold + useSubFlow**

**Shape** (via CSS):
```css
.ds-flow {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100%;
}

.ds-flow__header {
  position: sticky;
  top: 0;
  padding: var(--ds-space-4);
  gap: var(--ds-space-3);
}
```

**Behavior** (via hooks):
- URL-bound steps (`useSubFlow`)
- Debounced updates (150ms)
- Browser back/forward
- Progress announcements

**Required Props**:
- `title` - flow title
- `step` - current step (1-indexed)
- `total` - total steps

**Optional Props**:
- `onBack` - back handler
- `footer` - footer content
- `className`

**useSubFlow API**:
```ts
const flow = useSubFlow(['name', 'details', 'invite']);

flow.current   // 'name' | 'details' | 'invite'
flow.index     // 0 | 1 | 2
flow.go('details')
flow.next      // next step or undefined
flow.prev      // prev step or undefined
flow.isFirst   // boolean
flow.isLast    // boolean
```

---

### **RoutePanel**

**Shape** (via CSS):
```css
.ds-route-panel {
  position: fixed;
  inset-block-start: 0;
  inset-block-end: 0;
  inline-size: min(28rem, 90vw);
  z-index: var(--ds-z-lane-panel);
  background: var(--ds-color-surface-base);
}
```

**Behavior**:
- Non-modal (background interactive)
- Focus on mount (screen reader)
- Return focus on unmount
- Esc closes

**Required Props**:
- `ariaLabel`

**Optional Props**:
- `title` - panel title
- `showClose` - show close button
- `onClose` - custom close handler
- `position` - 'left' | 'right'
- `className`

**Safe Overrides**:
- `--ds-route-panel-width`
- `--ds-route-panel-bg`
- `--ds-route-panel-padding`

**Protected Values**:
- z-index, position, role

---

## 🧠 Behavior Hooks

### **useFocusTrap**

```ts
const ref = useRef<HTMLElement>(null);
useFocusTrap(ref, { enabled: isOpen, autoFocus: true });
```

**Features**:
- Tab cycling (forward/backward)
- Auto-focus first element
- Respects `prefers-reduced-motion`
- SSR-safe

---

### **useSubFlow**

```ts
const flow = useSubFlow(
  ['name', 'details', 'invite'],
  {
    initial: 'name',
    paramKey: 'step',
    replace: false,
  }
);
```

**Features**:
- URL-bound (?step=)
- Debounced (150ms)
- Browser back/forward
- Invalid step warnings (dev)
- TypeScript typed

---

### **useOverlayPolicy**

```ts
const policy = useOverlayPolicy({
  depth: currentDepth,
  maxDepth: 2,
  onCloseAll: closeAllSheets,
});

if (policy.maybeEscalate('/create?step=1', { reason: 'depth limit' })) {
  return; // Escalated to route
}
```

**Features**:
- Auto-escalate at depth ≥ 2
- Closes sheets before navigation
- Preserves "from" URL
- Depth status tracking

---

### **useTelemetry**

```ts
const telemetry = useTelemetry(analytics.track);

telemetry.emit({
  event: 'sheet_escalate',
  fromDepth: 2,
  target: '/create',
});

const stop = telemetry.startTiming('route:checkout');
// ... later
const durationMs = stop();
```

**Events**:
- `sheet_escalate`, `sheet_open`, `sheet_close`
- `subflow_step`, `route_open`, `route_close`

---

## 🎨 CSS Token Reference

### **Spacing**
- `--ds-space-3` (12px)
- `--ds-space-4` (16px)
- `--ds-space-5` (20px)
- `--ds-touch-target` (44px)

### **Colors**
- `--ds-color-surface-base`
- `--ds-color-surface-hover`
- `--ds-color-text`
- `--ds-color-border-subtle`

### **Layout**
- `--ds-radius-6` (8px)
- `--ds-radius-lg` (12px)
- `--ds-radius-full` (9999px)
- `--ds-shadow-layer-2`

### **Z-Index**
- `--ds-z-lane-panel` (50)
- `--ds-z-lane-modal` (100)
- `--ds-z-lane-toast` (200)

---

## 🧪 Testing Patterns

### **E2E (Playwright)**

```ts
test('FullScreenRoute traps focus', async ({ page }) => {
  await page.click('[data-testid="open"]');
  
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeFocused();
  
  await page.keyboard.press('Tab');
  // ... assert focus cycles
});
```

### **Shape Contracts (Jest)**

```ts
test('button enforces touch target', () => {
  const button = render(<button className="ds-button" />);
  const height = parseFloat(getComputedStyle(button).minHeight);
  
  expect(height).toBeGreaterThanOrEqual(44);
});
```

### **Accessibility (axe)**

```ts
test('passes axe scan', async () => {
  const { container } = render(<RoutePanel ariaLabel="Test">...</RoutePanel>);
  const results = await axe(container);
  
  expect(results).toHaveNoViolations();
});
```

---

## 📋 ESLint Rules

### **sheet-no-panel-on-dialog**

```tsx
// ❌ Error
<SheetDialog>
  <SheetPanel /> {/* Cannot open panel on modal */}
</SheetDialog>

// ✅ OK
<SheetDialog>
  <SheetDialog /> {/* Nested modal OK */}
</SheetDialog>
```

### **routes-require-aria-label**

```tsx
// ❌ Error
<FullScreenRoute>...</FullScreenRoute>

// ✅ Required
<FullScreenRoute ariaLabel="Checkout">...</FullScreenRoute>
```

---

## 🚀 Migration Recipes

### **Drawer → RoutePanel**

```tsx
// Before
<div style={{ position: 'fixed', right: 0 }}>...</div>

// After
<RoutePanel ariaLabel="Filters">...</RoutePanel>
```

### **Modal → FullScreenRoute**

```tsx
// Before
{isOpen && <div style={{ position: 'fixed', inset: 0 }}>...</div>}

// After
<Route path="/checkout" element={
  <FullScreenRoute ariaLabel="Checkout">...</FullScreenRoute>
} />
```

### **Wizard → FlowScaffold**

```tsx
// Before
const [step, setStep] = useState(1);

// After
const flow = useSubFlow(['name', 'details', 'invite']);

<FlowScaffold step={flow.index + 1} total={3}>
  {flow.current === 'name' && <NameStep />}
</FlowScaffold>
```

---

## 📊 Bundle Sizes

| Component | CSS | JS | Total |
|-----------|-----|----|----|------|
| FullScreenRoute | 2KB | 3KB | 5KB |
| FlowScaffold | 3KB | 2KB | 5KB |
| RoutePanel | 2KB | 2KB | 4KB |
| **Total** | **7KB** | **7KB** | **14KB** |

*Gzipped sizes, tree-shakeable*

---

## ✅ Quality Checklist

**Per Component**:
- [x] Co-located CSS (tokens only)
- [x] Behavior hooks (SSR-safe)
- [x] ARIA contracts enforced
- [x] E2E tests (focus, keyboard, a11y)
- [x] Shape snapshots (CSS contracts)
- [x] ESLint rules
- [x] Documentation
- [x] Storybook examples

---

## 🎯 Success Metrics

- **Components**: 3 route + 4 hooks
- **Tests**: 40 E2E + shape contracts + a11y
- **Coverage**: Focus, keyboard, ARIA, motion, responsive, RTL
- **Documentation**: 8 comprehensive guides
- **Guardrails**: 2 ESLint rules + runtime validation
- **Bundle Size**: 14KB total (gzipped, tree-shakeable)

---

## 📚 Reference Docs

1. **CONTRIBUTING.md** - Component patterns
2. **CSS_OVERRIDE_VARS.md** - Customization
3. **ADOPTION_GUIDE.md** - Migration recipes
4. **WEEK_2_3_FINAL_STATUS.md** - Implementation summary
5. **PRODUCTION_SHIP_CHECKLIST.md** - Ship readiness

---

**Status: Production-ready navigation system with complete testing, documentation, and guardrails.** 🚀
