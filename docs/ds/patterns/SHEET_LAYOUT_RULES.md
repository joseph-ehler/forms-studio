# Sheet Layout Rules - Enforced Patterns

**Status**: REQUIRED for all sheet implementations  
**Enforcement**: ESLint rules + TypeScript + Playwright tests

---

## 🎯 Core Principles (8 Rules)

### **1. Desktop Docked = Side-by-Side (NEVER Overlay)**

**Rule**: On desktop (>1024px), docked panels MUST push content aside using flexbox, not overlay with absolute positioning.

**Correct**:
```css
/* Desktop: Part of flex layout */
.docked-panel {
  width: 0;
  flex-shrink: 0;
  display: none; /* Hidden when closed */
}

.docked-panel.visible {
  display: flex;
  width: min(420px, 35vw);
}
```

**Incorrect** ❌:
```css
/* BAD: Overlays content */
.docked-panel {
  position: absolute;
  right: 0;
}
```

**Why**: Desktop users expect sidebars to resize content, not cover it.

---

### **2. Closed State = Completely Hidden**

**Rule**: When closed on desktop, panels MUST use `display: none` to prevent layout artifacts during viewport resize.

**Correct**:
```css
.docked-panel {
  display: none; /* Completely removed from layout */
}

.docked-panel.visible {
  display: flex;
}
```

**Incorrect** ❌:
```css
/* BAD: Still in layout, causes visible repositioning */
.docked-panel {
  opacity: 0;
  width: 0;
}
```

**Why**: Using `opacity: 0` or `width: 0` keeps the element in the layout tree. During breakpoint transitions (desktop → mobile), the element's positioning changes (flex → absolute), creating visible artifacts as it "travels" across the screen.

---

### **3. Mobile Sheet = Overlay with Transform**

**Rule**: On mobile (≤768px), sheets MUST overlay content using absolute positioning + transforms.

**Correct**:
```css
@media (max-width: 768px) {
  .sheet {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    transform: translateY(100%); /* Off-screen when closed */
    transition: transform 300ms ease;
  }
  
  .sheet.visible {
    transform: translateY(0);
  }
}
```

**Why**: Mobile sheets overlay content (non-modal panels) or block it (modal dialogs). Transform animations are GPU-accelerated and performant.

---

### **4. Fixed Header/Footer, Scrollable Content**

**Rule**: All sheets MUST have fixed header/footer with scrollable content area.

**Required Structure**:
```tsx
<div className="sheet">
  <header className="sheet-header" style={{ flexShrink: 0 }}>
    {/* Fixed at top */}
  </header>
  
  <div className="sheet-content" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
    {/* Scrollable */}
  </div>
  
  <footer className="sheet-footer" style={{ flexShrink: 0 }}>
    {/* Fixed at bottom */}
  </footer>
</div>
```

**Critical CSS**:
```css
.sheet {
  display: flex;
  flex-direction: column;
}

.sheet-header,
.sheet-footer {
  flex-shrink: 0; /* Never shrink */
  background: white; /* Opaque background */
}

.sheet-content {
  flex: 1; /* Take remaining space */
  overflow-y: auto;
  min-height: 0; /* Enable flex scrolling */
  overscroll-behavior: contain; /* Prevent scroll chaining */
}
```

---

### **4a. Sticky Actions (Search, Filters)**

**Rule**: Action elements like search bars and filters MUST be sticky at the top of scrollable content.

**Required Structure**:
```tsx
<div className="sheet-content">
  <div className="sticky-actions">
    <input type="search" placeholder="Search..." />
    {/* Or filters, tabs, etc. */}
  </div>
  
  <div className="sheet-content-inner">
    {/* Scrollable results */}
  </div>
</div>
```

**Critical CSS**:
```css
.sticky-actions {
  position: sticky;
  top: 0;
  background: white;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  z-index: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.sheet-content-inner {
  padding: 20px;
}
```

**Why**: Search and filters should always be accessible while scrolling through results. Sticky positioning keeps them visible without eating into the scrollable area.

---

### **5. Smooth Animations (350ms with Spring Easing)**

**Rule**: All state transitions MUST animate smoothly with 350ms duration and spring-like easing.

**Required**:
```css
/* Mobile sheet (spring easing for natural feel) */
.sheet {
  transition: transform 350ms cubic-bezier(0.32, 0.72, 0, 1);
  will-change: transform; /* GPU acceleration */
}

/* Desktop docked */
.docked-panel {
  animation: slideInRight 300ms ease;
}

/* Backdrop */
.backdrop {
  transition: opacity 350ms ease;
}
```

**Why**: 
- `cubic-bezier(0.32, 0.72, 0, 1)` creates a spring-like "bounce" that feels natural
- `will-change: transform` enables GPU acceleration for smooth 60fps animations
- 350ms is the sweet spot: fast enough to feel responsive, slow enough to not feel jarring

**Never**: 
- Instant changes (`transition: none` or no animation)
- Linear easing (feels robotic)
- Durations < 250ms (too fast) or > 500ms (too slow)

---

