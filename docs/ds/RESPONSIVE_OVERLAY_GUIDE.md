# Responsive Overlay System - Implementation Guide

**Status:** 🆕 God-Tier Responsive System  
**Version:** 1.0.0  
**Date:** October 24, 2025

---

## 🎯 What This Solves

**Problem:** Overlays behave differently on desktop (popover) vs mobile (sheet), requiring duplicate logic in every field.

**Solution:** `ResponsiveOverlay` - one component that automatically handles:
- ✅ Popover on desktop with collision detection
- ✅ Sheet on mobile with gestures & snap points
- ✅ Automatic mode switching based on viewport
- ✅ Sticky headers/footers with scrollable content
- ✅ Keyboard avoidance (mobile keyboards)
- ✅ Safe area handling (notches, home indicators)
- ✅ Focus trap & return focus
- ✅ Full accessibility (ARIA, keyboard nav)

---

## 🚀 Quick Start

### Basic Usage (Recipes)

```tsx
import { ResponsiveOverlay, OverlayHeader, OverlayContent, OverlayFooter } from '@intstudio/ds/primitives/overlay';

export const SimpleListRecipe: Recipe = (ctx) => {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  const Overlay = () => (
    <ResponsiveOverlay
      open={isOpen}
      onClose={() => setIsOpen(false)}
      triggerRef={triggerRef}
      {...ctx.spec.ui?.overlay}
    >
      <OverlayHeader>
        {/* Search input */}
      </OverlayHeader>
      
      <OverlayContent>
        {/* Option list */}
      </OverlayContent>
      
      <OverlayFooter>
        {/* Actions (multi-select only) */}
      </OverlayFooter>
    </ResponsiveOverlay>
  );
  
  return { Trigger, Overlay };
};
```

**That's it!** ResponsiveOverlay handles everything else.

---

## 📐 Spec Configuration

Add to your field spec (`ui.overlay` object):

```yaml
ui:
  overlay:
    # Mode selection
    mode: auto           # auto | popover | sheet
    breakpoint: 768      # px; below -> sheet, above -> popover
    
    # Popover settings
    fitTrigger: true     # Match trigger width
    collision: flip-shift-resize  # Collision strategy
    anchorPadding: 8     # px margin around trigger
    minPopoverHeight: 280  # px; fallback to sheet if less
    
    # Sheet settings
    snap: [0.4, 0.7, 1.0]  # Fractions of viewport height
    initialSnap: 0.7       # Index into snap array (0-based)
    dragHandle: true       # Show drag handle
    allowContentScroll: true  # Hand off scroll to content at max snap
    keyboardAvoidance: true   # Lift sheet when keyboard appears
```

### Defaults (All Optional)

```typescript
{
  mode: 'auto',
  breakpoint: 768,
  fitTrigger: true,
  collision: 'flip-shift-resize',
  anchorPadding: 8,
  minPopoverHeight: 280,
  snap: [0.4, 0.7, 1.0],
  initialSnap: 0.7,
  dragHandle: true,
  allowContentScroll: true,
  keyboardAvoidance: true
}
```

**These defaults produce great UX without any configuration!**

---

## 🎨 How It Works

### Desktop (Popover Mode)

**Viewport >= 768px (or mode='popover'):**

1. **Positioning:** Measures trigger, calculates available space
2. **Placement:** Prefers bottom, falls back to top/left/right
3. **Collision Detection:**
   - **Flip:** Switch to opposite side if no space
   - **Shift:** Nudge horizontally/vertically to fit
   - **Resize:** Clamp maxHeight to available space
4. **Fit Trigger:** Match trigger width (optional)
5. **Auto-scroll:** Content scrolls independently
6. **Focus Trap:** Tab loops within popover
7. **Return Focus:** Returns to trigger on close

### Mobile (Sheet Mode)

**Viewport < 768px (or mode='sheet'):**

1. **Snap Points:** Convert fractions to pixels (e.g., `[0.4, 0.7, 1.0]` of `vh`)
2. **Initial Snap:** Opens at `initialSnap` index (default: 0.7 = 70% of viewport)
3. **Drag Gestures:**
   - Drag up/down to change snap points
   - Velocity-based snapping (flick detection)
   - Resistance at bounds (rubber-band effect)
   - Swipe down past threshold closes sheet
4. **Content Scroll Handoff:**
   - At top of content → drag moves sheet
   - While scrolling content → content scrolls
   - At bottom of content → resume sheet control
5. **Keyboard Avoidance:**
   - Listens to `visualViewport.height` changes
   - Lifts sheet when keyboard appears
   - Adds bottom padding for keyboard inset
6. **Safe Areas:** Uses `env(safe-area-inset-bottom)` for notches
7. **Drag Handle:** 44px hit target, ARIA labeled
8. **Backdrop Opacity:** Fades based on sheet position

### Auto Mode (Smart Detection)

**Mode = 'auto' (default):**

