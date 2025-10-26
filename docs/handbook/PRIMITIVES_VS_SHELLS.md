# Primitives vs Shells - Clear Distinction

**TL;DR:** Primitives = "How" (mechanics). Shells = "What" (structure + contract).

---

## Mental Model

```
┌─────────────────────────────────────────┐
│ PRIMITIVES (Low-Level Mechanics)       │
│ - Overlay positioning (portal, z-index)│
│ - Focus trap (Tab loop, ESC)           │
│ - Backdrop (scrim, click-outside)      │
│ - Scroll lock (prevent body scroll)    │
│ - Floating UI (anchored positioning)   │
│                                         │
│ NO opinions on:                         │
│ ❌ Slots (header/content/footer)       │
│ ❌ Responsive behavior                 │
│ ❌ CSS vars / data attrs               │
│ ❌ Device adaptations                  │
└─────────────────────────────────────────┘
                    ↓ Used by
┌─────────────────────────────────────────┐
│ SHELLS (High-Level Compositions)       │
│ - Slot-based (Header/Content/Footer)   │
│ - CSS variables (--shell-*)            │
│ - Data attributes (data-shell-mode)    │
│ - Responsive (desktop/tablet/mobile)   │
│ - Auto-wiring (useNav, usePanels)      │
│                                         │
│ Built on primitives:                    │
│ ✅ BottomSheet → OverlaySheet         │
│ ✅ ModalShell → OverlayModal           │
│ ✅ DrawerShell → OverlayDrawer         │
│ ✅ PopoverShell → FloatingUI           │
└─────────────────────────────────────────┘
```

---

## Primitives: "How to Build Overlays"

### Purpose
Reusable mechanics for positioning, trapping focus, handling backdrop, etc.

### Characteristics
- **No slots:** Just render children
- **No responsive logic:** Same behavior desktop/mobile
- **No CSS vars:** Don't publish layout state
- **Configurable:** Accept props for positioning, dismissal, etc.

### Examples

#### OverlayCore
```tsx
// primitives/overlay/OverlayCore.tsx
export function OverlayCore({
  children,
  open,
  onClose,
  disableBackdrop = false,
  disableFocusTrap = false,
}: Props) {
  // Portal to body
  // Backdrop click handling
  // Focus trap (Tab loop)
  // ESC key handling
  // Scroll lock
  
  return createPortal(
    <>
      {!disableBackdrop && <Backdrop onClick={onClose} />}
      <div role="dialog" aria-modal="true">
        {children}
      </div>
    </>,
    document.body
  );
}
```

**Usage:** Low-level building block. NOT used directly by apps.

#### OverlaySheet
```tsx
// primitives/overlay/OverlaySheet.tsx
export function OverlaySheet({
  children,
  open,
  anchor = 'bottom',
  snap = false,
}: Props) {
  // Bottom-anchored overlay
  // Drag handle (if snap=true)
  // Snap points (if snap=true)
  // Safe-area aware
  
  return (
    <OverlayCore open={open}>
      <div className="overlay-sheet" data-anchor={anchor}>
        {children}
      </div>
    </OverlayCore>
  );
}
```

**Usage:** Building block for BottomSheet shell.

#### FloatingUI
```tsx
// primitives/positioning/FloatingUI.tsx
export function FloatingUI({
  anchor,
  children,
  placement = 'bottom',
  offset = 8,
}: Props) {
  // Compute position relative to anchor
  // Auto-flip if collision
  // Arrow positioning
  // Update on scroll/resize
  
  return (
    <div
      ref={floating}
      style={{
        position: 'absolute',
        top: y ?? 0,
        left: x ?? 0,
      }}
    >
      {children}
    </div>
  );
}
```

**Usage:** Building block for PopoverShell.

---

## Shells: "What to Build"

### Purpose
High-level compositions that provide slots, responsive behavior, and contracts.

### Characteristics
- **Slot-based:** Header/Content/Footer (or custom slots)
- **CSS variables:** Publish layout state (`--shell-*`)
- **Data attributes:** Publish device state (`data-shell-mode`)
- **Responsive:** Adapt based on `useAppEnvironment()`
- **Auto-wiring:** Context hooks (`useNav`, `usePanels`)

### Examples

#### BottomSheet
```tsx
// shell/micro/BottomSheet.tsx
export function BottomSheet({
  children,
  open,
  onOpenChange,
  snap = true,
}: Props) {
  const env = useAppEnvironment();
  
  // Uses OverlaySheet primitive
  // Adds slot structure (Header/Content/Footer)
  // Publishes CSS vars (--sheet-snap-point)
  // Responsive footerMode (auto/always/never)
  
  return (
    <OverlaySheet open={open} snap={snap}>
      <div className="bottom-sheet" data-pointer={env.pointer}>
        {children}
      </div>
    </OverlaySheet>
  );
}

BottomSheet.Header = function Header({ children }) {
  return <div className="bottom-sheet-header">{children}</div>;
};

BottomSheet.Content = function Content({ children }) {
  return <div className="bottom-sheet-content">{children}</div>;
};

BottomSheet.Footer = function Footer({ children }) {
  return <div className="bottom-sheet-footer">{children}</div>;
};
```

**Usage:** App developers use this directly.

```tsx
<BottomSheet open={open} onOpenChange={setOpen}>
  <BottomSheet.Header>
    <h2>Filter Options</h2>
  </BottomSheet.Header>
  <BottomSheet.Content>
    <FilterForm />
  </BottomSheet.Content>
  <BottomSheet.Footer>
    <Button onClick={apply}>Apply</Button>
  </BottomSheet.Footer>
</BottomSheet>
```