### **6. Resize Handling (Keep Open, Change Mode)**

**Rule**: Viewport resize MUST NOT close panels. Let CSS handle mode transitions.

**Correct**:
```javascript
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    updateMode(); // Just update mode variable
    // CSS media queries handle visual transition
  }, 150);
});
```

**Incorrect** ❌:
```javascript
// BAD: Closes and reopens panel
window.addEventListener('resize', () => {
  if (isOpen) {
    closePanel();
    setTimeout(() => openPanel(), 50);
  }
});
```

**Why**: Users expect panels to stay open during resize. Closing breaks their workflow.

---

### **7. No Transitions on Layout Properties During Breakpoints**

**Rule**: Width, position, border-radius MUST transition instantly (0ms) at breakpoints to prevent visual artifacts.

**Correct**:
```css
.docked-panel {
  transition: transform 300ms ease, width 0ms, border-radius 0ms;
}

@media (max-width: 768px) {
  .docked-panel {
    /* These change instantly */
    width: 100%;
    border-radius: 16px 16px 0 0;
    /* Only transform animates */
    transition: transform 300ms ease;
  }
}
```

**Why**: Animating width/border-radius during layout mode changes creates visual "morphing" artifacts.

---

## 🛡️ Enforcement

### **ESLint Rules** (To Be Created)

```javascript
// .eslintrc.sheet-layout.json
{
  "rules": {
    "@intstudio/sheet-desktop-must-flex": "error",
    "@intstudio/sheet-closed-must-display-none": "error",
    "@intstudio/sheet-mobile-must-absolute": "error",
    "@intstudio/sheet-must-have-fixed-header-footer": "error",
    "@intstudio/sheet-must-animate-300ms": "error"
  }
}
```

### **TypeScript Guards**

```typescript
interface DockedPanelProps {
  // Enforce side-by-side layout
  layoutMode: 'flex-item'; // Not 'absolute'
  
  // Enforce proper state management
  displayWhenClosed: 'none'; // Not 'opacity-0' or 'width-0'
  
  // Enforce animations
  transitionDuration: 300; // milliseconds
}
```

### **Playwright Tests** (To Be Created)

```typescript
test('docked panel pushes content on desktop', async ({ page }) => {
  // Open panel
  await page.click('[data-testid="open-panel"]');
  
  // Main content should shrink, not be covered
  const mainWidth = await page.locator('.main-content').evaluate(el => 
    el.getBoundingClientRect().width
  );
  
  expect(mainWidth).toBeLessThan(page.viewportSize()!.width);
});

test('closed panel invisible during resize', async ({ page }) => {
  // Close panel
  await page.click('[data-testid="close-panel"]');
  
  // Resize viewport
  await page.setViewportSize({ width: 375, height: 667 });
  
  // Panel should never be visible
  const wasVisible = await page.locator('.docked-panel').isVisible();
  expect(wasVisible).toBe(false);
});
```

---

## 📋 Checklist for All Sheet Implementations

Before shipping any sheet component, verify:

- [ ] Desktop docked uses `flex-shrink: 0` (not `position: absolute`)
- [ ] Closed state uses `display: none` (not `opacity: 0`)
- [ ] Mobile uses `position: absolute` + `transform`
- [ ] Header/footer have `flex-shrink: 0`
- [ ] Content has `flex: 1` + `overflow-y: auto` + `min-height: 0`
- [ ] All transitions use 300ms duration
- [ ] Resize handler does NOT close panel
- [ ] Width/border-radius transition instantly (0ms) at breakpoints
- [ ] Playwright tests pass for layout behavior
- [ ] ESLint rules pass

---

## 🎯 Reference Implementation

**Demo**: `packages/ds/demos/docked-panel-demo.html`

This demo embodies all rules and serves as the canonical reference for sheet layout behavior.

---

## ❌ Common Anti-Patterns

### **1. Overlay on Desktop**
```css
/* BAD */
.docked-panel {
  position: absolute; /* Should be flex item */
}
```

### **2. Opacity Instead of Display**
```css
/* BAD */
.docked-panel {
  opacity: 0; /* Should be display: none */
}
```

### **3. Closing on Resize**
```javascript
// BAD
window.addEventListener('resize', () => {
  if (isOpen) closePanel();
});
```

### **4. Animating Layout at Breakpoints**
```css
/* BAD */
.docked-panel {
  transition: all 300ms; /* Should exclude width/border-radius */
}
```

---

## 🚀 Next Steps

1. **Create ESLint rules** for these patterns
2. **Add Playwright tests** to CI pipeline
3. **Update existing sheets** to follow these rules
4. **Add TypeScript types** that enforce correct props
5. **Document in Storybook** (or HTML demos) with examples

---

## 📚 Related Documents

- `/docs/ds/SHEET_INTERACTION_PATTERNS.md` - UX patterns
- `/docs/ds/SHEET_POLICY.md` - Modal vs non-modal contracts
- `/packages/ds/demos/docked-panel-demo.html` - Reference implementation
- `/packages/ds/tests/*.spec.ts` - E2E test suite
