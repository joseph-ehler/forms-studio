# OverlayPicker Hardening - Complete

Root primitive is now God-tier. All future overlay changes happen in **one file**.

---

## ✅ Implemented Improvements

### 1. **Portal + Stacking Context**
- **File**: `OverlayPicker.tsx`
- **What**: Renders overlay via React portal to `document.body`
- **Why**: Avoids ancestor clipping from `overflow`/`transform`; guarantees z-order; fixes iOS position bugs
- **Token**: `zIndex: 1000` centralized (easy to move to CSS variable)

```tsx
return createPortal(node, document.body)
```

### 2. **Capture-Phase Event Shielding**
- **File**: `OverlayPicker.tsx`
- **What**: Stop propagation on **both** capture + bubble phases
- **Why**: Some libraries attach outside-click handlers in capture phase
- **Events**: `onPointerDownCapture`, `onClickCapture` + existing bubble handlers

```tsx
onPointerDownCapture={(e) => {
  e.stopPropagation()
  e.nativeEvent?.stopImmediatePropagation?.()
}}
```

### 3. **Pointer Events for Outside-Click**
- **File**: `OverlayPicker.tsx`
- **What**: Replaced `mousedown` with `pointerdown`/`pointerup`
- **Why**: Supports touch/pen devices; tracks down+up to prevent scroll-triggered closes
- **Logic**: `downInside` flag prevents false positives when scrolling starts inside

```tsx
const onPointerDown = (e: PointerEvent) => {
  downInside = !!(floating.contains(target)) || !!(anchor.contains(target))
}
const onPointerUp = (e: PointerEvent) => {
  if (!downInside && !floating.contains(target)) onOpenChange(false, 'outside')
}
```

### 4. **Focus Trap + Return Focus**
- **File**: `OverlayPicker.tsx`
- **What**: Centralized focus management with `trapFocus`/`returnFocus` props (default: `true`)
- **Why**: Accessibility standard for dialogs; expected picker behavior
- **Behavior**:
  - Focuses first tabbable element on open
  - Loops Tab/Shift+Tab within overlay
  - Returns focus to anchor (or previous active element) on close

```tsx
useEffect(() => {
  if (!trapFocus) return
  const prev = document.activeElement
  tabbables[0]?.focus()
  // ... tab trap logic
  return () => prev?.focus?.()
}, [open])
```

### 5. **Bullet-Proof Height Contracting**
- **File**: `OverlayPicker.tsx`
- **What**: Added `contain: 'layout'` to parent, flex layout handles content sizing
- **Why**: Improves rendering performance without breaking flex child dimensions
- **Note**: Originally used `contain: 'layout size'` + `maxHeight: 'inherit'` but this prevented flex children from sizing correctly. Simplified to `contain: 'layout'` only.

```tsx
// Parent
style={{ maxHeight: `${maxH}px`, contain: 'layout' }}

// Content (flex-1 min-h-0 is sufficient - no inline style needed)
<div className="flex-1 min-h-0 overflow-auto" data-role="content">
```

### 6. **Robust iOS Scroll Lock**
- **File**: `OverlaySheet.tsx`
- **What**: `documentElement` overflow lock + `overscroll-behavior` + touchmove prevention
- **Why**: Stops iOS Safari background bounce; prevents scroll bleeding
- **Preserves**: User can still scroll inside `.overflow-y-auto` content

```tsx
html.style.overflow = 'hidden'
html.style.overscrollBehaviorY = 'contain'
html.style.position = 'relative'
document.addEventListener('touchmove', preventTouch, { passive: false })
```

### 7. **A11y Polish**
- **File**: `OverlayPicker.tsx`
- **What**: 
  - `role="dialog"` + `aria-modal="true"`
  - `aria-labelledby` points to header (if present)
  - `aria-live="polite"` announcement on open
- **Why**: Screen reader support; WCAG compliance

```tsx
<div role="dialog" aria-modal="true" aria-labelledby={headerId}>
  <div className="sr-only" aria-live="polite">
    Picker opened. Press Escape to close.
  </div>
```

### 8. **Diagnostics Utility**
- **File**: `debug.ts` (new)
- **What**: `debugOverlay()` function for console inspection
- **Usage**:

```js
import { debugOverlay } from '@your-package/wizard-react'
debugOverlay() // Logs table with maxHeight, scrollHeight, etc.
```

