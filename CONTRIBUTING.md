# Contributing to Forms Studio

**Core Principle**: Component-local CSS + behavior hooks = predictable, accessible, maintainable primitives.

---

## 📐 Component-Local Styling Pattern

### **Structure**

Every DS component co-locates its styles:

```
/packages/ds/src/primitives/overlay/
  Option.tsx
  Option.css          ← DS tokens only
  useOptionKeyboard.ts ← Behavior hook
  index.ts

/packages/ds/src/routes/FullScreenRoute/
  FullScreenRoute.tsx
  FullScreenRoute.css
  index.ts
```

### **Rules (Enforced by ESLint/Stylelint)**

#### **1. DS Tokens Only**

```css
/* ✅ Good */
.ds-route-panel {
  padding: var(--ds-space-4);
  background: var(--ds-color-surface-base);
  border-radius: var(--ds-radius-6);
  box-shadow: var(--ds-shadow-layer-2);
  z-index: var(--ds-z-lane-panel);
}

/* ❌ Bad - magic numbers */
.ds-route-panel {
  padding: 16px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 100;
}
```

#### **2. No Inline Appearance**

```tsx
/* ❌ Bad */
<div style={{ padding: '16px', margin: '8px' }}>

/* ✅ Good - use CSS classes */
<div className="ds-route-panel__content">

/* ✅ OK for programmatic spacing (rare) */
<div style={{ paddingInlineStart: `var(--ds-space-${level})` }}>
```

#### **3. Prefix Classes (BEM-ish)**

```css
.ds-route-panel { }
.ds-route-panel__header { }
.ds-route-panel__content { }
.ds-route-panel__footer { }
.ds-route-panel--position-left { }
```

**Pattern**: `.ds-{component}` → `.ds-{component}__{part}` → `.ds-{component}--{modifier}`

#### **4. Lock Minimums (Shape Guarantees)**

```css
.ds-option-button {
  /* Guarantee touch target */
  min-block-size: var(--ds-touch-target); /* 44px */
  min-inline-size: var(--ds-touch-target);
  
  /* Standard spacing */
  padding: var(--ds-space-3) var(--ds-space-4);
  
  /* Shape */
  border-radius: var(--ds-radius-6);
  
  /* State scrims via tokens */
  background: transparent;
}

.ds-option-button:hover {
  background: var(--ds-color-surface-hover);
}

.ds-option-button[aria-selected="true"] {
  background: var(--ds-color-surface-selected);
}
```

#### **5. Logical Properties**

```css
/* ✅ Use logical properties for RTL support */
.ds-panel {
  inset-inline-end: 0;
  padding-inline: var(--ds-space-4);
  border-inline-start: 1px solid;
}

/* ❌ Avoid physical properties */
.ds-panel {
  right: 0;
  padding-left: 16px;
  border-left: 1px solid;
}
```

#### **6. Reduced Motion**

```css
.ds-route-panel {
  transition: transform 0.3s ease;
}

@media (prefers-reduced-motion: reduce) {
  .ds-route-panel {
    transition: none;
  }
}
```

---

## 🧠 Behavior Hooks Pattern

### **Keep Behavior in Hooks**

```tsx
// ✅ Good - behavior isolated, testable, reusable
export function useFocusTrap(ref, options) {
  useEffect(() => {
    // focus trap logic
  }, [options.enabled]);
}

// Component uses it
function Dialog() {
  const ref = useRef();
  useFocusTrap(ref, { enabled: isOpen });
  return <div ref={ref}>...</div>;
}
```

### **Hook Guidelines**

1. **SSR Safe**: Guard all browser APIs
   ```ts
   const prefersReducedMotion = 
     typeof window !== 'undefined' 
       ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
       : false;
   ```

2. **Single Responsibility**: One behavior per hook
   - `useFocusTrap` - keyboard navigation
   - `useReducedMotion` - motion preference
   - `useSubFlow` - step management

3. **Platform-level Only**: No business logic in DS hooks
   - ✅ `useFocusTrap`, `useReducedMotion`, `useTelemetry`
   - ❌ `useOrderSubmit`, `useCartTotal`

---

## 🔏 ARIA Contracts (Required)

### **Component Requirements**

**FullScreenRoute**:
- ✅ Requires `ariaLabel` or `ariaLabelledBy`
- ✅ Always sets `role="dialog"` + `aria-modal="true"`
- ✅ Focus trap + return focus
- ✅ ESLint: `routes/require-aria-label`

**RoutePanel**:
- ✅ Requires `ariaLabel`
- ✅ Non-modal: `role="complementary"`
- ✅ No global inert/scroll-lock
- ✅ Esc closes, returns focus

**FlowScaffold**:
- ✅ Progress in `aria-live="polite"`
- ✅ Title with `aria-labelledby`
- ✅ Does NOT trap focus

### **Runtime Validation (Dev Only)**

```tsx
if (process.env.NODE_ENV !== 'production') {
  if (!ariaLabel && !ariaLabelledBy) {
    throw new Error(
      '[FullScreenRoute] ariaLabel or ariaLabelledBy required'
    );
  }
}
```

---

## 🎛️ Safe Override API (CSS Custom Properties)

### **Expose Customization Points**

