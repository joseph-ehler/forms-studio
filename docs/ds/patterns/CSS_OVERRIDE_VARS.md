# CSS Override Vars Pattern

**Safe, token-based customization for DS components**

---

## 🎯 Philosophy

DS components own their shape and behavior, but expose **safe customization points** via CSS Custom Properties (vars).

**Key Principle**: Only expose vars that don't break accessibility or core behavior.

---

## ✅ Good Override Candidates

### **Layout Dimensions**
```css
.ds-route-panel {
  inline-size: var(--ds-route-panel-width, 28rem);
  max-block-size: var(--ds-route-panel-max-height, 90vh);
}
```

### **Spacing (Within Reason)**
```css
.ds-route-panel__content {
  padding: var(--ds-route-panel-padding, var(--ds-space-4));
  gap: var(--ds-route-panel-gap, var(--ds-space-3));
}
```

### **Colors (Surface/Background)**
```css
.ds-route-panel {
  background: var(--ds-route-panel-bg, var(--ds-color-surface-base));
  border-color: var(--ds-route-panel-border, var(--ds-color-border-subtle));
}
```

---

## ❌ Bad Override Candidates

### **Touch Targets** (Accessibility)
```css
/* ❌ Don't expose - breaks a11y */
.ds-button {
  min-block-size: var(--ds-button-min-height, var(--ds-touch-target));
}
```

### **Focus Indicators** (Accessibility)
```css
/* ❌ Don't expose - required for keyboard users */
.ds-button:focus-visible {
  outline: var(--ds-button-outline, 2px solid currentColor);
}
```

### **Z-Index** (Stacking Context)
```css
/* ❌ Don't expose - breaks overlay system */
.ds-overlay {
  z-index: var(--ds-overlay-z, var(--ds-z-lane-modal));
}
```

---

## 📖 Usage Pattern

### **1. Define Vars in Component CSS**

```css
/* packages/ds/src/routes/RoutePanel/RoutePanel.css */

.ds-route-panel {
  /* Expose with fallback to DS token */
  inline-size: var(--ds-route-panel-width, 28rem);
  background: var(--ds-route-panel-bg, var(--ds-color-surface-base));
  
  /* Don't expose (required for behavior) */
  position: fixed; /* NOT customizable */
  z-index: var(--ds-z-lane-panel); /* NOT customizable */
}
```

### **2. Document Supported Vars**

```tsx
/**
 * RoutePanel - Desktop persistent panel
 * 
 * @example
 * <RoutePanel ariaLabel="Filters">
 *   <FilterForm />
 * </RoutePanel>
 * 
 * CSS Custom Properties:
 * - `--ds-route-panel-width`: Panel width (default: 28rem)
 * - `--ds-route-panel-bg`: Background color (default: surface-base)
 * - `--ds-route-panel-padding`: Content padding (default: space-4)
 */
export const RoutePanel: FC<RoutePanelProps> = ({ ... }) => {
  // ...
};
```

### **3. Consumer Usage**

```tsx
import { RoutePanel } from '@intstudio/ds/routes';

function MyPage() {
  return (
    <RoutePanel
      ariaLabel="Advanced filters"
      style={{
        '--ds-route-panel-width': '32rem',
        '--ds-route-panel-padding': 'var(--ds-space-6)',
      } as React.CSSProperties}
    >
      <FilterForm />
    </RoutePanel>
  );
}
```

### **4. Global Theme Overrides**

```css
/* app/theme.css */

:root {
  /* Override default panel width for entire app */
  --ds-route-panel-width: 36rem;
  
  /* Dark mode adjustments */
  [data-theme="dark"] {
    --ds-route-panel-bg: var(--ds-color-surface-elevated);
  }
}
```

---

## 🧪 Testing Override Vars

```ts
// Test that vars work as expected
test('respects custom width var', () => {
  const { container } = render(
    <RoutePanel
      ariaLabel="Test"
      style={{ '--ds-route-panel-width': '40rem' } as any}
    >
      Content
    </RoutePanel>
  );
  
  const panel = container.querySelector('.ds-route-panel');
  const styles = window.getComputedStyle(panel);
  
  expect(styles.width).toBe('40rem');
});

// Test that critical values are NOT overridable
test('cannot override z-index via var', () => {
  const { container } = render(
    <RoutePanel
      ariaLabel="Test"
      style={{ '--ds-z-lane-panel': '1' } as any}
    >
      Content
    </RoutePanel>
  );
  
  const panel = container.querySelector('.ds-route-panel');
  const styles = window.getComputedStyle(panel);
  
  // Should use token, not override
  expect(styles.zIndex).toBe('100'); // DS token value
});
```

---

## 📋 Checklist: Adding New Override Var

Before exposing a new CSS var:

- [ ] **Safe?** - Won't break a11y or core behavior?
- [ ] **Needed?** - Is there a real use case?
- [ ] **Fallback** - Has DS token default?
- [ ] **Documented** - In component JSDoc?
- [ ] **Tested** - Override works as expected?
- [ ] **Bounded** - Can't be set to invalid value?

**If any answer is NO, don't expose the var.**

---

## 🎨 Example: Full Component

```css
/* FullScreenRoute.css */

.ds-fullscreen-route {
  /* ✅ Safe to customize */
  background: var(--ds-fullscreen-bg, var(--ds-color-surface-base));
  padding: var(--ds-fullscreen-padding, var(--ds-space-4));
  
  /* ❌ NOT customizable (required for behavior) */
  position: fixed;
  inset: 0;
  z-index: var(--ds-z-lane-modal);
  display: grid;
  grid-template-rows: auto 1fr auto;
}

.ds-fullscreen-route[aria-modal="true"] {
  /* Focus trap requires this */
  overflow: auto;
}
```

```tsx
/**
 * CSS Custom Properties:
 * - `--ds-fullscreen-bg`: Background color (default: surface-base)
 * - `--ds-fullscreen-padding`: Content padding (default: space-4)
 * 
 * Note: position, z-index, and display are NOT customizable
 */
export const FullScreenRoute: FC<Props> = ({ children, ... }) => {
  return (
    <motion.aside
      role="dialog"
      aria-modal="true"
      className="ds-fullscreen-route"
    >
      {children}
    </motion.aside>
  );
};
```

---

## 🚀 Benefits

1. **Safe Customization**: Apps can adjust without breaking DS
2. **Token-Based**: Overrides still use DS tokens as fallbacks
3. **Maintainable**: DS can change internals without breaking apps
4. **Documented**: Clear contract of what's customizable
5. **Type-Safe**: TypeScript via `React.CSSProperties`

---

**Rule of Thumb**: If overriding it could break keyboard navigation, focus management, or touch targets → don't expose it as a var.