#### ModalShell
```tsx
// shell/micro/ModalShell.tsx
export function ModalShell({
  children,
  open,
  onClose,
  size = 'md',
}: Props) {
  const env = useAppEnvironment();
  
  // Uses OverlayModal primitive (centered)
  // Adds slot structure (Header/Body/Actions)
  // Publishes CSS vars (--modal-width)
  // Responsive: Full-screen on mobile, centered on desktop
  
  return (
    <OverlayModal open={open} onClose={onClose}>
      <div
        className="modal-shell"
        data-size={size}
        data-shell-mode={env.mode}
      >
        {children}
      </div>
    </OverlayModal>
  );
}

ModalShell.Header = function Header({ children }) {
  return <div className="modal-shell-header">{children}</div>;
};

ModalShell.Body = function Body({ children }) {
  return <div className="modal-shell-body">{children}</div>;
};

ModalShell.Actions = function Actions({ children }) {
  return <div className="modal-shell-actions">{children}</div>;
};
```

**Usage:**
```tsx
<ModalShell open={open} onClose={onClose} size="lg">
  <ModalShell.Header>
    <h2>Confirm Delete</h2>
  </ModalShell.Header>
  <ModalShell.Body>
    <p>Are you sure you want to delete this item?</p>
  </ModalShell.Body>
  <ModalShell.Actions>
    <Button color="light" onClick={onClose}>Cancel</Button>
    <Button color="danger" onClick={onDelete}>Delete</Button>
  </ModalShell.Actions>
</ModalShell>
```

---

## Comparison Table

| Aspect | Primitives | Shells |
|--------|-----------|--------|
| **Purpose** | Reusable mechanics | Opinionated compositions |
| **Slots** | No (just render children) | Yes (Header/Content/Footer) |
| **CSS Vars** | No | Yes (`--shell-*`) |
| **Data Attrs** | No | Yes (`data-shell-mode`) |
| **Responsive** | No (same behavior) | Yes (adapts to device) |
| **Hooks** | No | Yes (`useNav`, `usePanels`) |
| **Examples** | OverlayCore, FloatingUI | BottomSheet, ModalShell |
| **Who Uses** | Shell implementers | App developers |

---

## When to Create a Primitive

**Create a primitive when:**
- ✅ You need **reusable mechanics** (focus trap, positioning, backdrop)
- ✅ Multiple shells will use it (e.g., OverlayCore → BottomSheet + ModalShell)
- ✅ It's **device-agnostic** (same behavior desktop/mobile)
- ✅ It's **unopinionated** (no slots, no responsive logic)

**Examples:**
- Focus trap logic
- Overlay backdrop & portal
- Anchored positioning (FloatingUI)
- Scroll lock mechanism
- Outside-click detection

---

## When to Create a Shell

**Create a shell when:**
- ✅ You need a **high-level composition** (slots, responsive, contract)
- ✅ App developers will use it **directly**
- ✅ It adapts to **device context** (desktop/tablet/mobile)
- ✅ It publishes **layout state** (CSS vars, data attrs)

**Examples:**
- BottomSheet (bottom drawer with slots)
- ModalShell (centered dialog with slots)
- DrawerShell (side panel with slots)
- AppShell (global layout with slots)

---

## Directory Structure

```
packages/ds/src/
├── primitives/           ← Low-level mechanics
│   ├── overlay/
│   │   ├── OverlayCore.tsx
│   │   ├── OverlaySheet.tsx
│   │   ├── OverlayModal.tsx
│   │   └── OverlayDrawer.tsx
│   └── positioning/
│       └── FloatingUI.tsx
│
├── shell/                ← High-level compositions
│   ├── macro/
│   │   ├── AppShell/
│   │   ├── PageShell/
│   │   └── NavShell/
│   └── micro/
│       ├── BottomSheet/     # Uses primitives/OverlaySheet
│       ├── ModalShell/      # Uses primitives/OverlayModal
│       ├── DrawerShell/     # Uses primitives/OverlayDrawer
│       └── PopoverShell/    # Uses primitives/FloatingUI
```

---

## Import Patterns

### App Developers (Use Shells)
```tsx
// ✅ Import shells (high-level)
import { BottomSheet, ModalShell } from '@intstudio/ds';

<BottomSheet>
  <BottomSheet.Header>Title</BottomSheet.Header>
  <BottomSheet.Content>Content</BottomSheet.Content>
</BottomSheet>
```

### Shell Implementers (Use Primitives)
```tsx
// ✅ Import primitives (low-level)
import { OverlaySheet } from '@intstudio/ds/primitives';

export function BottomSheet(props) {
  return (
    <OverlaySheet {...primitiveProps}>
      {/* Add slot structure */}
    </OverlaySheet>
  );
}
```

### ❌ Don't Do This
```tsx
// ❌ App developers should NOT import primitives directly
import { OverlaySheet } from '@intstudio/ds/primitives';

// Use shells instead:
import { BottomSheet } from '@intstudio/ds';
```

---

## Migration from Current State

### Current (Confusing)
```tsx
// Is this a primitive or shell?
import { Sheet } from '@intstudio/ds';
```

### Proposed (Clear)
```tsx
// Shell (high-level, app developers use this)
import { BottomSheet } from '@intstudio/ds';

// Primitive (low-level, only shell implementers use this)
import { OverlaySheet } from '@intstudio/ds/primitives';
```

---

## Key Takeaways

1. **Primitives = "How"** (mechanics, reusable, unopinionated)
2. **Shells = "What"** (compositions, slots, responsive, contracts)
3. **App developers use shells**, not primitives
4. **Shell implementers use primitives** to build shells
5. **Directory structure reflects this**: `primitives/` vs `shell/`

**Motto:** "Shells compose primitives. Apps compose shells."
