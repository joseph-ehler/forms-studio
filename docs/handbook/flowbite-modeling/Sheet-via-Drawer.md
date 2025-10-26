# Flowbite Modeling Recipe: Sheet via Drawer

**Pattern**: Build mobile-first Sheet using Flowbite Drawer (no external engines)  
**Complexity**: Low (Flowbite-only)  
**Optional Enhancement**: Gesture physics (react-spring-bottom-sheet)

---

## **The Problem**

Need a mobile-optimized bottom sheet with:
- Bottom-anchored overlay
- Backdrop + body scroll lock
- Focus trap (modal behavior)
- ESC to close
- Dismiss callback

**Flowbite doesn't have "Sheet"**, but it has **Drawer** that we can adapt.

---

## **The Solution: Compose from Flowbite Drawer**

### **Step 1: Use Flowbite Drawer as Base**

```tsx
import { Drawer } from 'flowbite-react';

export function Sheet({
  isOpen,
  onClose,
  ariaLabel,
  children,
  variant = 'default',
}: SheetProps) {
  const skin = SKIN[variant];
  
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      position="bottom"  // ← Bottom-anchored
      aria-label={ariaLabel}
      style={{ ...skin }}
    >
      {children}
    </Drawer>
  );
}
```

**What we get from Flowbite:**
- ✅ Backdrop
- ✅ Body scroll lock
- ✅ Focus trap
- ✅ ESC to close
- ✅ ARIA roles

---

### **Step 2: Add CSS for Bottom Positioning**

```css
/* Sheet.css */
.flowbite-drawer[data-position="bottom"] {
  /* Override Flowbite's default height */
  max-block-size: 90vh;
  min-block-size: var(--ds-touch-target);
  
  /* Rounded top corners */
  border-start-start-radius: var(--ds-radius-lg);
  border-start-end-radius: var(--ds-radius-lg);
  
  /* Ensure it's at bottom */
  inset-block-end: 0;
  inset-block-start: auto;
}
```

---

### **Step 3: Add onBeforeDismiss Hook**

```tsx
export function Sheet({
  isOpen,
  onClose,
  onBeforeDismiss,  // ← New prop
  ariaLabel,
  children,
}: SheetProps) {
  const handleClose = async () => {
    // If onBeforeDismiss provided, check if we should proceed
    if (onBeforeDismiss) {
      const shouldDismiss = await onBeforeDismiss();
      if (!shouldDismiss) return;  // Block dismiss
    }
    
    onClose();
  };
  
  return (
    <Drawer
      open={isOpen}
      onClose={handleClose}  // ← Use guarded handler
      position="bottom"
      aria-label={ariaLabel}
    >
      {children}
    </Drawer>
  );
}
```

---

### **Step 4: Optional Gesture Enhancement**

```tsx
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

export function Sheet({
  isOpen,
  onClose,
  enableGestures = false,  // ← Opt-in
  ...props
}: SheetProps) {
  // If gestures disabled, use Flowbite Drawer
  if (!enableGestures) {
    return <FlowbiteDrawer {...props} />;
  }
  
  // Gesture-enhanced version
  const [{ y }, api] = useSpring(() => ({ y: 0 }));
  
  const bind = useDrag(({ last, velocity: [, vy], direction: [, dy], movement: [, my] }) => {
    // If dragged down past threshold, dismiss
    if (last && (my > 100 || (vy > 0.5 && dy > 0))) {
      onClose();
    } else if (last) {
      api.start({ y: 0 });  // Snap back
    } else {
      api.start({ y: my });  // Follow drag
    }
  });
  
  return (
    <animated.div
      {...bind()}
      style={{
        transform: y.to(y => `translateY(${Math.max(0, y)}px)`),
        touchAction: 'none',
      }}
    >
      <FlowbiteDrawer {...props} />
    </animated.div>
  );
}
```

---

## **What We Built**

### **Base (Flowbite-only)**
- ✅ Bottom-anchored drawer
- ✅ Backdrop + focus trap + ESC
- ✅ `onBeforeDismiss` hook
- ✅ SKIN tokens
- ✅ 0 external engines

### **Enhanced (Optional)**
- ✅ Drag-to-dismiss gesture
- ✅ Velocity-aware (fast flick dismisses)
- ✅ Snap-back animation
- ✅ Behind `enableGestures` flag