**Output**:
```
🔍 Overlay Debug Info
┌─────────────────────────┬──────────┐
│ Overlay Style maxHeight │ 480px    │
│ Overlay Computed maxH   │ 480px    │
│ CSS Var --overlay-max-h │ 480px    │
│ Data Attribute data-max │ 480      │
│ Content overflow-y      │ auto     │
│ Content scrollHeight    │ 1200     │
│ Content clientHeight    │ 480      │
│ Is scrollable?          │ ✅ Yes   │
└─────────────────────────┴──────────┘
```

### 9. **Throttled VisualViewport Updates**
- **File**: `OverlayPicker.tsx`
- **What**: Added `cancelled` flag to abort RAF on unmount
- **Why**: Prevents flooding `update()` during fast keyboard animations; avoids stale callbacks

```tsx
let cancelled = false
const queue = () => {
  if (cancelled) return
  raf = requestAnimationFrame(() => update?.())
}
return () => { cancelled = true; cancelAnimationFrame(raf) }
```

---

## 📋 What This Unlocks

### For Developers
- **One file to rule them all**: Change positioning/events/focus in `OverlayPicker.tsx` → all pickers follow
- **No more ad-hoc layouts**: Fields pass `content`/`header`/`footer` props, nothing else
- **Instant diagnostics**: `debugOverlay()` in console shows exactly what's happening

### For Users
- **Touch/pen support**: Works on iPad, Surface, pen devices (not just mouse)
- **Mobile keyboard**: Overlay auto-adjusts when keyboard appears
- **Screen readers**: Proper announcements and focus management
- **No scroll leaks**: Background stays locked on iOS

---

## 🚧 Future Improvements (Not Critical)

### CalendarSkin CSS Centralization
**Current**: `CalendarSkin` uses `classNames` prop with `fs-*` prefixes  
**Future**: Move to ARIA/role/data-attribute selectors for zero class guessing

**Why**: Right now calendar styling relies on class names like `.fs-day`, `.fs-selected`. This is fine, but targeting `[role="gridcell"][aria-selected="true"]` would be more robust and library-agnostic.

**How**:
1. Create `ds-calendar.css` with selectors like:
   ```css
   .ds-calendar [role="gridcell"] { /* base day style */ }
   .ds-calendar [role="gridcell"][aria-selected="true"] { /* selected */ }
   ```
2. Import once in `CalendarSkin.tsx`
3. Fields never import DayPicker CSS directly

**Benefit**: Calendar changes (colors, spacing, hover) happen in **one CSS file**. No 6-hour "this looks different" rabbit holes.

---

## 🎯 Process Guardrails (Recommended)

### 1. Playwright Tests
Create tiny-viewport tests for each picker:
```ts
test('DatePicker footer visible on small screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 600 })
  await page.click('[data-testid="date-input"]')
  const footer = page.locator('[data-role="footer"]')
  await expect(footer).toBeVisible()
  // Assert overlay bottom ≤ viewport bottom
})
```

### 2. ESLint Rules (Custom)
Ban dangerous patterns:
- ❌ Importing `react-day-picker/dist/style.css` outside CalendarSkin
- ❌ Adding `.flex-1.min-h-0.overflow-auto` in field components
- ❌ Manual `position: fixed` wrappers (only OverlayPicker owns floating)

### 3. Change Checklist
Before merging overlay changes:
- [ ] Run `npm run verify:overlay` (Playwright)
- [ ] Open each picker manually at 320px width × 480px height
- [ ] Run `debugOverlay()` and paste output if anything looks off

---

## 📖 Reference: OverlayPicker Props

```tsx
interface OverlayPickerProps {
  // Required
  open: boolean
  anchor: HTMLElement | null
  content: React.ReactNode

  // Optional behavior
  onOpenChange?: (open: boolean, reason?: 'outside' | 'escape' | 'select') => void
  trapFocus?: boolean        // default: true
  returnFocus?: boolean      // default: true

  // Optional slots
  header?: React.ReactNode
  footer?: React.ReactNode

  // Positioning (Floating UI)
  placement?: Placement      // default: 'bottom-start'
  offset?: number            // default: 6
  sameWidth?: boolean        // default: true
  hardMaxHeight?: number     // default: 560
  collision?: { flip, shift, size, hide }  // all true by default
  strategy?: 'fixed' | 'absolute'  // default: 'fixed'

  // Styling hooks
  className?: string
  style?: React.CSSProperties

  // Diagnostics
  onComputedLayout?: (info: { maxHeightPx, viewportH }) => void
}
```

---

## 🎉 Bottom Line

**Before**: Each field hand-rolled positioning, events, focus, scroll lock  
**After**: Fields pass `content`, `header`, `footer` — OverlayPicker handles the rest

Any future tweak (height, event policy, focus) is **one change in one file** and the entire platform follows.

**That's the design-system way.**
