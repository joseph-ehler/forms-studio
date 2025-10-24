# Sheet Usage Guide - Just Works™

**Import once, get correct behavior everywhere.**

---

## 🚀 Quick Start

### **1. Import the Stylesheet**

```html
<!-- In HTML demos -->
<link rel="stylesheet" href="../src/styles/ds-sheets.css">
```

```tsx
// In React components
import '@intstudio/ds/styles/ds-sheets.css';
```

```css
/* In other CSS files */
@import '@intstudio/ds/styles/ds-sheets.css';
```

---

## 📋 HTML Structure

### **Docked Panel (Desktop/Mobile Responsive)**

```html
<!-- Container with relative positioning -->
<div class="demo-container" style="display: flex; position: relative;">
  
  <!-- Main content area -->
  <div class="main-area" style="flex: 1;">
    <!-- Your app content -->
  </div>

  <!-- Docked Panel -->
  <aside class="ds-panel-docked ds-sheet" role="complementary">
    <header class="ds-sheet-header">
      <h2>Filters</h2>
      <button class="close-btn">✕</button>
    </header>

    <div class="ds-sheet-content">
      <!-- Optional: Sticky search/filters -->
      <div class="ds-sheet-sticky-actions">
        <input type="search" placeholder="Search..." />
      </div>

      <div class="ds-sheet-content-inner">
        <!-- Scrollable content -->
      </div>
    </div>

    <footer class="ds-sheet-footer">
      <button>Clear</button>
      <button>Apply</button>
    </footer>
  </aside>
</div>
```

### **Sheet Dialog (Modal)**

```html
<!-- Phone/Container with relative positioning -->
<div class="phone-screen" style="position: relative; overflow: hidden;">
  
  <!-- Main content -->
  <div class="main-content">
    <!-- Your app content -->
  </div>

  <!-- Backdrop -->
  <div class="ds-sheet-backdrop" id="backdrop"></div>

  <!-- Sheet Dialog -->
  <div class="ds-sheet-dialog ds-sheet" role="dialog" aria-modal="true">
    <header class="ds-sheet-header">
      <h2>Select Items</h2>
    </header>

    <div class="ds-sheet-content">
      <!-- Optional: Sticky search -->
      <div class="ds-sheet-sticky-actions">
        <input type="search" placeholder="Search..." />
      </div>

      <div class="ds-sheet-content-inner">
        <!-- Scrollable content -->
      </div>
    </div>

    <footer class="ds-sheet-footer">
      <button>Cancel</button>
      <button>Done</button>
    </footer>
  </div>

  <!-- Optional: Mock keyboard for demos -->
  <div class="ds-mock-keyboard" id="mockKeyboard">
    ⌨️ Virtual Keyboard
  </div>
</div>
```

---

## 🎛️ JavaScript API

### **Toggle Panel**

```javascript
const panel = document.querySelector('.ds-panel-docked');

function togglePanel() {
  panel.classList.toggle('ds-visible');
}
```

### **Open/Close Dialog**

```javascript
const dialog = document.querySelector('.ds-sheet-dialog');
const backdrop = document.querySelector('.ds-sheet-backdrop');

function openDialog() {
  dialog.classList.add('ds-visible');
  backdrop.classList.add('ds-visible');
}

function closeDialog() {
  dialog.classList.remove('ds-visible');
  backdrop.classList.remove('ds-visible');
}
```

### **Keyboard Simulation (Demos)**

```javascript
const mockKeyboard = document.querySelector('.ds-mock-keyboard');
const container = document.querySelector('.phone-screen');
let keyboardOpen = false;

function toggleKeyboard() {
  keyboardOpen = !keyboardOpen;
  
  if (keyboardOpen) {
    mockKeyboard.classList.add('ds-visible');
    container.classList.add('ds-keyboard-open');
  } else {
    mockKeyboard.classList.remove('ds-visible');
    container.classList.remove('ds-keyboard-open');
  }
}

// Auto-open keyboard when search is focused
searchInput.addEventListener('focus', () => {
  if (!keyboardOpen) toggleKeyboard();
});
```

---

## 🎨 Classes Reference

### **Layout Classes**

| Class | Purpose | Element |
|-------|---------|---------|
| `ds-sheet` | Base sheet structure | `<div>`, `<aside>` |
| `ds-sheet-header` | Fixed header | `<header>` |
| `ds-sheet-content` | Scrollable content | `<div>` |
| `ds-sheet-content-inner` | Content padding wrapper | `<div>` |
| `ds-sheet-footer` | Fixed footer | `<footer>` |
| `ds-sheet-sticky-actions` | Sticky search/filters | `<div>` |

### **Panel Types**

| Class | Purpose | Behavior |
|-------|---------|----------|
| `ds-panel-docked` | Desktop sidebar, mobile sheet | Responsive |
| `ds-sheet-dialog` | Modal dialog (always overlay) | Modal |