1. Check viewport width vs breakpoint
2. If < breakpoint → sheet
3. If >= breakpoint → try popover
4. If popover can't achieve `minPopoverHeight` → fallback to sheet
5. Re-evaluate on viewport resize

**Result:** Always picks the best mode!

---

## 🏗️ Architecture

### Component Hierarchy

```
ResponsiveOverlay (coordinator)
  ├─ mode === 'sheet'
  │    ├─ Portal to document.body
  │    ├─ Backdrop (with opacity fade)
  │    ├─ Sheet container (with translateY)
  │    │    ├─ Drag handle (optional)
  │    │    └─ Children (Header/Content/Footer)
  │    └─ Gesture handlers (useSheetGestures)
  │
  └─ mode === 'popover'
       ├─ Portal to document.body
       ├─ Backdrop (lighter)
       ├─ Popover container (positioned)
       │    └─ Children (Header/Content/Footer)
       └─ Position calculator (usePopoverPosition)
```

### Supporting Hooks

**useSheetGestures:**
- Snap point calculations
- Drag state management (start/current/velocity)
- Content scroll handoff logic
- Keyboard avoidance (visualViewport)
- Animation timing

**usePopoverPosition:**
- Trigger measurement
- Available space calculation
- Placement selection (bottom/top/left/right)
- Collision detection (flip/shift/resize)
- Auto-update on scroll/resize

**useFocusTrap:**
- Capture all focusable elements
- Tab loop (first ↔ last)
- Escape key handler
- Return focus on unmount
- Prevent clicks outside

---

## 🎯 Sticky Header/Footer Pattern

**CSS ensures sticky behavior:**

```tsx
<ResponsiveOverlay {...props}>
  <OverlayHeader>
    {/* position: sticky; top: 0; z-index: 1 */}
    <input className="ds-input" />
  </OverlayHeader>
  
  <OverlayContent>
    {/* overflow-y: auto; flex: 1 */}
    {/* ONLY this scrolls! */}
    <OverlayList>...</OverlayList>
  </OverlayContent>
  
  <OverlayFooter>
    {/* position: sticky; bottom: 0; z-index: 1 */}
    <Button>Clear</Button>
    <Button>Apply</Button>
  </OverlayFooter>
</ResponsiveOverlay>
```

**Result:**
- Header/Footer always visible
- Content scrolls independently
- Works in both popover and sheet modes

---

## 📱 Mobile Behavior Details

### Snap Point Examples

```yaml
snap: [0.4, 0.7, 1.0]
initialSnap: 0.7
```

**On iPhone 14 (844px viewport height):**
- Snap 0: `338px` (0.4 × 844) - Peek view
- Snap 1: `591px` (0.7 × 844) - Half screen **← Opens here**
- Snap 2: `844px` (1.0 × 844) - Full screen

### Gesture Mechanics

**Drag Down from Snap 1:**
1. User drags 100px down
2. `translateY` updates live (591 → 691)
3. Backdrop opacity fades (1.0 → 0.7)
4. On release:
   - If velocity > threshold → snap to Snap 0
   - Else → snap to nearest (still Snap 1)

**Drag Up from Snap 1:**
1. User drags 100px up (or flicks)
2. `translateY` updates (591 → 491)
3. On release:
   - Velocity check → snap to Snap 2 (full screen)
   - Content becomes scrollable at Snap 2

**Swipe to Close:**
- Drag down past Snap 0 by > 150px
- Or: High velocity downward from any snap
- Triggers `onClose()` instead of snapping

### Content Scroll Handoff

**At Max Snap (Snap 2 - Full Screen):**
```
User drags down on content
  ↓
Is content.scrollTop > 0?
  ↓ YES → scroll content up
  ↓ NO  → move sheet down to Snap 1
```

**At Mid Snap (Snap 1):**
```
User drags on content
  ↓
Always moves sheet (content doesn't scroll yet)
```

**Result:** Feels native! Like iOS Sheets.

---

## 🔐 Accessibility Features

### ARIA Attributes

**For Dialogs (default):**
```tsx
<ResponsiveOverlay
  role="dialog"
  ariaLabel="Choose an option"
  ariaModal="true"
>
```

**For Listboxes (select fields):**
```tsx
<ResponsiveOverlay
  role="listbox"
  ariaLabelledBy="field-label-id"
  ariaMultiselectable={isMulti}
>
```

### Keyboard Support

**Focus Trap:**
- Tab/Shift+Tab loops within overlay
- Can't Tab out to background page
- Escape closes overlay
- Focus returns to trigger on close

**Content Navigation:**
- Arrow keys, Home/End work via `useOverlayKeys`
- Enter selects (handled by recipes)
- Works in both popover and sheet modes

### Screen Reader Announcements

**Recipes should add live regions:**
```tsx
<OverlayContent>
  {/* Options */}
  
  <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {filteredOptions.length} results available
  </div>
</OverlayContent>
```

---

## ⚡ Performance Optimizations

### Lazy Rendering