---

## **Usage**

### **Basic (Flowbite-only)**

```tsx
<Sheet 
  isOpen={open} 
  onClose={() => setOpen(false)}
  ariaLabel="Select options"
>
  <Sheet.Header>Options</Sheet.Header>
  <Sheet.Body>
    <button>Option 1</button>
    <button>Option 2</button>
  </Sheet.Body>
</Sheet>
```

### **With Gestures**

```tsx
<Sheet 
  isOpen={open} 
  onClose={() => setOpen(false)}
  enableGestures  // ← Opt-in
  ariaLabel="Select options"
>
  Content
</Sheet>
```

### **With Guard**

```tsx
<Sheet 
  isOpen={open} 
  onClose={() => setOpen(false)}
  onBeforeDismiss={async () => {
    const hasUnsaved = checkForUnsavedChanges();
    if (hasUnsaved) {
      return await confirmDiscard();  // Show confirm dialog
    }
    return true;  // Allow dismiss
  }}
  ariaLabel="Edit form"
>
  <form>...</form>
</Sheet>
```

---

## **API**

```tsx
interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;  // Required (a11y)
  
  // Optional
  onBeforeDismiss?: () => Promise<boolean> | boolean;
  enableGestures?: boolean;  // Default: false
  variant?: SheetVariant;  // SKIN variant
  children: React.ReactNode;
}
```

---

## **Decision: Flowbite First**

**Why not just use react-spring-bottom-sheet?**

1. **Flowbite covers 90%** - backdrop, focus trap, ESC, ARIA
2. **Simpler** - No external engine for base case
3. **Optional enhancement** - Gestures are opt-in, not required
4. **Stable API** - Engine can be swapped without breaking consumers

**When to enable gestures:**
- Mobile-first apps
- Heavy touch interaction
- User expects "swipe to dismiss"

**When to skip gestures:**
- Desktop-only
- Simple forms/pickers
- Simplicity > delight

---

## **Canary Tests**

```typescript
test('Sheet: Opens and closes', async () => {
  const onClose = vi.fn();
  render(<Sheet isOpen={true} onClose={onClose} ariaLabel="Test" />);
  
  // Press ESC
  await userEvent.keyboard('{Escape}');
  
  expect(onClose).toHaveBeenCalled();
});

test('Sheet: onBeforeDismiss blocks when false', async () => {
  const onClose = vi.fn();
  const onBeforeDismiss = vi.fn(() => false);
  
  render(
    <Sheet 
      isOpen={true} 
      onClose={onClose} 
      onBeforeDismiss={onBeforeDismiss}
      ariaLabel="Test" 
    />
  );
  
  // Try to close
  await userEvent.keyboard('{Escape}');
  
  expect(onBeforeDismiss).toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();  // Blocked!
});

test('Sheet: Drag dismisses when enableGestures', async () => {
  const onClose = vi.fn();
  
  render(
    <Sheet 
      isOpen={true} 
      onClose={onClose} 
      enableGestures
      ariaLabel="Test" 
    />
  );
  
  // Simulate drag down > 100px
  const sheet = screen.getByRole('dialog');
  await userEvent.pointer([
    { target: sheet, coords: { y: 0 } },
    { target: sheet, coords: { y: 150 } },
  ]);
  
  expect(onClose).toHaveBeenCalled();
});
```

---

## **Files**

- `packages/ds/src/fb/Sheet.tsx` - Component
- `packages/ds/src/fb/Sheet.css` - Styles
- `packages/ds/src/fb/Sheet.stories.tsx` - Examples
- `packages/ds/src/registry/skins/sheet.skin.ts` - SKIN map

---

## **Summary**

**Pattern**: Compose from Flowbite Drawer → Add bottom CSS → Add `onBeforeDismiss` → Optional gesture layer

**Result**: 
- ✅ Flowbite-first (covers 90%)
- ✅ Zero engines required for base case
- ✅ Gestures opt-in for enhanced UX
- ✅ Stable API (engine-agnostic)

**Complexity**: Low (Flowbite) → Medium (with gestures)

**When to use**: Any time you need a mobile-optimized overlay that feels like native bottom sheets.