```css
/* RoutePanel.css */
.ds-route-panel {
  /* Expose vars with defaults */
  inline-size: var(--ds-route-panel-width, 28rem);
  background: var(--ds-route-panel-bg, var(--ds-color-surface-base));
}
```

### **Consumer Usage**

```tsx
/* App-level override */
<RoutePanel
  style={{
    '--ds-route-panel-width': '32rem',
  } as React.CSSProperties}
>
  ...
</RoutePanel>
```

### **Document Supported Vars**

```ts
// RoutePanel.tsx
/**
 * CSS Custom Properties:
 * - `--ds-route-panel-width`: Panel width (default: 28rem)
 * - `--ds-route-panel-bg`: Background color (default: surface-base)
 */
```

**Rule**: Only expose vars that are **safe** to override (don't break a11y/shape)

---

## 🧪 Testing Standards

### **1. E2E Tests (Playwright)**

```ts
// Every component must have:
test('has correct ARIA attributes', async ({ page }) => {
  await expect(dialog).toHaveAttribute('role', 'dialog');
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
});

test('focus trap works', async ({ page }) => {
  await page.keyboard.press('Tab');
  // ... assert focus cycles
});

test('respects reduced motion', async ({ page, context }) => {
  await context.addInitScript(() => {
    Object.defineProperty(window, 'matchMedia', { /* ... */ });
  });
  // ... assert no animation
});
```

### **2. CSS Shape Snapshot Tests (Jest)**

```ts
// Validate token usage
test('button meets touch target minimum', () => {
  const button = render(<OptionButton />);
  const styles = window.getComputedStyle(button);
  
  expect(styles.minHeight).toBe('44px'); // --ds-touch-target
  expect(styles.borderRadius).toBe('8px'); // --ds-radius-6
});
```

### **3. Visual Regression (Storybook + Chromatic)**

```tsx
// Story for each state
export const Open = () => <RoutePanel ariaLabel="Filters">...</RoutePanel>;
export const Closed = () => <div>Panel closed</div>;
export const ReducedMotion = () => {
  // Toggle prefers-reduced-motion
};
```

---

## 📦 Packaging & Exports

### **Barrel Exports**

```ts
// packages/ds/src/routes/index.ts
export { FullScreenRoute } from './FullScreenRoute';
export type { FullScreenRouteProps } from './FullScreenRoute';

export { FlowScaffold, useSubFlow } from './FlowScaffold';
export type { FlowScaffoldProps, SubFlowState } from './FlowScaffold';

export { RoutePanel } from './RoutePanel';
export type { RoutePanelProps } from './RoutePanel';
```

### **Consumer Imports**

```tsx
import { FullScreenRoute, FlowScaffold } from '@intstudio/ds/routes';
import type { FullScreenRouteProps } from '@intstudio/ds/routes';
```

### **Tree-Shaking Validation**

```bash
# CI checks bundle size
pnpm build
pnpm analyze

# Unused components should not inflate bundle
```

---

## 🚦 Definition of Done Checklist

**Before shipping a new DS component**:

- [ ] **Structure**
  - [ ] Component co-locates `.css` file
  - [ ] Behavior in `use*` hook
  - [ ] Barrel export in `index.ts`

- [ ] **Styling**
  - [ ] DS tokens only (no magic numbers)
  - [ ] BEM-ish class prefixes (`.ds-{component}__*`)
  - [ ] Lock minimums for shape guarantees
  - [ ] Logical properties for RTL
  - [ ] Reduced motion support

- [ ] **Accessibility**
  - [ ] Required ARIA attributes
  - [ ] Focus management (trap/return)
  - [ ] Keyboard navigation
  - [ ] Screen reader announcements

- [ ] **Testing**
  - [ ] Playwright E2E (focus, keyboard, a11y)
  - [ ] CSS shape snapshot tests
  - [ ] Visual regression (Storybook)

- [ ] **Guardrails**
  - [ ] ESLint rule enforces contracts
  - [ ] Runtime validation (dev mode)
  - [ ] TypeScript prevents misuse

- [ ] **Documentation**
  - [ ] JSDoc with examples
  - [ ] Supported CSS vars documented
  - [ ] Usage patterns in Storybook

---

## 🎯 Quick Reference

### **Add New Component**

1. Create folder: `/packages/ds/src/{domain}/{ComponentName}/`
2. Create files:
   - `ComponentName.tsx` - component shell
   - `ComponentName.css` - DS tokens only
   - `useComponentBehavior.ts` - behavior hook (if needed)
   - `index.ts` - barrel export
3. Add tests: `/packages/ds/tests/{domain}/component-name.spec.ts`
4. Add ESLint rule (if new pattern)
5. Document in Storybook

### **Modify Existing Component**

1. Check if change touches >3 files → extract to token/primitive
2. Run `pnpm test` before/after
3. Update E2E tests if behavior changed
4. Update docs if API changed

### **Debug Component**

1. Use console script FIRST (never guess)
2. Check `debugX()` helper output
3. Verify `data-*` attributes
4. Run E2E test in headed mode: `pnpm playwright test --headed`

---

**Remember**: Component-local CSS + behavior hooks = predictable primitives. Keep them small, tested, and token-based!