**Don't render until open:**
```tsx
const Overlay = () => {
  if (!isOpen) return null; // ResponsiveOverlay also guards this
  
  return <ResponsiveOverlay {...props}>...</ResponsiveOverlay>;
};
```

### Gesture Performance

**useSheetGestures optimizations:**
- `touchAction: 'none'` prevents default scrolling
- `will-change: transform` hints browser
- RAF (requestAnimationFrame) for layout calculations
- Throttled viewport updates (keyboard avoidance)
- No reflows during drag (transform only)

### Collision Detection

**usePopoverPosition optimizations:**
- Measures only when needed (open + viewport change)
- Uses ResizeObserver (planned) for trigger changes
- Debounces scroll events
- Caches calculations per frame

---

## 🧪 Testing Checklist

### Desktop (Popover)

- [ ] Opens below trigger (default)
- [ ] Flips to top when no space below
- [ ] Shifts left/right to fit viewport
- [ ] Matches trigger width (if `fitTrigger: true`)
- [ ] Resizes maxHeight when space limited
- [ ] Backdrop click closes overlay
- [ ] Escape key closes overlay
- [ ] Focus returns to trigger on close
- [ ] Tab loops within overlay

### Mobile (Sheet)

- [ ] Opens at initial snap point
- [ ] Drag handle visible and interactive
- [ ] Drag up/down changes snap points
- [ ] Velocity-based snapping works (flick)
- [ ] Swipe down closes sheet
- [ ] Content scrolls at max snap
- [ ] Keyboard lifts sheet (iOS/Android)
- [ ] Safe area padding applied
- [ ] Backdrop fades with sheet position
- [ ] Resistance at bounds (rubber-band)

### Auto Mode

- [ ] Uses popover on desktop (>= 768px)
- [ ] Uses sheet on mobile (< 768px)
- [ ] Falls back to sheet when popover can't fit
- [ ] Re-evaluates on viewport resize

### Accessibility

- [ ] role="dialog" or role="listbox" set
- [ ] aria-modal="true" for sheets
- [ ] aria-label or aria-labelledby present
- [ ] aria-multiselectable for multi-select
- [ ] Focus trap works
- [ ] Escape closes
- [ ] Focus returns to trigger
- [ ] Screen reader announces content

---

## 🎨 Customization Examples

### Custom Snap Points

**3-point system (peek/half/full):**
```yaml
snap: [0.3, 0.6, 0.95]
initialSnap: 1  # Open at 60%
```

**2-point system (half/full):**
```yaml
snap: [0.5, 1.0]
initialSnap: 0  # Open at 50%
```

**Always full screen:**
```yaml
snap: [1.0]
initialSnap: 0
dragHandle: false  # No point dragging if only one snap
```

### Force Mode

**Always sheet (even on desktop):**
```yaml
mode: sheet
snap: [0.5, 0.9]
```

**Always popover (even on mobile):**
```yaml
mode: popover
collision: resize  # Important for small screens
```

### Collision Strategies

**Flip only:**
```yaml
collision: flip  # Try opposite side, don't shift/resize
```

**Shift only:**
```yaml
collision: shift  # Nudge to fit, don't flip/resize
```

**All strategies:**
```yaml
collision: flip-shift-resize  # Default - try everything
```

---

## 🔧 Migration from Old System

### Before (Manual Overlay):

```tsx
const Overlay = () => {
  if (!isOpen) return null;
  
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 999 }} />
      <div
        style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          zIndex: 1000,
          // ... manual positioning
        }}
      >
        {/* content */}
      </div>
    </>
  );
};
```

### After (ResponsiveOverlay):

```tsx
const Overlay = () => (
  <ResponsiveOverlay
    open={isOpen}
    onClose={onClose}
    triggerRef={triggerRef}
  >
    <OverlayContent>
      {/* content */}
    </OverlayContent>
  </ResponsiveOverlay>
);
```

**Benefits:**
- 90% less code
- Works on mobile automatically
- Collision detection built-in
- Focus trap automatic
- A11y guaranteed

---

## 📚 Related Docs

- **OVERLAY_RECIPE_SYSTEM.md** - Recipe architecture
- **OVERLAY_QUALITY_HOOKS.md** - useOverlayKeys, useFocusReturn
- **INPUT_STRATEGY.md** - Three primitives (input/button/option)
- **OVERLAY_DESIGN_PATTERNS.md** - 14 pattern categories

---

## 🎯 Summary

**ResponsiveOverlay is a drop-in replacement for manual overlay logic.**

✅ **One component, all platforms**
✅ **Spec-driven with sensible defaults**
✅ **Popover on desktop, sheet on mobile**
✅ **Gesture support (drag, snap, swipe)**
✅ **Collision detection (flip, shift, resize)**
✅ **Keyboard avoidance (mobile)**
✅ **Safe area handling (notches)**
✅ **Focus trap + return focus**
✅ **Full accessibility**
✅ **Zero manual positioning**

**Recipes remain simple - ResponsiveOverlay handles complexity!** 🚀