### **State Classes**

| Class | Purpose | Toggle |
|-------|---------|--------|
| `ds-visible` | Show panel/dialog | Add/remove |
| `ds-hidden` | Force hide (display: none) | Add/remove |
| `ds-inert` | Disable interaction | Add to background |
| `ds-keyboard-open` | Keyboard is visible | Add to container |

### **Backdrop**

| Class | Purpose |
|-------|---------|
| `ds-sheet-backdrop` | Modal backdrop overlay |

### **Keyboard (Demos)**

| Class | Purpose |
|-------|---------|
| `ds-mock-keyboard` | Simulated mobile keyboard |

---

## ✅ What You Get Automatically

### **1. Desktop Docked Panel**
- ✅ Side-by-side flexbox layout (pushes content, never overlays)
- ✅ Smooth width animation (300ms)
- ✅ Hidden when closed (`display: none` prevents artifacts)
- ✅ Responsive: becomes bottom sheet on mobile (≤768px)

### **2. Mobile Sheet**
- ✅ Bottom sheet with spring animation (350ms)
- ✅ Overlays content (absolute positioning)
- ✅ GPU-accelerated transform
- ✅ Rounded top corners

### **3. Fixed Header/Footer**
- ✅ Always visible (flex-shrink: 0)
- ✅ Opaque background for scroll underneath
- ✅ Proper z-index stacking

### **4. Scrollable Content**
- ✅ Takes remaining space (flex: 1)
- ✅ Internal scroll (overflow-y: auto)
- ✅ Prevents scroll chaining (overscroll-behavior: contain)
- ✅ Min-height: 0 for proper flex scrolling

### **5. Sticky Search/Filters**
- ✅ Stays at top while scrolling results
- ✅ Opaque background with subtle shadow
- ✅ Proper z-index above content

### **6. Keyboard Handling**
- ✅ Sheet adapts height when keyboard opens
- ✅ Smooth transition (300ms)
- ✅ All content remains accessible

### **7. Accessibility**
- ✅ Proper ARIA roles
- ✅ Focus management ready
- ✅ Reduced motion support
- ✅ Print stylesheet (hides sheets)

### **8. Responsive Transitions**
- ✅ Smooth animations at viewport resize
- ✅ No "traveling" artifacts when closed
- ✅ Layout properties change instantly at breakpoints
- ✅ Only position/transform animates

---

## 🎯 Common Patterns

### **Pattern 1: Responsive Filter Panel**

Use `ds-panel-docked` for a panel that:
- Docks to the side on desktop (pushes content)
- Becomes bottom sheet on mobile (overlays)

**When to use**: Filters, settings, navigation

### **Pattern 2: Modal Selection Dialog**

Use `ds-sheet-dialog` for a dialog that:
- Always overlays (desktop and mobile)
- Blocks background interaction (modal)
- Has Done/Cancel semantics

**When to use**: Multi-select, pickers, confirmations

### **Pattern 3: Search-Heavy Sheet**

Add `ds-sheet-sticky-actions` for sheets with:
- Search bar that should stay visible
- Filters that need constant access
- Tab navigation

**When to use**: Contact lists, file pickers, command palettes

---

## ⚡ Performance

All animations use:
- **GPU acceleration** (`will-change: transform`)
- **Spring easing** (`cubic-bezier(0.32, 0.72, 0, 1)`)
- **60fps** smooth animations
- **Instant layout changes** at breakpoints (0ms width/border-radius)

---

## 🐛 Troubleshooting

### **Panel is visible when closed**
✅ Ensure you're toggling `ds-visible` class (not modifying CSS directly)

### **Panel travels across screen during resize**
✅ Make sure closed panels don't have `ds-visible` class

### **Content not scrolling**
✅ Check that `ds-sheet-content` has the class applied
✅ Ensure you're using `ds-sheet-content-inner` for padding

### **Sticky search scrolls away**
✅ Use `ds-sheet-sticky-actions`, not inline `position: sticky`
✅ Must be direct child of `ds-sheet-content`

### **Keyboard doesn't adjust sheet**
✅ Add `ds-keyboard-open` class to container (not sheet itself)

---

## 📚 Reference Implementations

**Live Examples**:
- `/packages/ds/demos/docked-panel-demo.html` - Responsive panel
- `/packages/ds/demos/sheet-dialog-demo.html` - Modal dialog with keyboard

**Documentation**:
- `/docs/ds/patterns/SHEET_LAYOUT_RULES.md` - All 8 rules explained
- `/docs/audit/SHEET_LAYOUT_CODIFICATION_COMPLETE.md` - Enforcement strategy

**Tests**:
- `/packages/ds/tests/sheet-layout-rules.spec.ts` - Playwright enforcement tests

---

## 🎉 That's It!

Import `ds-sheets.css`, use the classes, get perfect sheet behavior. No manual wiring, no forgotten details, no layout artifacts.

**It just works.** ✨
